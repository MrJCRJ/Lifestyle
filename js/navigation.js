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
        // Se trabalho estiver habilitado, voltar para trabalho, senão para sono
        if (isCategoryEnabled('work')) {
            showScreen('work');
        } else {
            showScreen('sleep');
        }
    } else if (current === 'cleaning') {
        // Voltar para a categoria anterior habilitada
        if (isCategoryEnabled('study')) {
            showScreen('study');
        } else if (isCategoryEnabled('work')) {
            showScreen('work');
        } else {
            showScreen('sleep');
        }
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

    // Verificar qual é a próxima categoria habilitada
    if (isCategoryEnabled('work')) {
        showScreen('work');
    } else if (isCategoryEnabled('study')) {
        showScreen('study');
    } else if (isCategoryEnabled('cleaning')) {
        showScreen('cleaning');
    } else {
        generateTodaySchedule();
        goToSchedules();
    }
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
