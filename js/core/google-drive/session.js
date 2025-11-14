(function (global) {
  const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
  const loader = global.GoogleDriveLoader;
  const {
    state,
    setAuthenticated,
    setAccessToken,
    clearSession,
    setUserEmail
  } = global.GoogleDriveState;

  function requestAccessToken(forcePrompt = false) {
    return new Promise((resolve, reject) => {
      loader.ensureLibraries().then(() => {
        let tokenClient = loader.getTokenClient();
        if (!tokenClient) {
          tokenClient = loader.initGoogleIdentityClient();
        }

        tokenClient.callback = response => {
          if (response.error) {
            reject(response);
            return;
          }

          setAuthenticated(true);
          setAccessToken(response.access_token, response.expires_in);
          global.gapi.client.setToken({ access_token: response.access_token });
          resolve(response);
        };

        try {
          tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    });
  }

  async function ensureSession({ promptUser = false } = {}) {
    await loader.ensureLibraries();

    if (!state.isAuthenticated) {
      if (!promptUser) {
        return false;
      }

      await requestAccessToken(true);
      await fetchUserInfo();
      return true;
    }

    if (state.tokenExpiresAt && Date.now() >= (state.tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS)) {
      try {
        await requestAccessToken(false);
      } catch (error) {
        console.warn('Não foi possível renovar o token automaticamente:', error);
        setAuthenticated(false);
        setAccessToken(null, null);
        return promptUser ? ensureSession({ promptUser: true }) : false;
      }
    }

    return true;
  }

  async function fetchUserInfo() {
    try {
      const response = await global.gapi.client.drive.about.get({
        fields: 'user(emailAddress, displayName)'
      });

      if (response.result && response.result.user) {
        setUserEmail(response.result.user.emailAddress || response.result.user.displayName);
      }
    } catch (error) {
      console.warn('Não foi possível obter informações do usuário', error);
    }
  }

  function revokeToken() {
    if (state.accessToken && global.google?.accounts?.oauth2) {
      global.google.accounts.oauth2.revoke(state.accessToken, () => {
        console.log('Token do Google Drive revogado');
      });
    }

    global.gapi?.client?.setToken(null);
    clearSession();
  }

  global.GoogleDriveSession = {
    ensureSession,
    fetchUserInfo,
    requestAccessToken,
    revokeToken
  };
})(window);
