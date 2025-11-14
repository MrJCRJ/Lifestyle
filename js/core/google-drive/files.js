(function (global) {
  const DEFAULT_BACKUP_FOLDER_NAME = 'Lifestyle Backups';
  const session = global.GoogleDriveSession;
  const configProvider = global.GoogleDriveConfig;
  const {
    state,
    setFileId,
    clearFileId,
    setLastSync,
    setFolderId,
    clearFolderId
  } = global.GoogleDriveState;

  function emitUIUpdate() {
    document.dispatchEvent(new CustomEvent('googleDrive:update-ui'));
  }

  function getBackupFolderName() {
    const config = configProvider.get() || {};
    return config.FOLDER_NAME || DEFAULT_BACKUP_FOLDER_NAME;
  }

  async function ensureBackupFolder() {
    const folderName = getBackupFolderName();
    if (state.folderId) {
      try {
        await global.gapi.client.drive.files.get({
          fileId: state.folderId,
          fields: 'id'
        });
        return state.folderId;
      } catch (error) {
        if (error.status === 404) {
          clearFolderId();
        } else {
          throw error;
        }
      }
    }

    const searchQuery = {
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    };

    try {
      const response = await global.gapi.client.drive.files.list(searchQuery);
      if (response.result.files && response.result.files.length > 0) {
        const folderId = response.result.files[0].id;
        setFolderId(folderId);
        return folderId;
      }
    } catch (error) {
      console.warn('Não foi possível localizar a pasta de backups. Tentando criar uma nova...', error);
    }

    const createResponse = await global.gapi.client.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['root']
      },
      fields: 'id'
    });

    if (!createResponse.result || !createResponse.result.id) {
      throw new Error('Não foi possível criar a pasta de backups no Google Drive');
    }

    setFolderId(createResponse.result.id);
    return createResponse.result.id;
  }

  async function moveFileToBackupFolder(fileId, parents = []) {
    try {
      const folderId = await ensureBackupFolder();
      const folderName = getBackupFolderName();
      const request = {
        fileId,
        addParents: folderId,
        fields: 'id, parents'
      };

      if (parents && parents.length) {
        request.removeParents = parents.join(',');
      }

      await global.gapi.client.drive.files.update(request);
      console.info(`[GoogleDrive] Arquivo de backup movido para a pasta "${folderName}"`);
      return folderId;
    } catch (error) {
      console.warn('Não foi possível mover o arquivo de backup para a pasta de backups configurada', error);
      return null;
    }
  }

  async function ensureValidFileId() {
    if (!state.fileId) {
      return false;
    }

    try {
      const response = await global.gapi.client.drive.files.get({
        fileId: state.fileId,
        fields: 'id, parents'
      });
      const parents = response.result?.parents || [];
      const isInAppData = parents.includes('appDataFolder');
      const shouldMove = isInAppData || (state.folderId && !parents.includes(state.folderId));
      if (shouldMove) {
        await moveFileToBackupFolder(state.fileId, parents);
      }
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
          const parents = foundFile.parents || [];
          setFileId(foundId);
          const shouldMove = query.isAppData || (state.folderId && !parents.includes(state.folderId));
          if (shouldMove) {
            await moveFileToBackupFolder(foundId, parents);
          }
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
    const folderId = await ensureBackupFolder();

    try {
      const response = await global.gapi.client.drive.files.create({
        resource: {
          name: config.FILE_NAME,
          parents: [folderId],
          mimeType: 'application/json'
        },
        fields: 'id'
      });

      if (response.result && response.result.id) {
        setFileId(response.result.id);
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

  global.GoogleDriveFiles = {
    findOrCreateFile,
    pushData,
    pullData
  };
})(window);
