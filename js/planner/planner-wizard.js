// Planejador principal - Sono e Limpeza
// Nota: Trabalho, Estudo e Navegação foram modularizados em arquivos separados

// Etapa 1: Salvar sono
function savePlannerSleep() {
    const sleepTime = document.getElementById('plannerSleepTime').value;
    const wakeTime = document.getElementById('plannerWakeTime').value;

    if (!sleepTime || !wakeTime) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Armazenar temporariamente
    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.sleep = sleepTime;
    appState.tempPlanData.wake = wakeTime;

    // Salvar automaticamente
    saveToStorage();

    alert('✅ Sono salvo!');

    // Voltar para tela de edição e atualizar status
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
        updateEditPlannerStatus();
    }
}

// Etapa 4: Salvar limpeza
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

    // Salvar automaticamente
    saveToStorage();

    alert('✅ Limpeza salva!');

    // Voltar para tela de edição e atualizar status
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
        updateEditPlannerStatus();
    }
}

// Toggle formulário de limpeza do planejador
function togglePlannerCleaningForm(show) {
    document.getElementById('planner-cleaning-details').style.display = show ? 'block' : 'none';
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        savePlannerSleep,
        savePlannerCleaning,
        togglePlannerCleaningForm
    };
}

