let studySlotCounter = 0;

// Toggle formulário de estudo
function toggleStudyForm(show) {
    document.getElementById('study-details').style.display = show ? 'block' : 'none';
    if (show) {
        const container = document.getElementById('studies-container');
        if (container.children.length === 0) {
            addStudySlot();
        }
    }
}

// Carregar dados de estudo
function loadStudyData() {
    const container = document.getElementById('studies-container');
    container.innerHTML = '';
    studySlotCounter = 0;

    // Sempre iniciar com pelo menos um slot vazio
    addStudySlot();
}

// Adicionar slot de estudo
function addStudySlot(studyData = null) {
    studySlotCounter++;
    const container = document.getElementById('studies-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `study-slot-${studySlotCounter}`;

    const isFirstItem = container.children.length === 0;
    slotDiv.innerHTML = createStudyCardHTML('study', studySlotCounter, studyData, isFirstItem);

    container.appendChild(slotDiv);
}

// Adicionar horário ao estudo
function addStudyTime(studyId) {
    addGenericTime('study', studyId);
}

// Remover horário do estudo
function removeStudyTime(studyId, timeIndex) {
    removeGenericTime('study', studyId, timeIndex);
}

// Remover estudo
function removeStudySlot(id) {
    removeItemSlot('study', id);
}

// Salvar estudos do dia atual
function saveStudy() {
    const hasStudy = document.querySelector('input[name="hasStudy"]:checked');

    if (!hasStudy) {
        alert('Por favor, selecione se você estuda ou não!');
        return;
    }

    // Dados de estudo serão salvos no planData ao gerar o cronograma
    saveToStorage();

    // Verificar qual é a próxima tela habilitada
    if (isCategoryEnabled('cleaning')) {
        showScreen('cleaning');
    } else {
        generateTodaySchedule();
        goToSchedules();
    }
}
