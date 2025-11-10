// Função de inicialização da aplicação
function initializeApp() {
    loadFromStorage();
    appState.todayName = getTodayName();

    // Sempre mostra o cronograma (hoje por padrão)
    const savedFilter = appState.activeFilter || 'today';
    showScheduleView(savedFilter);
}

// Aguarda o carregamento dos componentes HTML antes de inicializar a aplicação
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeComponents();
        initializeApp();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        alert('Erro ao carregar a aplicação. Por favor, recarregue a página.');
    }
});
