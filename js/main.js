// Função de inicialização da aplicação
function initializeApp() {
    loadFromStorage();
    appState.todayName = getTodayName();

    // Sempre mostra o cronograma da semana (carrossel começa no dia de hoje)
    const savedFilter = 'week'; // Sempre mostra a semana inteira
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
