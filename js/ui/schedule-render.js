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
        freeDuration = `${freeHours}h ${freeMins}min`;
    } else if (freeHours > 0) {
        freeDuration = `${freeHours}h`;
    } else {
        freeDuration = `${freeMins}min`;
    }

    return `
        <div class="activity free-time-activity">
            <div class="activity-main">
                <div class="activity-info">
                    <span class="activity-time">${previousActivity.endTime} - ${currentActivity.startTime}</span>
                    <span class="activity-duration">${freeDuration}</span>
                    <span class="activity-name">⏰ Horário Livre</span>
                    <span class="activity-type type-free">Livre</span>
                </div>
            </div>
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
        // Não renderizar texto - apenas a classe CSS para cor visual
        trackingInfo = '';
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
            <div class="hydration-actions">
                <div class="water-progress">
                    <div class="water-progress-bar">
                        <div class="water-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="water-amount">${waterData.consumed}ml / ${waterData.goal}ml</span>
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
    if (index > 0 && activity.type !== 'meal' && activity.type !== 'hydration') {
        const previousActivity = schedule.activities[index - 1];
        // Pular se a atividade anterior for refeição ou hidratação
        if (previousActivity.type !== 'meal' && previousActivity.type !== 'hydration') {
            freeTimeHtml = renderFreeTimeSlot(previousActivity, activity);
        }
    }

    // Todas as atividades com layout unificado
    const duration = activity.endTime ? calculateDuration(activity.startTime, activity.endTime) : '';
    const timeDisplay = activity.endTime ? `${activity.startTime} - ${activity.endTime}` : '';

    return `
        ${freeTimeHtml}
        <div class="activity ${isActive ? 'active-event' : ''} ${statusClass}">
            <div class="activity-main">
                <div class="activity-info">
                    ${timeDisplay ? `<span class="activity-time">${timeDisplay}</span>` : ''}
                    ${duration ? `<span class="activity-duration">${duration}</span>` : ''}
                    <span class="activity-name">${activity.name}</span>
                    <span class="activity-type type-${activity.type}">${getTypeLabel(activity.type)}</span>
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

    // Renderizar atividades normalmente
    const activitiesHtml = schedule.activities
        .map((activity, index) => renderActivity(schedule, activity, index, isToday))
        .join('');

    // Calcular posição do indicador de hora atual
    let timeIndicatorStyle = '';
    if (isToday) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Encontrar entre quais atividades está a hora atual
        let position = 0;
        for (let i = 0; i < schedule.activities.length; i++) {
            const activity = schedule.activities[i];
            if (activity.startTime) {
                const [startHour, startMin] = activity.startTime.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;

                if (currentMinutes >= startMinutes) {
                    position = i + 1;
                }
            }
        }

        // Calcular posição em pixels (aproximadamente)
        const activityHeight = 70; // altura aproximada de cada card
        const topPosition = position * activityHeight;
        timeIndicatorStyle = `style="top: ${topPosition}px"`;
    }

    return `
        <div class="day-schedule ${schedule.isPlanned ? 'planned-schedule' : ''}">
            ${headerHtml}
            <div class="schedule-activities">
                ${isToday ? `<div class="time-indicator" ${timeIndicatorStyle}></div>` : ''}
                ${activitiesHtml}
            </div>
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
