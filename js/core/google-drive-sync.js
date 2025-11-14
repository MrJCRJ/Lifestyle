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
  SCOPES: 'https://www.googleapis.com/auth/drive.appdata',
  FILE_NAME: 'lifestyle-app-data.json'
};

// Estado da sincronização
const driveState = {
  isAuthenticated: false,
  fileId: null,
  lastSync: null,
  autoSync: true,
  userEmail: null,
  isLoaded: false
};

/**
 * Carregar Google API Client Library
 */
function loadGoogleDriveAPI() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client:auth2', () => {
        initGoogleDriveClient()
          .then(resolve)
          .catch(reject);
      });
    };
    script.onerror = () => reject(new Error('Falha ao carregar Google API'));
    document.body.appendChild(script);
  });
}

/**
 * Inicializar Google Drive Client
 */
function initGoogleDriveClient() {
  const config = {
    clientId: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
    discoveryDocs: GOOGLE_DRIVE_CONFIG.DISCOVERY_DOCS,
    scope: GOOGLE_DRIVE_CONFIG.SCOPES
  };

  // API Key é opcional - adicionar somente se configurada
  if (GOOGLE_DRIVE_CONFIG.API_KEY && GOOGLE_DRIVE_CONFIG.API_KEY !== 'SUA_API_KEY_AQUI') {
    config.apiKey = GOOGLE_DRIVE_CONFIG.API_KEY;
  }

  return gapi.client.init(config).then(() => {
    driveState.isLoaded = true;

    // Escutar mudanças no estado de autenticação
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

    // Verificar estado inicial
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

/**
 * Atualizar status de autenticação
 */
function updateSignInStatus(isSignedIn) {
  driveState.isAuthenticated = isSignedIn;

  if (isSignedIn) {
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    const profile = user.getBasicProfile();
    driveState.userEmail = profile.getEmail();

    // Carregar preferências salvas
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

    updateDriveUI();

    // Sincronizar automaticamente ao conectar
    if (driveState.autoSync) {
      googleDrivePullData();
    }
  } else {
    driveState.userEmail = null;
    updateDriveUI();
  }
}

/**
 * Conectar ao Google Drive
 */
async function googleDriveConnect() {
  try {
    if (!driveState.isLoaded) {
      showLoading('Carregando Google Drive...');
      await loadGoogleDriveAPI();
      hideLoading();
    }

    await gapi.auth2.getAuthInstance().signIn();

    showNotification('✅ Conectado ao Google Drive com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao conectar ao Google Drive:', error);

    if (error.error === 'popup_closed_by_user') {
      showNotification('❌ Conexão cancelada pelo usuário', 'error');
    } else if (error.error === 'idpiframe_initialization_failed') {
      showNotification('❌ Erro: Verifique se as credenciais do Google estão configuradas corretamente', 'error');
    } else {
      showNotification('❌ Erro ao conectar ao Google Drive', 'error');
    }
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
    gapi.auth2.getAuthInstance().signOut();

    // Limpar dados salvos
    localStorage.removeItem('googleDrive_autoSync');
    localStorage.removeItem('googleDrive_lastSync');
    localStorage.removeItem('googleDrive_fileId');

    driveState.fileId = null;
    driveState.lastSync = null;
    driveState.userEmail = null;

    showNotification('✅ Desconectado do Google Drive', 'success');
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
    // Buscar arquivo existente no appDataFolder
    const response = await gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'files(id, name)',
      q: `name='${GOOGLE_DRIVE_CONFIG.FILE_NAME}'`
    });

    if (response.result.files && response.result.files.length > 0) {
      driveState.fileId = response.result.files[0].id;
      localStorage.setItem('googleDrive_fileId', driveState.fileId);
      return driveState.fileId;
    }

    // Criar novo arquivo se não existir
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: GOOGLE_DRIVE_CONFIG.FILE_NAME,
        parents: ['appDataFolder']
      },
      fields: 'id'
    });

    driveState.fileId = createResponse.result.id;
    localStorage.setItem('googleDrive_fileId', driveState.fileId);
    return driveState.fileId;

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
