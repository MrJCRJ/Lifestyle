// Gerenciamento de configurações do sistema

// Configurações padrão
const defaultSettings = {
    enabledCategories: {
        sleep: true,      // Obrigatório
        work: true,       // Opcional (padrão habilitado)
        study: false,     // Opcional
        cleaning: false   // Opcional
    }
};

// Abrir modal de configurações
function openSettings() {
    // Carregar configurações atuais
    const settings = appState.userData.settings || defaultSettings;

    // Marcar checkboxes conforme configurações
    document.getElementById('setting-sleep').checked = settings.enabledCategories.sleep;
    document.getElementById('setting-work').checked = settings.enabledCategories.work !== false;
    document.getElementById('setting-study').checked = settings.enabledCategories.study || false;
    document.getElementById('setting-cleaning').checked = settings.enabledCategories.cleaning || false;

    // Carregar configurações de notificação
    const notifCheckbox = document.getElementById('setting-notifications');
    const notifSettings = document.getElementById('notification-settings');
    const notifSound = document.getElementById('notification-sound');

    if (notifCheckbox) {
        notifCheckbox.checked = notificationState.enabled;
        if (notifSettings) {
            notifSettings.style.display = notificationState.enabled ? 'block' : 'none';
        }
    }

    if (notifSound) {
        notifSound.checked = notificationState.sound;
    }

    // Atualizar estatísticas
    updateDataStatistics();

    // Mostrar modal
    document.getElementById('settings-modal').classList.add('active');
}

// Fechar modal de configurações
function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}

// Salvar configurações
function saveSettings() {
    const settings = {
        enabledCategories: {
            sleep: true,  // Sempre true (obrigatório)
            work: document.getElementById('setting-work').checked,
            study: document.getElementById('setting-study').checked,
            cleaning: document.getElementById('setting-cleaning').checked
        }
    };

    // Salvar no userData
    appState.userData.settings = settings;
    saveToStorage();

    alert('✅ Configurações salvas com sucesso!');
    closeSettings();
}

// Verificar se uma categoria está habilitada
function isCategoryEnabled(category) {
    const settings = appState.userData.settings || defaultSettings;
    // Sono sempre obrigatório
    if (category === 'sleep') return true;
    // Outras categorias verificar configuração
    return settings.enabledCategories[category] !== false;
}

// Obter categorias habilitadas
function getEnabledCategories() {
    const settings = appState.userData.settings || defaultSettings;
    return Object.keys(settings.enabledCategories).filter(
        category => settings.enabledCategories[category]
    );
}

// Atualizar estatísticas dos dados no modal
function updateDataStatistics() {
    const stats = getDataStatistics();
    const statsContent = document.getElementById('stats-content');

    if (statsContent) {
        statsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div>📅 <strong>Total de Cronogramas:</strong> ${stats.totalSchedules}</div>
                <div>📝 <strong>Planejados:</strong> ${stats.plannedSchedules}</div>
                <div>⏰ <strong>Atividades:</strong> ${stats.totalActivities}</div>
                <div>💼 <strong>Trabalhos:</strong> ${stats.categoryCounts.work}</div>
                <div>📚 <strong>Estudos:</strong> ${stats.categoryCounts.study}</div>
                <div>🧹 <strong>Limpezas:</strong> ${stats.categoryCounts.cleaning}</div>
            </div>
        `;
    }
}

// Confirmar limpeza de todos os dados
function confirmClearAllData() {
    const confirmMsg = `⚠️ ATENÇÃO!\n\n` +
        `Esta ação irá DELETAR PERMANENTEMENTE:\n` +
        `• Todos os cronogramas (${Object.keys(appState.userData.dailySchedules || {}).length})\n` +
        `• Todas as configurações\n` +
        `• Todo o histórico\n\n` +
        `Esta ação NÃO PODE SER DESFEITA!\n\n` +
        `Recomendamos fazer um backup antes.\n\n` +
        `Deseja realmente continuar?`;

    if (confirm(confirmMsg)) {
        // Segunda confirmação
        if (confirm('🚨 ÚLTIMA CONFIRMAÇÃO\n\nTem certeza ABSOLUTA que deseja apagar TUDO?')) {
            clearAllData();
        }
    }
}

// Limpar todos os dados
function clearAllData() {
    try {
        // Fazer backup automático antes de limpar
        const backupKey = 'lifestyleData_backup_before_clear_' + Date.now();
        localStorage.setItem(backupKey, JSON.stringify(appState.userData));

        // Resetar dados
        appState.userData = {
            dailySchedules: {},
            settings: defaultSettings
        };

        saveToStorage();

        alert('✅ Todos os dados foram limpos.\n\n' +
            'Um backup foi salvo automaticamente caso precise restaurar.\n\n' +
            'A página será recarregada.');

        location.reload();
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('❌ Erro ao limpar dados. Verifique o console.');
    }
}
