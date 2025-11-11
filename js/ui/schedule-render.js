// Renderização de componentes de cronograma

// Renderizar card de dia vazio
function renderEmptyDayCard(schedule) {
    return `
        <div class="day-schedule empty-schedule">
            <div class="schedule-header">
                <h3>${schedule.dayName} - ${schedule.formattedDate}</h3>
            </div>
            <div class="empty-schedule-content">
                <p>📝 Nenhum planejamento para este dia</p>
                <button onclick="planSpecificDay('${schedule.date}')" class="btn btn-primary">Planejar</button>
            </div>
        </div>
    `;
}

// Renderizar header do cronograma
function renderScheduleHeader(schedule) {
    return `
        <div class="schedule-header">
            <h3>${schedule.dayName} - ${schedule.formattedDate}</h3>
            <div class="schedule-actions">
                <button onclick="planSpecificDay('${schedule.date}')" class="btn btn-secondary btn-small">Editar</button>
                ${schedule.isPlanned ? `<button onclick="removeScheduledDay('${schedule.date}')" class="btn btn-danger btn-small">Remover</button>` : ''}
            </div>
        </div>
    `;
}

// Renderizar horário livre entre eventos
function renderFreeTimeSlot(previousActivity, currentActivity) {
    // Não mostrar horário livre se a próxima atividade for refeição ou hidratação
    if (currentActivity.type === 'meal' || currentActivity.type === 'hydration') {
        return '';
    }

    // Não mostrar horário livre se a atividade anterior for refeição ou hidratação
    if (previousActivity.type === 'meal' || previousActivity.type === 'hydration') {
        return '';
    }

    const [prevEndHour, prevEndMin] = previousActivity.endTime.split(':').map(Number);
    const [currStartHour, currStartMin] = currentActivity.startTime.split(':').map(Number);

    const prevEndMinutes = prevEndHour * 60 + prevEndMin;
    const currStartMinutes = currStartHour * 60 + currStartMin;

    if (currStartMinutes <= prevEndMinutes) {
        return '';
    }

    const freeMinutes = currStartMinutes - prevEndMinutes;
    const freeHours = Math.floor(freeMinutes / 60);
    const freeMins = freeMinutes % 60;

    let freeDuration = '';
    if (freeHours > 0 && freeMins > 0) {
        freeDuration = `${freeHours}h ${freeMins}min livres`;
    } else if (freeHours > 0) {
        freeDuration = `${freeHours}h livres`;
    } else {
        freeDuration = `${freeMins}min livres`;
    }

    return `
        <div class="free-time-slot">
            <span>⏰ Horários Livres</span>
            <span class="activity-time">${previousActivity.endTime} - ${currentActivity.startTime}</span>
            <span class="free-time-duration">${freeDuration}</span>
        </div>
    `;
}

// Renderizar informações de tracking
function renderTrackingInfo(activity) {
    const hasSimpleTracking = activity.simpleTracking;

    let statusClass = '';
    let trackingInfo = '';

    if (hasSimpleTracking) {
        statusClass = hasSimpleTracking.status === 'complete' ? 'completed' : 'not-done';
        trackingInfo = `
            <div class="activity-tracking">
                <small>
                    ${hasSimpleTracking.status === 'complete' ? '✅ Concluído' : '❌ Não feito'} 
                    às ${hasSimpleTracking.markedAt}
                </small>
            </div>
        `;
    }

    return { statusClass, trackingInfo };
}

