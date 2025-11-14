// Sincronização com Google Drive

/**
 * INSTRUÇÕES PARA CONFIGURAÇÃO:
 * 1. Copie o arquivo .env.example para .env
 * 2. Acesse https://console.cloud.google.com/
 * 3. Crie um novo projeto ou selecione um existente
 * 4. Ative a Google Drive API
 * 5. Crie credenciais OAuth 2.0 para aplicativo web
 * 6. Adicione sua URL de origem autorizada no Google Cloud Console
 * 7. Preencha as credenciais no arquivo .env
 * 
 * Documentação completa: docs/GOOGLE_DRIVE_SETUP.md
 */

// Carregar configuração das variáveis de ambiente
const GOOGLE_DRIVE_CONFIG = window.AppEnv ? window.AppEnv.getGoogleDriveConfig() : {
  CLIENT_ID: '977777984787-5l6tf7jdsp44fra6fses0kv5hfanem4r.apps.googleusercontent.com',
  API_KEY: '',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  SCOPES: [
    'https://www.googleapis.com/auth/calendar.events.freebusy',
    'https://www.googleapis.com/auth/calendar.freebusy',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.install'
  ].join(' '),
  FILE_NAME: 'lifestyle-app-data.json'
};

// Estado da sincronização
const driveState = {
  isAuthenticated: false,
  fileId: null,
  lastSync: null,
  autoSync: true,
  userEmail: null,
  isLoaded: false,
  accessToken: null,
  tokenExpiresAt: null
};

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
let gapiLoadPromise = null;
let gisLoadPromise = null;
let driveInitPromise = null;
let tokenClientInstance = null;

const savedAutoSync = localStorage.getItem('googleDrive_autoSync');
if (savedAutoSync !== null) {
  driveState.autoSync = savedAutoSync === 'true';
}

const savedLastSync = localStorage.getItem('googleDrive_lastSync');
if (savedLastSync) {
  driveState.lastSync = new Date(savedLastSync);
}

const savedFileId = localStorage.getItem('googleDrive_fileId');
if (savedFileId) {
  driveState.fileId = savedFileId;
}

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
  if (window.gapi && window.gapi.client) {
    return Promise.resolve();
  }

  if (!gapiLoadPromise) {
    gapiLoadPromise = loadExternalScript('https://apis.google.com/js/api.js', 'google-api-script')
      .then(() => new Promise((resolve, reject) => {
        window.gapi.load('client', {
          callback: resolve,
          onerror: () => reject(new Error('Falha ao inicializar gapi.client'))
        });
      }));
  }

  return gapiLoadPromise;
}

function ensureGoogleIdentityLoaded() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    return Promise.resolve();
  }

  if (!gisLoadPromise) {
    gisLoadPromise = loadExternalScript('https://accounts.google.com/gsi/client', 'google-identity-script');
  }

  return gisLoadPromise;
}

/**
 * Carregar Google API Client Library
 */
function loadGoogleDriveAPI() {
  if (driveState.isLoaded && tokenClientInstance) {
    return Promise.resolve();
  }

  if (!driveInitPromise) {
    driveInitPromise = Promise.all([ensureGapiLoaded(), ensureGoogleIdentityLoaded()])
      .then(() => initGoogleDriveClient())
      .then(() => {
        initGoogleIdentityClient();
      })
      .catch(error => {
        driveInitPromise = null;
        throw error;
      });
  }

  return driveInitPromise;
}

/**
 * Inicializar Google Drive Client
 */
function initGoogleDriveClient() {
  const config = {
    discoveryDocs: GOOGLE_DRIVE_CONFIG.DISCOVERY_DOCS
  };

  // API Key é opcional - adicionar somente se configurada
  if (GOOGLE_DRIVE_CONFIG.API_KEY && GOOGLE_DRIVE_CONFIG.API_KEY !== 'SUA_API_KEY_AQUI') {
    config.apiKey = GOOGLE_DRIVE_CONFIG.API_KEY;
  }

  return gapi.client.init(config).then(() => {
    driveState.isLoaded = true;
  });
}

function initGoogleIdentityClient() {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error('Google Identity Services não disponível');
  }

  tokenClientInstance = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
    scope: GOOGLE_DRIVE_CONFIG.SCOPES,
    callback: () => {
      // A callback será definida dinamicamente em requestGoogleAccessToken
    }
  });
}

