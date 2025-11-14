(function (global) {
  const session = global.GoogleDriveSession;
  const configProvider = global.GoogleDriveConfig;
  const conflictResolver = global.GoogleDriveConflictResolver;
  const {
    state,
    setFileId,
    clearFileId,
    setLastSync
  } = global.GoogleDriveState;

  function emitUIUpdate() {
    document.dispatchEvent(new CustomEvent('googleDrive:update-ui'));
  }

  function buildDriveFileLink(fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
  }

  function logFileLocation(action, fileId) {
    if (!fileId) {
      return;
    }
    console.info(`[GoogleDrive] ${action}: ${fileId} → ${buildDriveFileLink(fileId)}`);
  }

  function getLocalSnapshot() {
    const saved = localStorage.getItem('lifestyleData');
    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Não foi possível interpretar os dados locais para comparação com o Drive', error);
      return null;
    }
  }

  function summarizeForConflict(data, fallbackDate) {
    if (!conflictResolver) {
      return null;
    }

    const payload = {
      userData: data?.userData,
      lastModified: data?.lastModified || data?.exportDate || fallbackDate || null
    };

    return conflictResolver.summarize(payload);
  }

  function shouldPromptConflict(driveSummary, localSummary) {
    if (!conflictResolver || !driveSummary || !localSummary) {
      return false;
    }
    return conflictResolver.shouldResolveConflict(driveSummary, localSummary);
  }

  async function downloadDriveData(fileId) {
    const response = await global.gapi.client.drive.files.get({
      fileId,
      alt: 'media'
    });
    if (!response.body) {
      return null;
    }
    return JSON.parse(response.body);
  }

  async function ensureValidFileId() {
    if (!state.fileId) {
      return false;
    }

    try {
      await global.gapi.client.drive.files.get({
        fileId: state.fileId,
        fields: 'id'
      });
      return true;
    } catch (error) {
      if (error.status === 404) {
        console.warn('Arquivo salvo anteriormente não encontrado, recriando...');
        clearFileId();
        return false;
      }
      throw error;
    }
  }

  async function searchFile() {
    const config = configProvider.get();
    const queries = [
      {
        spaces: 'drive',
        fields: 'files(id, name, parents)',
        q: `name='${config.FILE_NAME}' and trashed=false`,
        isAppData: false
      },
      {
        spaces: 'appDataFolder',
        fields: 'files(id, name, parents)',
        q: `name='${config.FILE_NAME}'`,
        isAppData: true
      }
    ];

    for (const query of queries) {
      try {
        const response = await global.gapi.client.drive.files.list(query);
        if (response.result.files && response.result.files.length > 0) {
          const foundFile = response.result.files[0];
          const foundId = foundFile.id;
          setFileId(foundId);
          logFileLocation('Arquivo encontrado no Drive', foundId);
          return foundId;
        }
      } catch (error) {
        console.warn('Busca de arquivo falhou (continuando com fallback):', error);
      }
    }

    return null;
  }

  async function createFile() {
    const config = configProvider.get();

    try {
      const response = await global.gapi.client.drive.files.create({
        resource: {
          name: config.FILE_NAME,
          mimeType: 'application/json'
        },
        fields: 'id'
      });

      if (response.result && response.result.id) {
        setFileId(response.result.id);
        logFileLocation('Arquivo criado no Drive', response.result.id);
        return response.result.id;
      }
    } catch (error) {
      console.error('Criação de arquivo no Google Drive falhou', error);
      throw error;
    }

    throw new Error('Não foi possível criar o arquivo no Google Drive');
  }

  async function findOrCreateFile() {
    await session.ensureSession({ promptUser: false });

    if (await ensureValidFileId()) {
      return state.fileId;
    }

    const existingId = await searchFile();
    if (existingId) {
      return existingId;
    }

    return createFile();
  }

  async function pushData(options = {}) {
    const { skipConflictCheck = false } = options;
    if (!state.isAuthenticated) {
      return false;
    }

    const ready = await session.ensureSession({ promptUser: false });
    if (!ready) {
      console.warn('Push ignorado: sessão não autenticada');
      return false;
    }

    const fileId = await findOrCreateFile();
    const config = configProvider.get();

    const exportDate = new Date().toISOString();
    const payload = {
      exportDate,
      version: '2.0',
      appName: 'Lifestyle App',
      userData: global.appState?.userData
    };

    if (!skipConflictCheck && conflictResolver) {
      try {
        const currentDriveData = await downloadDriveData(fileId);
        const driveSummary = summarizeForConflict(currentDriveData);
        const localSummary = summarizeForConflict(payload, exportDate);

        if (shouldPromptConflict(driveSummary, localSummary) && driveSummary.lastModified > localSummary.lastModified) {
          const choice = conflictResolver.promptResolution({
            driveSummary,
            localSummary,
            context: 'push'
          });

          if (choice === 'drive') {
            console.info('Sincronização cancelada: usuário preferiu manter os dados atuais do Google Drive.');
            return false;
          }
        }
      } catch (error) {
        console.warn('Não foi possível comparar o arquivo do Drive antes do envio. Continuando com o push.', error);
      }
    }

    let response;

    try {
      response = await global.gapi.client.drive.files.update({
        fileId,
        fields: 'id, modifiedTime',
        resource: {
          name: config.FILE_NAME,
          mimeType: 'application/json'
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(payload)
        }
      });
    } catch (error) {
      if (error.status === 404) {
        console.warn('Arquivo do Drive não encontrado durante upload. Tentando recriar...');
        clearFileId();
        return pushData({ skipConflictCheck });
      }
      throw error;
    }

    setLastSync(new Date());
    emitUIUpdate();
    logFileLocation('Dados enviados para o Google Drive', fileId);
    console.info('Dados enviados para o Google Drive. Última modificação:', response.result?.modifiedTime);
    return true;
  }

  async function pullData() {
    if (!state.isAuthenticated) {
      return false;
    }

    const ready = await session.ensureSession({ promptUser: false });
    if (!ready) {
      console.warn('Pull ignorado: sessão não autenticada');
      return false;
    }

    const fileId = await findOrCreateFile();
    let driveData;

    try {
      driveData = await downloadDriveData(fileId);
    } catch (error) {
      if (error.status === 404) {
        console.log('Arquivo não existe no Drive, criando...');
        clearFileId();
        await pushData({ skipConflictCheck: true });
        return true;
      }
      throw error;
    }

    if (!driveData) {
      await pushData({ skipConflictCheck: true });
      return true;
    }

    if (!driveData.userData) {
      return false;
    }

    const localSnapshot = getLocalSnapshot();
    const driveSummary = summarizeForConflict(driveData);
    const localSummary = summarizeForConflict(localSnapshot);

    if (shouldPromptConflict(driveSummary, localSummary)) {
      const choice = conflictResolver.promptResolution({
        driveSummary,
        localSummary,
        context: 'pull'
      });

      if (choice === 'local') {
        console.info('Usuário optou por manter os dados locais. Enviando para o Google Drive...');
        await pushData({ skipConflictCheck: true });
        return true;
      }
    } else if (localSummary?.lastModified && driveSummary?.lastModified && localSummary.lastModified > driveSummary.lastModified) {
      console.log('Dados locais mais recentes detectados automaticamente, enviando para o Drive...');
      await pushData({ skipConflictCheck: true });
      return true;
    }

    if (driveData.userData) {
      global.appState.userData = driveData.userData;
      if (typeof global.saveToStorage === 'function') {
        global.saveToStorage();
      }
      setLastSync(new Date());
      emitUIUpdate();
      console.log('Dados sincronizados do Google Drive');
    }

    return true;
  }

  async function resetBackup() {
    if (!state.isAuthenticated) {
      throw new Error('Usuário não autenticado no Google Drive');
    }

    const ready = await session.ensureSession({ promptUser: true });
    if (!ready) {
      throw new Error('Não foi possível confirmar a sessão com o Google Drive');
    }

    if (state.fileId) {
      try {
        await global.gapi.client.drive.files.delete({
          fileId: state.fileId
        });
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }
      clearFileId();
    }

    await pushData({ skipConflictCheck: true });
    logFileLocation('Backup recriado no Google Drive', state.fileId);
    return true;
  }

  global.GoogleDriveFiles = {
    findOrCreateFile,
    pushData,
    pullData,
    resetBackup
  };
})(window);
