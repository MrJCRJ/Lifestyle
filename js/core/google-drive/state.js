(function (global) {
  const STORAGE_KEYS = {
    autoSync: 'googleDrive_autoSync',
    lastSync: 'googleDrive_lastSync',
    fileId: 'googleDrive_fileId',
    wasConnected: 'googleDrive_wasConnected'
  };

  const SESSION_KEYS = {
    accessToken: 'googleDrive_sessionToken',
    tokenExpiresAt: 'googleDrive_sessionTokenExpiresAt'
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
    wasConnected: false
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

      const savedConnection = localStorage.getItem(STORAGE_KEYS.wasConnected);
      state.wasConnected = savedConnection === 'true';
      hydrateSessionToken();
    } catch (error) {
      console.warn('[DriveState] Falha ao carregar preferências do localStorage', error);
    }
  }

  function hydrateSessionToken() {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      const cachedToken = sessionStorage.getItem(SESSION_KEYS.accessToken);
      const cachedExpiry = sessionStorage.getItem(SESSION_KEYS.tokenExpiresAt);

      if (!cachedToken || !cachedExpiry) {
        return;
      }

      const expiresAt = Number(cachedExpiry);
      if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
        clearPersistedSessionToken();
        return;
      }

      state.accessToken = cachedToken;
      state.tokenExpiresAt = expiresAt;
      state.isAuthenticated = true;
      state.wasConnected = true;
    } catch (error) {
      console.warn('[DriveState] Não foi possível restaurar token do Google Drive', error);
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

  function setWasConnected(value) {
    state.wasConnected = Boolean(value);
    persist(STORAGE_KEYS.wasConnected, state.wasConnected ? 'true' : null);
  }

  function setAuthenticated(isAuthenticated) {
    state.isAuthenticated = Boolean(isAuthenticated);
    if (state.isAuthenticated) {
      setWasConnected(true);
    }
    requestRender();
  }

  function setAccessToken(token, expiresInSeconds) {
    state.accessToken = token || null;
    if (token && expiresInSeconds) {
      state.tokenExpiresAt = Date.now() + Number(expiresInSeconds) * 1000;
    } else {
      state.tokenExpiresAt = null;
    }
    persistSessionToken(state.accessToken, state.tokenExpiresAt);
  }

  function clearSession() {
    state.isAuthenticated = false;
    state.accessToken = null;
    state.tokenExpiresAt = null;
    state.userEmail = null;
    state.lastSync = null;
    state.fileId = null;
    state.autoSync = true;
    setWasConnected(false);
    persist(STORAGE_KEYS.lastSync, null);
    persist(STORAGE_KEYS.fileId, null);
    persist(STORAGE_KEYS.autoSync, null);
    clearPersistedSessionToken();
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

  function persistSessionToken(token, expiresAt) {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      if (token && expiresAt) {
        sessionStorage.setItem(SESSION_KEYS.accessToken, token);
        sessionStorage.setItem(SESSION_KEYS.tokenExpiresAt, String(expiresAt));
      } else {
        clearPersistedSessionToken();
      }
    } catch (error) {
      console.warn('[DriveState] Não foi possível salvar token do Google Drive', error);
    }
  }

  function clearPersistedSessionToken() {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(SESSION_KEYS.accessToken);
      sessionStorage.removeItem(SESSION_KEYS.tokenExpiresAt);
    } catch (error) {
      console.warn('[DriveState] Não foi possível limpar token em cache', error);
    }
  }

  hydrateFromStorage();

  global.GoogleDriveState = {
    state,
    STORAGE_KEYS,
    setAutoSync,
    setLastSync,
    setFileId,
    clearFileId,
    setWasConnected,
    setAuthenticated,
    setAccessToken,
    clearSession,
    markClientLoaded,
    setUserEmail,
    requestRender
  };
})(window);
