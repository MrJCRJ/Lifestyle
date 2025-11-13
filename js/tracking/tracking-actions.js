// Ações de rastreamento de eventos

// Marcação simples - concluído
function markEventSimpleComplete(dateKey, activityIndex) {
    const currentTime = getCurrentTime();
    const schedule = appState.userData.dailySchedules[dateKey];

    schedule.activities[activityIndex].simpleTracking = {
        status: 'complete',
        markedAt: currentTime,
        markedDate: new Date().toISOString()
    };

    saveToStorage();
    showScheduleView(appState.activeFilter);
}

// Marcação simples - não concluído
function markEventSimpleIncomplete(dateKey, activityIndex) {
    const currentTime = getCurrentTime();
    const schedule = appState.userData.dailySchedules[dateKey];

    schedule.activities[activityIndex].simpleTracking = {
        status: 'incomplete',
        markedAt: currentTime,
        markedDate: new Date().toISOString()
    };

    saveToStorage();
    showScheduleView(appState.activeFilter);
}

// Limpar status do evento
function clearEventStatus(dateKey, activityIndex) {
    if (confirm('Tem certeza que deseja limpar o status deste evento?')) {
        const schedule = appState.userData.dailySchedules[dateKey];

        // Remover tracking simples
        delete schedule.activities[activityIndex].simpleTracking;

        saveToStorage();
        showScheduleView(appState.activeFilter);
    }
}

// Remover dia planejado
function removeScheduledDay(dateKey) {
    const schedule = appState.userData.dailySchedules[dateKey];

    if (!schedule) return;

    const confirmMsg = `Tem certeza que deseja remover o planejamento de ${schedule.dayName}, ${schedule.formattedDate}?`;

    if (confirm(confirmMsg)) {
        delete appState.userData.dailySchedules[dateKey];
        saveToStorage();
        showScheduleView(appState.activeFilter);
        alert('✅ Planejamento removido com sucesso!');
    }
}

// === Tracking de Hidratação ===

// Adicionar consumo de água
function addWaterIntake(dateKey, activityIndex, amount) {
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    // Inicializar tracking de água se não existir
    if (!activity.waterTracking) {
        activity.waterTracking = {
            consumed: 0,
            goal: activity.waterGoal || appState.userData.userProfile?.waterNeeds || 2000,
            history: []
        };
    }

    // Adicionar consumo
    activity.waterTracking.consumed += amount;
    activity.waterTracking.history.push({
        amount: amount,
        timestamp: new Date().toISOString(),
        time: getCurrentTime()
    });

    saveToStorage();
    showScheduleView(appState.activeFilter);

    // Mostrar feedback se atingiu a meta
    if (activity.waterTracking.consumed >= activity.waterTracking.goal) {
        const percentage = Math.round((activity.waterTracking.consumed / activity.waterTracking.goal) * 100);
        if (percentage === 100 || (percentage > 100 && percentage < 110)) {
            setTimeout(() => {
                alert('🎉 Parabéns! Você atingiu sua meta de hidratação!');
            }, 100);
        }
    }
}

// Resetar consumo de água
function resetWaterIntake(dateKey, activityIndex) {
    if (confirm('Tem certeza que deseja resetar o consumo de água do dia?')) {
        const schedule = appState.userData.dailySchedules[dateKey];
        const activity = schedule.activities[activityIndex];

        if (activity.waterTracking) {
            activity.waterTracking.consumed = 0;
            activity.waterTracking.history = [];
        }

        saveToStorage();
        showScheduleView(appState.activeFilter);
    }
}

// === Tracking de Refeições ===

// Marcar refeição como concluída e salvar horário
function markMealComplete(dateKey, activityIndex) {
    const currentTime = getCurrentTime();
    const schedule = appState.userData.dailySchedules[dateKey];

    schedule.activities[activityIndex].simpleTracking = {
        status: 'complete',
        completedAt: currentTime,
        markedDate: new Date().toISOString()
    };

    saveToStorage();
    showScheduleView(appState.activeFilter);
}

// === Navegação de Tabs (Refeições/Hidratação) ===

// Alternar entre tabs de nutrição
function switchNutritionTab(event, tabName) {
    // Salvar escolha do usuário
    localStorage.setItem('activeNutritionTab', tabName);

    // Remover classe active de todos os tabs
    const tabs = document.querySelectorAll('.nutrition-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remover classe active de todos os painéis
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    // Adicionar classe active ao tab clicado
    event.currentTarget.classList.add('active');

    // Mostrar painel correspondente
    const panel = document.getElementById(`${tabName}-panel`);
    if (panel) {
        panel.classList.add('active');
    }
}
