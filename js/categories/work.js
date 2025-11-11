let jobSlotCounter = 0;

// Toggle formulário de trabalho
function toggleWorkForm(show) {
    toggleCategoryForm('job', show);
}

// Carregar dados de trabalho
function loadWorkData() {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';
    jobSlotCounter = 0;

    // Sempre iniciar com pelo menos um slot vazio
    addJobSlot();
}

// Adicionar slot de horário de trabalho
function addJobSlot(jobData = null) {
    jobSlotCounter++;
    const container = document.getElementById('jobs-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `job-slot-${jobSlotCounter}`;

    const isFirstItem = container.children.length === 0;
    slotDiv.innerHTML = createCategoryCardHTML('job', jobSlotCounter, jobData, isFirstItem);

    container.appendChild(slotDiv);
}

// Adicionar horário ao trabalho
function addJobTime(jobId) {
    addCategoryTime('job', jobId);
}

// Remover horário do trabalho
function removeJobTime(jobId, timeIndex) {
    removeCategoryTime('job', jobId, timeIndex);
}

// Remover trabalho
function removeJobSlot(id) {
    removeCategorySlot('job', id);
}

// Salvar trabalhos do dia atual
function saveWork() {
    const hasWork = document.querySelector('input[name="hasWork"]:checked');

    if (!hasWork) {
        alert('Por favor, selecione se você trabalha ou não!');
        return;
    }

    // Dados de trabalho serão salvos no planData ao gerar o cronograma
    saveToStorage();

    // Ir para estudo
    showScreen('study');
}
