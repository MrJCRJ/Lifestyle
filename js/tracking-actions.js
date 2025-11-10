// Ações de rastreamento de eventos

// Marcar início do evento
function markEventStart(dateKey, activityIndex) {
    const currentTime = getCurrentTime();
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    // Verificar se foi marcado antes ou depois do horário de início
    const timeInfo = getTimeStatus(activity.startTime, currentTime);
    const message = timeInfo.status !== 'on-time'
        ? `Você está iniciando ${timeInfo.message}.`
        : '';

    // Inicializar tracking se não existir
    if (!schedule.activities[activityIndex].detailedTracking) {
        schedule.activities[activityIndex].detailedTracking = {};
    }

    schedule.activities[activityIndex].detailedTracking.start = {
        markedAt: currentTime,
        markedDate: new Date().toISOString(),
        timeStatus: timeInfo.status,
        notes: ''
    };

    // Mostrar modal se quiser adicionar nota ou ajustar
    if (timeInfo.status !== 'on-time') {
        showDetailedStartModal(dateKey, activityIndex, currentTime, timeInfo.status, message);
    } else {
        saveToStorage();
        showScheduleView(appState.activeFilter);
    }
}

// Marcar fim do evento
function markEventEnd(dateKey, activityIndex) {
    const currentTime = getCurrentTime();
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    // Verificar se foi marcado antes ou depois do horário de fim
    const timeInfo = getTimeStatus(activity.endTime, currentTime);
    const message = timeInfo.status !== 'on-time'
        ? `Você está finalizando ${timeInfo.message}.`
        : '';

    // Inicializar tracking se não existir
    if (!schedule.activities[activityIndex].detailedTracking) {
        schedule.activities[activityIndex].detailedTracking = {};
    }

    schedule.activities[activityIndex].detailedTracking.end = {
        markedAt: currentTime,
        markedDate: new Date().toISOString(),
        timeStatus: timeInfo.status,
        notes: ''
    };

    // Mostrar modal se quiser adicionar nota ou ajustar
    if (timeInfo.status !== 'on-time') {
        showDetailedEndModal(dateKey, activityIndex, currentTime, timeInfo.status, message);
    } else {
        saveToStorage();
        showScheduleView(appState.activeFilter);
    }
}

// Confirmar início detalhado
function confirmDetailedStart(dateKey, activityIndex, markedTime, timeStatus) {
    const notes = document.getElementById('event-notes').value;
    const adjustTime = document.getElementById('adjust-start-time-check')?.checked || false;

    const schedule = appState.userData.dailySchedules[dateKey];
    schedule.activities[activityIndex].detailedTracking.start.notes = notes;

    if (adjustTime) {
        closeEventModal();
        showTimeAdjustModal(dateKey, activityIndex, markedTime, 'start');
    } else {
        saveToStorage();
        closeEventModal();
        showScheduleView(appState.activeFilter);
    }
}

// Confirmar fim detalhado
function confirmDetailedEnd(dateKey, activityIndex, markedTime, timeStatus) {
    const notes = document.getElementById('event-notes').value;
    const adjustTime = document.getElementById('adjust-end-time-check')?.checked || false;

    const schedule = appState.userData.dailySchedules[dateKey];
    schedule.activities[activityIndex].detailedTracking.end.notes = notes;

    if (adjustTime) {
        closeEventModal();
        showTimeAdjustModal(dateKey, activityIndex, markedTime, 'end');
    } else {
        saveToStorage();
        closeEventModal();
        showScheduleView(appState.activeFilter);
    }
}

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
    if (confirm('Tem certeza que deseja limpar o status deste evento? (Isso também restaurará o horário original se foi modificado)')) {
        const schedule = appState.userData.dailySchedules[dateKey];

        // Restaurar horário original se foi ajustado
        if (schedule.activities[activityIndex].originalTime) {
            schedule.activities[activityIndex].startTime = schedule.activities[activityIndex].originalTime.start;
            schedule.activities[activityIndex].endTime = schedule.activities[activityIndex].originalTime.end;
            delete schedule.activities[activityIndex].originalTime;
            delete schedule.activities[activityIndex].timeAdjusted;
        }

        // Remover tracking detalhado e simples
        delete schedule.activities[activityIndex].detailedTracking;
        delete schedule.activities[activityIndex].simpleTracking;

        saveToStorage();
        showScheduleView(appState.activeFilter);
    }
}

// Confirmar ajuste de horário
function confirmTimeAdjust(dateKey, activityIndex, adjustType) {
    const schedule = appState.userData.dailySchedules[dateKey];

    // Salvar horário original se ainda não foi salvo
    if (!schedule.activities[activityIndex].originalTime) {
        schedule.activities[activityIndex].originalTime = {
            start: schedule.activities[activityIndex].startTime,
            end: schedule.activities[activityIndex].endTime
        };
    }

    // Atualizar horários conforme o tipo
    if (adjustType === 'start' || adjustType === 'both') {
        const newStartTime = document.getElementById('new-start-time')?.value;
        if (newStartTime) {
            schedule.activities[activityIndex].startTime = newStartTime;
        }
    }

    if (adjustType === 'end' || adjustType === 'both') {
        const newEndTime = document.getElementById('new-end-time')?.value;
        if (newEndTime) {
            schedule.activities[activityIndex].endTime = newEndTime;
        }
    }

    schedule.activities[activityIndex].timeAdjusted = true;

    saveToStorage();
    closeTimeAdjustModal();
    showScheduleView(appState.activeFilter);
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
