(function (global) {
  const { state, setAutoSync } = global.GoogleDriveState;

  function render() {
    const disconnectedState = document.getElementById('drive-disconnected-state');
    const connectedState = document.getElementById('drive-connected-state');
    const userEmailEl = document.getElementById('drive-user-email');
    const lastSyncEl = document.getElementById('drive-last-sync');
    const autoSyncCheckbox = document.getElementById('auto-sync-checkbox');

    if (!disconnectedState || !connectedState) {
      return;
    }

    if (state.isAuthenticated) {
      disconnectedState.style.display = 'none';
      connectedState.style.display = 'block';

      if (userEmailEl) {
        userEmailEl.textContent = state.userEmail || 'Carregando...';
      }

      if (lastSyncEl) {
        lastSyncEl.textContent = state.lastSync ? formatDateTime(state.lastSync) : 'Nunca';
      }

      if (autoSyncCheckbox) {
        autoSyncCheckbox.checked = state.autoSync;
      }
    } else {
      disconnectedState.style.display = 'block';
      connectedState.style.display = 'none';
    }
  }

  function formatDateTime(date) {
    const reference = date instanceof Date ? date : date ? new Date(date) : null;

    if (!reference) {
      return 'Nunca';
    }

    const now = new Date();
    const diff = now - reference;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Agora mesmo';
    }

    if (minutes < 60) {
      return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }

    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    }

    return reference.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function toggleAutoSyncSetting(enabled) {
    setAutoSync(enabled);
    if (enabled) {
      notify('✅ Sincronização automática ativada', 'success');
    } else {
      notify('ℹ️ Sincronização automática desativada', 'info');
    }
  }

  function notify(message, type = 'info') {
    alert(message);
  }

  function showLoading(message) {
    console.log(message);
  }

  function hideLoading() {
    // Placeholder para spinner futuro
  }

  document.addEventListener('googleDrive:update-ui', render);
  document.addEventListener('componentsLoaded', render);

  global.GoogleDriveUI = {
    render,
    formatDateTime,
    toggleAutoSync: toggleAutoSyncSetting,
    notify,
    showLoading,
    hideLoading
  };
})(window);
