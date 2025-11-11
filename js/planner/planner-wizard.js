// Fluxo do wizard de planejamento (sono → trabalho → estudo)

// Mostrar planejador diário para uma data específica
function planSpecificDay(dateKey) {
    // Converter YYYY-MM-DD para Date local (sem timezone)
    const date = parseDateKey(dateKey);
    const dayName = getDayName(date);
    const formattedDate = getFormattedDate(date);

    // Armazenar data sendo planejada no estado
    appState.planningDate = dateKey;
    appState.isPlanningMode = true;

    // Resetar contadores
    plannerJobCounter = 0;
    plannerStudyCounter = 0;

    // Atualizar displays em todas as telas
    const elements = {
        sleep: document.getElementById('planner-sleep-day-name'),
        work: document.getElementById('planner-work-day-name'),
        study: document.getElementById('planner-study-day-name'),
        cleaning: document.getElementById('planner-cleaning-day-name'),
        meals: document.getElementById('planner-meals-day-name'),
        hydration: document.getElementById('planner-hydration-day-name'),
        exercise: document.getElementById('planner-exercise-day-name')
    };

    Object.values(elements).forEach(el => {
        if (el) el.textContent = `${dayName}, ${formattedDate}`;
    });

    // Verificar se já existe dados para este dia
    const existingSchedule = appState.userData.dailySchedules?.[dateKey];
    const hasData = existingSchedule && existingSchedule.planData;

    // Mostrar a tela
    showScreen('planner-sleep');

    // Aguardar DOM atualizar
    setTimeout(() => {
        const quickConfig = document.getElementById('quick-config');
        if (quickConfig) {
            quickConfig.style.display = hasData ? 'none' : 'block';
        }

        if (hasData) {
            loadPlanDataToWizard(existingSchedule.planData);
        } else {
            clearPlannerForms();
        }
    }, 100);
}

// Cancelar planejamento e voltar para cronogramas
function cancelPlanner() {
    appState.isPlanningMode = false;
    appState.planningDate = null;
    goToSchedules();
}

// Etapa 1: Salvar sono e ir para trabalho
function savePlannerSleep() {
    const sleepTime = document.getElementById('plannerSleepTime').value;
    const wakeTime = document.getElementById('plannerWakeTime').value;

    if (!sleepTime || !wakeTime) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Armazenar temporariamente (preservar dados existentes se houver)
    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.sleep = sleepTime;
    appState.tempPlanData.wake = wakeTime;

    // Ir para trabalho
    showScreen('planner-work');
}

// Etapa 2: Salvar trabalho e ir para estudo
function savePlannerWork() {
    const hasWork = document.querySelector('input[name="plannerHasWork"]:checked');

    if (!hasWork) {
        alert('Por favor, selecione se você trabalha ou não!');
        return;
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }

    // Preservar jobs existentes se não foram modificados
    appState.tempPlanData.jobs = [];

    if (hasWork.value === 'yes') {
        try {
            appState.tempPlanData.jobs = collectJobsData('planner-jobs', 'planner-job');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    // Ir para estudo
    showScreen('planner-study');
}

// Etapa 3: Salvar estudo e ir para limpeza
function savePlannerStudy() {
    const hasStudy = document.querySelector('input[name="plannerHasStudy"]:checked');

    if (!hasStudy) {
        alert('Por favor, selecione se você estuda ou não!');
        return;
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.studies = [];

    if (hasStudy.value === 'yes') {
        try {
            appState.tempPlanData.studies = collectStudiesData('planner-studies', 'planner-study');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    // Ir para limpeza
    showScreen('planner-cleaning');
}

// Etapa 4: Salvar limpeza e finalizar
function savePlannerCleaning() {
    const hasCleaning = document.querySelector('input[name="plannerHasCleaning"]:checked');

    if (!hasCleaning) {
        alert('Por favor, selecione se você faz limpeza ou não!');
        return;
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.cleaning = null;

    if (hasCleaning.value === 'yes') {
        const cleaningStart = document.getElementById('plannerCleaningStartTime').value;
        const cleaningEnd = document.getElementById('plannerCleaningEndTime').value;
        const cleaningNotes = document.getElementById('plannerCleaningNotes').value;

        if (!cleaningStart || !cleaningEnd) {
            alert('Por favor, preencha os horários de limpeza!');
            return;
        }

        appState.tempPlanData.cleaning = {
            start: cleaningStart,
            end: cleaningEnd,
            notes: cleaningNotes
        };
    }

    // Ir para refeições
    showScreen('planner-meals');
}

// Voltar no wizard do planejador
function prevPlannerStep(current) {
    if (current === 'work') {
        showScreen('planner-sleep');
    } else if (current === 'study') {
        showScreen('planner-work');
    } else if (current === 'cleaning') {
        showScreen('planner-study');
    } else if (current === 'meals') {
        showScreen('planner-cleaning');
    } else if (current === 'hydration') {
        showScreen('planner-meals');
    } else if (current === 'exercise') {
        showScreen('planner-hydration');
    }
}

// Toggle formulário de limpeza do planejador
function togglePlannerCleaningForm(show) {
    document.getElementById('planner-cleaning-details').style.display = show ? 'block' : 'none';
}
