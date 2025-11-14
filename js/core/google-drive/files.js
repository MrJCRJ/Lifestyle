(function (global) {
  const session = global.GoogleDriveSession;
  const configProvider = global.GoogleDriveConfig;
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

  async function pushData() {
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

    const payload = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      appName: 'Lifestyle App',
      userData: global.appState?.userData
    };

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
        return pushData();
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
    let response;

    try {
      response = await global.gapi.client.drive.files.get({
        fileId,
        alt: 'media'
      });
    } catch (error) {
      if (error.status === 404) {
        console.log('Arquivo não existe no Drive, criando...');
        clearFileId();
        await pushData();
        return true;
      }
      throw error;
    }

    if (!response.body) {
      await pushData();
      return true;
    }

    const driveData = JSON.parse(response.body);
    if (!driveData.userData) {
      return false;
    }

    const driveDate = new Date(driveData.exportDate);
    const localDataStr = localStorage.getItem('lifestyleData');

    if (localDataStr) {
      try {
        const localData = JSON.parse(localDataStr);
        const localLastModified = new Date(localData.lastModified || 0);
        if (localLastModified > driveDate) {
          console.log('Dados locais mais recentes, enviando para o Drive...');
          await pushData();
          return true;
        }
      } catch (error) {
        console.warn('Não foi possível comparar dados locais com os dados do Drive', error);
      }
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

    await pushData();
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
