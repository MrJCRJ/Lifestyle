(function (global) {
  const STORAGE_KEYS = {
    autoSync: 'googleDrive_autoSync',
    lastSync: 'googleDrive_lastSync',
    fileId: 'googleDrive_fileId',
    folderId: 'googleDrive_folderId'
  };

  const state = {
    isAuthenticated: false,
    fileId: null,
    lastSync: null,
    autoSync: true,
    userEmail: null,
    isLoaded: false,
    accessToken: null,
    tokenExpiresAt: null,
    folderId: null
  };

  function hydrateFromStorage() {
    try {
      const savedAutoSync = localStorage.getItem(STORAGE_KEYS.autoSync);
      if (savedAutoSync !== null) {
        state.autoSync = savedAutoSync === 'true';
      }

      const savedLastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
      if (savedLastSync) {
        state.lastSync = new Date(savedLastSync);
      }

      const savedFileId = localStorage.getItem(STORAGE_KEYS.fileId);
      if (savedFileId) {
        state.fileId = savedFileId;
      }

      const savedFolderId = localStorage.getItem(STORAGE_KEYS.folderId);
      if (savedFolderId) {
        state.folderId = savedFolderId;
      }
    } catch (error) {
      console.warn('[DriveState] Falha ao carregar preferências do localStorage', error);
    }
  }

  function persist(key, value) {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`[DriveState] Falha ao persistir ${key}`, error);
    }
  }

  function setAutoSync(enabled) {
    state.autoSync = Boolean(enabled);
    persist(STORAGE_KEYS.autoSync, state.autoSync.toString());
    requestRender();
  }

  function setLastSync(date) {
    state.lastSync = date instanceof Date ? date : date ? new Date(date) : null;
    persist(STORAGE_KEYS.lastSync, state.lastSync ? state.lastSync.toISOString() : null);
    requestRender();
  }

  function setFileId(id) {
    state.fileId = id;
    if (id) {
      persist(STORAGE_KEYS.fileId, id);
    } else {
      persist(STORAGE_KEYS.fileId, null);
    }
  }

  function clearFileId() {
    state.fileId = null;
    persist(STORAGE_KEYS.fileId, null);
  }

  function setFolderId(id) {
    state.folderId = id || null;
    persist(STORAGE_KEYS.folderId, state.folderId);
  }

  function clearFolderId() {
    state.folderId = null;
    persist(STORAGE_KEYS.folderId, null);
  }

  function setAuthenticated(isAuthenticated) {
    state.isAuthenticated = Boolean(isAuthenticated);
    requestRender();
  }

  function setAccessToken(token, expiresInSeconds) {
    state.accessToken = token || null;
    if (token && expiresInSeconds) {
      state.tokenExpiresAt = Date.now() + Number(expiresInSeconds) * 1000;
    } else {
      state.tokenExpiresAt = null;
    }
  }

  function clearSession() {
    state.isAuthenticated = false;
    state.accessToken = null;
    state.tokenExpiresAt = null;
    state.userEmail = null;
    state.lastSync = null;
    state.fileId = null;
    state.autoSync = true;
    state.folderId = null;
    persist(STORAGE_KEYS.lastSync, null);
    persist(STORAGE_KEYS.fileId, null);
    persist(STORAGE_KEYS.autoSync, null);
    persist(STORAGE_KEYS.folderId, null);
    requestRender();
  }

  function markClientLoaded() {
    state.isLoaded = true;
  }

  function setUserEmail(email) {
    state.userEmail = email || null;
    requestRender();
  }

  function requestRender() {
    document.dispatchEvent(new CustomEvent('googleDrive:update-ui'));
  }

  hydrateFromStorage();

  global.GoogleDriveState = {
    state,
    STORAGE_KEYS,
    setAutoSync,
    setLastSync,
    setFileId,
    clearFileId,
    setFolderId,
    clearFolderId,
    setAuthenticated,
    setAccessToken,
    clearSession,
    markClientLoaded,
    setUserEmail,
    requestRender
  };
})(window);
