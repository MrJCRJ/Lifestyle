// Gerenciamento de limpeza

// Toggle formulário de limpeza
function toggleCleaningForm(show) {
    document.getElementById('cleaning-details').style.display = show ? 'block' : 'none';
}

// Salvar limpeza
function saveCleaning() {
    const hasCleaning = document.querySelector('input[name="hasCleaning"]:checked');

    if (!hasCleaning) {
        alert('Por favor, selecione se você faz limpeza ou não!');
        return;
    }

    // Dados de limpeza serão salvos no planData ao gerar o cronograma
    saveToStorage();
    generateTodaySchedule();
    goToSchedules();
}
