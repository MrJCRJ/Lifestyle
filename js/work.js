let jobSlotCounter = 0;

// Toggle formulário de trabalho
function toggleWorkForm(show) {
    document.getElementById('work-details').style.display = show ? 'block' : 'none';
    if (show) {
        const container = document.getElementById('jobs-container');
        if (container.children.length === 0) {
            addJobSlot();
        }
    }
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
    slotDiv.innerHTML = createJobCardHTML('job', jobSlotCounter, jobData, isFirstItem);

    container.appendChild(slotDiv);
}

// Adicionar horário ao trabalho
function addJobTime(jobId) {
    addGenericTime('job', jobId);
}

// Remover horário do trabalho
function removeJobTime(jobId, timeIndex) {
    removeGenericTime('job', jobId, timeIndex);
}

// Remover trabalho
function removeJobSlot(id) {
    removeItemSlot('job', id);
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

    // Verificar qual é a próxima tela habilitada
    if (isCategoryEnabled('study')) {
        showScreen('study');
    } else if (isCategoryEnabled('cleaning')) {
        showScreen('cleaning');
    } else {
        generateTodaySchedule();
        goToSchedules();
    }
}
