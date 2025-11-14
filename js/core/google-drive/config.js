(function (global) {
  const FALLBACK_CONFIG = {
    CLIENT_ID: '977777984787-5l6tf7jdsp44fra6fses0kv5hfanem4r.apps.googleusercontent.com',
    API_KEY: '',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata'
    ].join(' '),
    FILE_NAME: 'lifestyle-app-data.json'
  };

  function resolveConfig() {
    if (global.AppEnv && typeof global.AppEnv.getGoogleDriveConfig === 'function') {
      return global.AppEnv.getGoogleDriveConfig();
    }

    return { ...FALLBACK_CONFIG };
  }

  let cachedConfig = null;

  function getConfig() {
    if (!cachedConfig) {
      cachedConfig = resolveConfig();
    }
    return cachedConfig;
  }

  function refreshConfig() {
    cachedConfig = resolveConfig();
    return cachedConfig;
  }

  global.GoogleDriveConfig = {
    get: getConfig,
    refresh: refreshConfig
  };
})(window);
