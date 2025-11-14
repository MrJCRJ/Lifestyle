(function (global) {
  const configProvider = global.GoogleDriveConfig;
  const { markClientLoaded } = global.GoogleDriveState;

  let gapiPromise = null;
  let gisPromise = null;
  let initPromise = null;
  let tokenClient = null;

  function loadExternalScript(src, id) {
    return new Promise((resolve, reject) => {
      if (id && document.getElementById(id)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      if (id) {
        script.id = id;
      }
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
      document.body.appendChild(script);
    });
  }

  function ensureGapiLoaded() {
    if (global.gapi && global.gapi.client) {
      return Promise.resolve();
    }

    if (!gapiPromise) {
      gapiPromise = loadExternalScript('https://apis.google.com/js/api.js', 'google-api-script')
        .then(() => new Promise((resolve, reject) => {
          global.gapi.load('client', {
            callback: resolve,
            onerror: () => reject(new Error('Falha ao inicializar gapi.client'))
          });
        }));
    }

    return gapiPromise;
  }

  function ensureGoogleIdentityLoaded() {
    if (global.google && global.google.accounts && global.google.accounts.oauth2) {
      return Promise.resolve();
    }

    if (!gisPromise) {
      gisPromise = loadExternalScript('https://accounts.google.com/gsi/client', 'google-identity-script');
    }

    return gisPromise;
  }

  function initGoogleDriveClient() {
    const config = configProvider.get();
    const clientConfig = {
      discoveryDocs: config.DISCOVERY_DOCS
    };

    if (config.API_KEY && config.API_KEY !== 'SUA_API_KEY_AQUI') {
      clientConfig.apiKey = config.API_KEY;
    }

    return global.gapi.client.init(clientConfig).then(() => {
      markClientLoaded();
    });
  }

  function initGoogleIdentityClient() {
    const config = configProvider.get();

    if (!global.google || !global.google.accounts || !global.google.accounts.oauth2) {
      throw new Error('Google Identity Services não disponível');
    }

    tokenClient = global.google.accounts.oauth2.initTokenClient({
      client_id: config.CLIENT_ID,
      scope: config.SCOPES,
      callback: () => { }
    });

    return tokenClient;
  }

  function ensureLibraries() {
    if (global.GoogleDriveState.state.isLoaded && tokenClient) {
      return Promise.resolve();
    }

    if (!initPromise) {
      initPromise = Promise.all([ensureGapiLoaded(), ensureGoogleIdentityLoaded()])
        .then(() => initGoogleDriveClient())
        .then(() => initGoogleIdentityClient())
        .catch(error => {
          initPromise = null;
          throw error;
        });
    }

    return initPromise;
  }

  function getTokenClient() {
    return tokenClient;
  }

  function resetTokenClient() {
    tokenClient = null;
  }

  global.GoogleDriveLoader = {
    ensureLibraries,
    loadExternalScript,
    getTokenClient,
    initGoogleIdentityClient,
    resetTokenClient
  };
})(window);
