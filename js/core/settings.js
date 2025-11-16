// Gerenciamento de Backup e Restauração

// Abrir modal de configurações
function openSettings() {
    document.getElementById('settings-modal').classList.add('active');
    
    // Carregar dados do perfil se a função existir
    if (typeof loadUserProfileData === 'function') {
        loadUserProfileData();
    }
}

// Fechar modal de configurações
function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
}
