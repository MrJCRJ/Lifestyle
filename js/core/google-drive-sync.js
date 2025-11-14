(function (global) {
  if (global.GoogleDriveConfig) {
    console.warn('[google-drive-sync.js] Este arquivo agora referencia a nova arquitetura modular. Certifique-se de carregar os módulos em js/core/google-drive/.');
  }

  const configProvider = global.GoogleDriveConfig;
  const loader = global.GoogleDriveLoader;
  const session = global.GoogleDriveSession;
  const files = global.GoogleDriveFiles;
  const ui = global.GoogleDriveUI;
  const stateStore = global.GoogleDriveState;

  if (!configProvider || !loader || !session || !files || !ui || !stateStore) {
    console.error('[GoogleDrive] Dependências não encontradas. Verifique se index.html está carregando os módulos em js/core/google-drive/.');
    return;
  }

  function notify(message, type) {
    ui.notify(message, type);
  }

  function showLoading(message) {
    ui.showLoading(message);
  }

  async function attemptAutoReconnect() {
    if (!stateStore.state.wasConnected) {
      return;
    }

    try {
      showLoading('Reconectando ao Google Drive...');
      const ready = await session.ensureSession({ promptUser: false });
      if (ready) {
        await session.fetchUserInfo();
        await files.pullData();
        console.info('[GoogleDrive] Dados recuperados automaticamente do Drive');
      }
    } catch (error) {
      console.warn('Falha ao restaurar sessão do Google Drive automaticamente', error);
    } finally {
      hideLoading();
    }
  }

  function hideLoading() {
    ui.hideLoading();
  }

  async function connect() {
    try {
      showLoading('Carregando Google Drive...');
      await session.ensureSession({ promptUser: true });
      await session.fetchUserInfo();
      try {
        await files.pullData();
      } catch (syncError) {
        console.warn('Não foi possível recuperar dados existentes do Google Drive automaticamente', syncError);
      }
      if (stateStore.state.autoSync) {
        files.pushData().catch(error => {
          console.warn('Não foi possível sincronizar automaticamente após conexão:', error);
        });
      }
      notify('✅ Conectado ao Google Drive com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao conectar ao Google Drive:', error);
      if (error?.error === 'access_denied') {
        notify('❌ Conexão cancelada pelo usuário', 'error');
      } else if (error?.type === 'tokenFailed') {
        notify('❌ O Google retornou um erro de token. Verifique as origens autorizadas no Google Cloud Console.', 'error');
      } else {
        notify('❌ Erro ao conectar ao Google Drive', 'error');
      }
    } finally {
      hideLoading();
    }
  }

  function disconnect() {
    if (!confirm('Deseja realmente desconectar do Google Drive?\n\nIsso não excluirá seus dados, apenas desconectará a sincronização.')) {
      return;
    }

    try {
      session.revokeToken();
      notify('✅ Desconectado do Google Drive', 'success');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      notify('❌ Erro ao desconectar', 'error');
    }
  }

  async function syncNow() {
    if (!stateStore.state.isAuthenticated) {
      notify('❌ Você precisa estar conectado ao Google Drive', 'error');
      return;
    }

    try {
      showLoading('Sincronizando...');
      const ready = await session.ensureSession({ promptUser: true });
      if (!ready) {
        throw new Error('Não foi possível confirmar a sessão com o Google Drive');
      }
      await files.pullData();
      await files.pushData();
      notify('✅ Sincronização concluída!', 'success');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      notify('❌ Erro na sincronização', 'error');
    } finally {
      hideLoading();
    }
  }

  function toggleAutoSync(enabled) {
    ui.toggleAutoSync(enabled);
  }

  function autoSyncToDrive() {
    if (stateStore.state.isAuthenticated && stateStore.state.autoSync) {
      clearTimeout(global.autoSyncTimeout);
      global.autoSyncTimeout = setTimeout(() => {
        files.pushData().catch(error => {
          console.error('Erro na sincronização automática:', error);
        });
      }, 2000);
    }
  }

  async function resetBackup() {
    if (!stateStore.state.isAuthenticated) {
      notify('❌ Conecte-se ao Google Drive antes de recriar o backup', 'error');
      return;
    }

    if (!confirm('Deseja recriar o arquivo de backup no Google Drive? Isso substituirá o backup atual.')) {
      return;
    }

    try {
      showLoading('Recriando arquivo de backup...');
      await files.resetBackup();
      notify('✅ Backup recriado com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao recriar backup do Google Drive:', error);
      notify('❌ Não foi possível recriar o backup', 'error');
    } finally {
      hideLoading();
    }
  }

  function handleComponentsLoaded() {
    ui.render();
  }

  document.addEventListener('componentsLoaded', handleComponentsLoaded);

  document.addEventListener('DOMContentLoaded', () => {
    if (global.AppEnv && typeof global.AppEnv.isDevelopment === 'function' && global.AppEnv.isDevelopment()) {
      global.AppEnv.validateEnv();
    }

    const config = configProvider.get();
    if (config.CLIENT_ID && !config.CLIENT_ID.includes('your_client_id_here')) {
      loader.ensureLibraries()
        .then(() => attemptAutoReconnect())
        .catch(error => {
          console.error('Erro ao carregar Google Drive API:', error);
        });
    } else {
      console.warn('⚠️ Google Drive não configurado. Configure as credenciais no arquivo .env');
      console.info('📖 Consulte docs/GOOGLE_DRIVE_SETUP.md para instruções');
    }
  });

  global.googleDriveConnect = connect;
  global.googleDriveDisconnect = disconnect;
  global.googleDriveSyncNow = syncNow;
  global.toggleAutoSync = toggleAutoSync;
  global.autoSyncToDrive = autoSyncToDrive;
  global.googleDriveResetBackup = resetBackup;
})(window);
