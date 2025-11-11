// Navegação entre telas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    } else {
        console.error('Tela não encontrada:', screenId + '-screen');
    }
}

// Voltar um passo
function prevStep(current) {
    if (current === 'work') {
        showScreen('sleep');
    } else if (current === 'study') {
        showScreen('work');
    } else if (current === 'cleaning') {
        showScreen('study');
    }
}

// Salvar dados de sono
function saveSleep() {
    const sleepTime = document.getElementById('sleepTime').value;
    const wakeTime = document.getElementById('wakeTime').value;

    if (!sleepTime || !wakeTime) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Dados serão salvos no planData de cada dia
    saveToStorage();

    updateDayDisplay();

    // Ir para trabalho
    showScreen('work');
}

// Atualizar display do dia atual
function updateDayDisplay() {
    const todayName = getTodayName();
    const todayDate = getFormattedDate();

    const workDay = document.getElementById('current-work-day');
    const studyDay = document.getElementById('current-study-day');

    if (workDay) {
        workDay.textContent = `${todayName}, ${todayDate}`;
    }
    if (studyDay) {
        studyDay.textContent = `${todayName}, ${todayDate}`;
    }
}

// Ir para tela de cronogramas
function goToSchedules() {
    const savedFilter = appState.activeFilter || 'today';
    showScheduleView(savedFilter);
}

// Editar cronograma
function editSchedule() {
    showScreen('sleep');
}