// Renderizar botões de ação
function renderActivityActions(schedule, activity, index, isToday) {
    if (!isToday) return '';

    // Hidratação: sistema especial de tracking
    if (activity.type === 'hydration') {
        const waterData = activity.waterTracking || { consumed: 0, goal: activity.waterGoal || 2000 };
        const percentage = Math.min(100, Math.round((waterData.consumed / waterData.goal) * 100));

        return `
            <div class="activity-actions hydration-actions">
                <div class="water-progress">
                    <span class="water-amount">${waterData.consumed}ml / ${waterData.goal}ml</span>
                    <div class="water-progress-bar">
                        <div class="water-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="water-buttons">
                    <button onclick="addWaterIntake('${schedule.date}', ${index}, 250)" class="btn-icon btn-water" title="+ 250ml">💧</button>
                    <button onclick="addWaterIntake('${schedule.date}', ${index}, 500)" class="btn-icon btn-water" title="+ 500ml">🥤</button>
                    <button onclick="resetWaterIntake('${schedule.date}', ${index})" class="btn-icon btn-clear" title="Resetar">↻</button>
                </div>
            </div>
        `;
    }

    // Refeições e outras atividades: marcação simples padrão
    const hasSimpleTracking = activity.simpleTracking;

    if (hasSimpleTracking) {
        // Já marcado: mostrar apenas reset
        return `
            <div class="activity-actions">
                <button onclick="clearEventStatus('${schedule.date}', ${index})" class="btn-icon btn-clear" title="Limpar status">↻</button>
            </div>
        `;
    }

    // Não marcado: mostrar botões de marcação simples
    return `
        <div class="activity-actions">
            <button onclick="markEventSimpleComplete('${schedule.date}', ${index})" class="btn-icon btn-success" title="Concluído">✓</button>
            <button onclick="markEventSimpleIncomplete('${schedule.date}', ${index})" class="btn-icon btn-danger" title="Não feito">✗</button>
        </div>
    `;
}

// Renderizar atividade completa
function renderActivity(schedule, activity, index, isToday) {
    const isActive = isToday && isEventActive(activity.startTime, activity.endTime);

    const { statusClass, trackingInfo } = renderTrackingInfo(activity);
    const actionsHtml = renderActivityActions(schedule, activity, index, isToday);

    // Renderizar horário livre antes desta atividade (se não for a primeira e não for refeição)
    let freeTimeHtml = '';
    if (isToday && index > 0 && activity.type !== 'meal' && activity.type !== 'hydration') {
        const previousActivity = schedule.activities[index - 1];
        freeTimeHtml = renderFreeTimeSlot(previousActivity, activity);
    }

    // Refeições e hidratação: layout simplificado (tipo tarefa)
    if (activity.type === 'meal' || activity.type === 'hydration') {
        return `
            ${freeTimeHtml}
            <div class="activity task-style ${statusClass}">
                <div class="activity-main">
                    <div class="activity-info">
                        <span class="activity-name">${activity.name}</span>
                        <span class="activity-type type-${activity.type}">${getTypeLabel(activity.type)}</span>
                    </div>
                    ${actionsHtml}
                </div>
                ${trackingInfo}
            </div>
        `;
    }

    // Atividades normais: layout completo com horários
    const duration = calculateDuration(activity.startTime, activity.endTime);

    return `
        ${freeTimeHtml}
        <div class="activity ${isActive ? 'active-event' : ''} ${statusClass}">
            <div class="activity-main">
                <div class="activity-info">
                    <span class="activity-time">${activity.startTime} - ${activity.endTime}</span>
                    <span class="activity-duration">${duration}</span>
                    <span class="activity-name">${activity.name}</span>
                    <span class="activity-type type-${activity.type}">${getTypeLabel(activity.type)}</span>
                    ${activity.timeAdjusted ? '<span class="time-adjusted-badge">⏰ Ajustado</span>' : ''}
                </div>
                ${actionsHtml}
            </div>
            ${trackingInfo}
        </div>
    `;
}

// Renderizar card de dia com cronograma
function renderScheduleDayCard(schedule, isToday) {
    const headerHtml = renderScheduleHeader(schedule);
    const activitiesHtml = schedule.activities
        .map((activity, index) => renderActivity(schedule, activity, index, isToday))
        .join('');

    return `
        <div class="day-schedule ${schedule.isPlanned ? 'planned-schedule' : ''}">
            ${headerHtml}
            ${activitiesHtml}
        </div>
    `;
}

// Obter label do tipo
function getTypeLabel(type) {
    const labels = {
        sleep: 'Sono',
        work: 'Trabalho',
        study: 'Estudo',
        cleaning: 'Limpeza',
        free: 'Livre'
    };
    return labels[type] || type;
}