function requestGoogleAccessToken(forcePrompt = false) {
  return new Promise((resolve, reject) => {
    if (!tokenClientInstance) {
      reject(new Error('Cliente OAuth ainda não inicializado'));
      return;
    }

    tokenClientInstance.callback = response => {
      if (response.error) {
        reject(response);
        return;
      }

      driveState.isAuthenticated = true;
      driveState.accessToken = response.access_token;
      driveState.tokenExpiresAt = response.expires_in
        ? Date.now() + Number(response.expires_in) * 1000
        : null;

      gapi.client.setToken({ access_token: response.access_token });
      resolve(response);
    };

    try {
      tokenClientInstance.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
    } catch (error) {
      reject(error);
    }
  });
}

async function ensureDriveSession({ promptUser = false } = {}) {
  await loadGoogleDriveAPI();

  if (!driveState.isAuthenticated) {
    if (!promptUser) {
      return false;
    }

    await requestGoogleAccessToken(true);
    await fetchGoogleUserInfo();
    updateDriveUI();

    if (driveState.autoSync) {
      googleDrivePullData().catch(error => {
        console.error('Erro ao sincronizar automaticamente após autenticação:', error);
      });
    }

    return true;
  }

  if (driveState.tokenExpiresAt && Date.now() >= (driveState.tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS)) {
    try {
      await requestGoogleAccessToken(false);
    } catch (error) {
      console.warn('Não foi possível renovar o token automaticamente:', error);
      driveState.isAuthenticated = false;
      return promptUser ? ensureDriveSession({ promptUser: true }) : false;
    }
  }

  return true;
}

async function fetchGoogleUserInfo() {
  try {
    const response = await gapi.client.drive.about.get({
      fields: 'user(emailAddress, displayName)'
    });

    if (response.result && response.result.user) {
      driveState.userEmail = response.result.user.emailAddress || response.result.user.displayName;
    }
  } catch (error) {
    console.warn('Não foi possível obter informações do usuário', error);
  }
}

/**
 * Conectar ao Google Drive
 */
async function googleDriveConnect() {
  try {
    showLoading('Carregando Google Drive...');
    await ensureDriveSession({ promptUser: true });
    await fetchGoogleUserInfo();
    hideLoading();

    updateDriveUI();
    showNotification('✅ Conectado ao Google Drive com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao conectar ao Google Drive:', error);

    if (error?.error === 'access_denied') {
      showNotification('❌ Conexão cancelada pelo usuário', 'error');
    } else if (error?.type === 'tokenFailed') {
      showNotification('❌ O Google retornou um erro de token. Confirme se as origens autorizadas no Google Cloud Console incluem este domínio.', 'error');
    } else {
      showNotification('❌ Erro ao conectar ao Google Drive', 'error');
    }
  } finally {
    hideLoading();
  }
}

/**
 * Desconectar do Google Drive
 */
function googleDriveDisconnect() {
  if (!confirm('Deseja realmente desconectar do Google Drive?\n\nIsso não excluirá seus dados, apenas desconectará a sincronização.')) {
    return;
  }

  try {
    if (driveState.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(driveState.accessToken, () => {
        console.log('Token do Google Drive revogado');
      });
    }

    gapi.client.setToken(null);

    // Limpar dados salvos
    localStorage.removeItem('googleDrive_autoSync');
    localStorage.removeItem('googleDrive_lastSync');
    localStorage.removeItem('googleDrive_fileId');

    driveState.fileId = null;
    driveState.lastSync = null;
    driveState.userEmail = null;
    driveState.isAuthenticated = false;
    driveState.accessToken = null;
    driveState.tokenExpiresAt = null;

    showNotification('✅ Desconectado do Google Drive', 'success');
    updateDriveUI();
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    showNotification('❌ Erro ao desconectar', 'error');
  }
}

/**
 * Sincronizar agora (manual)
 */
async function googleDriveSyncNow() {
  if (!driveState.isAuthenticated) {
    showNotification('❌ Você precisa estar conectado ao Google Drive', 'error');
    return;
  }

  try {
    showLoading('Sincronizando...');

    const ready = await ensureDriveSession({ promptUser: true });
    if (!ready) {
      throw new Error('Não foi possível confirmar a sessão com o Google Drive');
    }

    // Primeiro puxar dados do Drive
    await googleDrivePullData();

    // Depois enviar dados locais (caso haja alterações)
    await googleDrivePushData();

    hideLoading();
    showNotification('✅ Sincronização concluída!', 'success');
  } catch (error) {
    hideLoading();
    console.error('Erro na sincronização:', error);
    showNotification('❌ Erro na sincronização', 'error');
  }
}

/**
 * Buscar ou criar arquivo no Google Drive
 */
async function findOrCreateDriveFile() {
  try {
    const ready = await ensureDriveSession({ promptUser: false });
    if (!ready) {
      throw new Error('Sessão do Google Drive indisponível');
    }

    if (driveState.fileId) {
      return driveState.fileId;
    }

    const searchStrategies = [
      () => gapi.client.drive.files.list({
        q: `name='${GOOGLE_DRIVE_CONFIG.FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)'
      }),
      () => gapi.client.drive.files.list({
        q: `name='${GOOGLE_DRIVE_CONFIG.FILE_NAME}'`,
        spaces: 'appDataFolder',
        fields: 'files(id, name)'
      })
    ];

    for (const search of searchStrategies) {
      try {
        const response = await search();
        if (response.result.files && response.result.files.length > 0) {
          driveState.fileId = response.result.files[0].id;
          localStorage.setItem('googleDrive_fileId', driveState.fileId);
          return driveState.fileId;
        }
      } catch (error) {
        console.warn('Busca de arquivo falhou (continuando com fallback):', error);
      }
    }

    const createStrategies = [
      {
        resource: {
          name: GOOGLE_DRIVE_CONFIG.FILE_NAME,
          parents: ['root'],
          mimeType: 'application/json'
        }
      },
      {
        resource: {
          name: GOOGLE_DRIVE_CONFIG.FILE_NAME,
          parents: ['appDataFolder'],
          mimeType: 'application/json'
        }
      }
    ];

    for (const strategy of createStrategies) {
      try {
        const response = await gapi.client.drive.files.create({
          resource: strategy.resource,
          fields: 'id'
        });

        if (response.result && response.result.id) {
          driveState.fileId = response.result.id;
          localStorage.setItem('googleDrive_fileId', driveState.fileId);
          return driveState.fileId;
        }
      } catch (error) {
        console.warn('Criação de arquivo falhou (tentando fallback):', error);
      }
    }

    throw new Error('Não foi possível criar o arquivo no Google Drive');

  } catch (error) {
    console.error('Erro ao buscar/criar arquivo:', error);
    throw error;
  }
}

/**
 * Enviar dados para o Google Drive
 */
async function googleDrivePushData() {
  if (!driveState.isAuthenticated) {
    return;
  }

  try {
    const ready = await ensureDriveSession({ promptUser: false });
    if (!ready) {
      console.warn('Push ignorado: sessão não autenticada');
      return;
    }

    const fileId = await findOrCreateDriveFile();

    const data = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      appName: 'Lifestyle App',
      userData: appState.userData
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const metadata = {
      name: GOOGLE_DRIVE_CONFIG.FILE_NAME,
      mimeType: contentType
    };

    const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

    await gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });

    driveState.lastSync = new Date();
    localStorage.setItem('googleDrive_lastSync', driveState.lastSync.toISOString());
    updateDriveUI();

  } catch (error) {
    console.error('Erro ao enviar dados para o Drive:', error);
    throw error;
  }
}

/**
 * Puxar dados do Google Drive
 */
async function googleDrivePullData() {
  if (!driveState.isAuthenticated) {
    return;
  }

  try {
    const ready = await ensureDriveSession({ promptUser: false });
    if (!ready) {
      console.warn('Pull ignorado: sessão não autenticada');
      return;
    }

    const fileId = await findOrCreateDriveFile();

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    // Se não houver dados ainda (arquivo vazio), fazer push dos dados locais
    if (!response.body || response.body === '') {
      await googleDrivePushData();
      return;
    }

    const driveData = JSON.parse(response.body);

    // Validar estrutura
    if (driveData.userData) {
      // Verificar se os dados do Drive são mais recentes
      const driveDate = new Date(driveData.exportDate);
      const localDataStr = localStorage.getItem('lifestyleData');

      if (localDataStr) {
        const localData = JSON.parse(localDataStr);
        const localLastModified = new Date(localData.lastModified || 0);

        // Se dados locais são mais recentes, fazer push
        if (localLastModified > driveDate) {
          console.log('Dados locais mais recentes, enviando para o Drive...');
          await googleDrivePushData();
          return;
        }
      }

      // Aplicar dados do Drive
      appState.userData = driveData.userData;
      saveToStorage();

      driveState.lastSync = new Date();
      localStorage.setItem('googleDrive_lastSync', driveState.lastSync.toISOString());
      updateDriveUI();

      console.log('Dados sincronizados do Google Drive');
    }

  } catch (error) {
    // Se erro 404, arquivo não existe ainda
    if (error.status === 404) {
      console.log('Arquivo não existe no Drive, criando...');
      await googleDrivePushData();
    } else {
      console.error('Erro ao puxar dados do Drive:', error);
      throw error;
    }
  }
}

/**
 * Alternar sincronização automática
 */
function toggleAutoSync(enabled) {
  driveState.autoSync = enabled;
  localStorage.setItem('googleDrive_autoSync', enabled.toString());

  if (enabled) {
    showNotification('✅ Sincronização automática ativada', 'success');
  } else {
    showNotification('ℹ️ Sincronização automática desativada', 'info');
  }
}

/**
 * Atualizar interface do Drive
 */
function updateDriveUI() {
  const disconnectedState = document.getElementById('drive-disconnected-state');
  const connectedState = document.getElementById('drive-connected-state');
  const userEmailEl = document.getElementById('drive-user-email');
  const lastSyncEl = document.getElementById('drive-last-sync');
  const autoSyncCheckbox = document.getElementById('auto-sync-checkbox');

  if (!disconnectedState || !connectedState) {
    console.debug('[DriveSync] UI ainda não carregada, aguardando evento componentsLoaded...');
    return;
  }

  if (driveState.isAuthenticated) {
    disconnectedState.style.display = 'none';
    connectedState.style.display = 'block';

    if (userEmailEl) {
      userEmailEl.textContent = driveState.userEmail || 'Carregando...';
    }

    if (lastSyncEl) {
      if (driveState.lastSync) {
        lastSyncEl.textContent = formatDateTime(driveState.lastSync);
      } else {
        lastSyncEl.textContent = 'Nunca';
      }
    }

    if (autoSyncCheckbox) {
      autoSyncCheckbox.checked = driveState.autoSync;
    }
  } else {
    disconnectedState.style.display = 'block';
    connectedState.style.display = 'none';
  }
}

/**
 * Sincronização automática ao salvar dados
 * Chamar esta função após salvar dados no localStorage
 */
function autoSyncToDrive() {
  if (driveState.isAuthenticated && driveState.autoSync) {
    // Debounce para evitar múltiplas sincronizações
    clearTimeout(window.autoSyncTimeout);
    window.autoSyncTimeout = setTimeout(() => {
      googleDrivePushData().catch(error => {
        console.error('Erro na sincronização automática:', error);
      });
    }, 2000); // Aguardar 2 segundos após última alteração
  }
}

/**
 * Formatar data/hora para exibição
 */
function formatDateTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'Agora mesmo';
  } else if (minutes < 60) {
    return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Funções auxiliares de notificação
 */
function showNotification(message, type = 'info') {
  alert(message);
}

function showLoading(message) {
  // Implementar loading spinner se necessário
  console.log(message);
}

function hideLoading() {
  // Implementar loading spinner se necessário
}

// Atualizar UI assim que os componentes essenciais forem carregados
document.addEventListener('componentsLoaded', () => {
  updateDriveUI();
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Validar variáveis de ambiente em desenvolvimento
  if (window.AppEnv && window.AppEnv.isDevelopment()) {
    window.AppEnv.validateEnv();
  }

  // Tentar carregar API do Google automaticamente
  if (GOOGLE_DRIVE_CONFIG.CLIENT_ID &&
    !GOOGLE_DRIVE_CONFIG.CLIENT_ID.includes('your_client_id_here')) {
    loadGoogleDriveAPI().catch(error => {
      console.error('Erro ao carregar Google Drive API:', error);
    });
  } else {
    console.warn('⚠️ Google Drive não configurado. Configure as credenciais no arquivo .env');
    console.info('📖 Consulte docs/GOOGLE_DRIVE_SETUP.md para instruções');
  }
});
