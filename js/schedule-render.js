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
    const hasDetailedTracking = activity.detailedTracking;
    const hasSimpleTracking = activity.simpleTracking;

    let statusClass = '';
    let trackingInfo = '';

    if (hasDetailedTracking) {
        const hasStart = hasDetailedTracking.start;
        const hasEnd = hasDetailedTracking.end;

        if (hasStart && hasEnd) {
            statusClass = 'completed';
            trackingInfo = `
                <div class="activity-tracking">
                    <small>
                        ▶️ Início: ${hasStart.markedAt}
                        ${hasStart.notes ? ` - ${hasStart.notes}` : ''}
                    </small>
                    <small>
                        ⏹️ Fim: ${hasEnd.markedAt}
                        ${hasEnd.notes ? ` - ${hasEnd.notes}` : ''}
                    </small>
                </div>
            `;
        } else if (hasStart) {
            statusClass = 'in-progress';
            trackingInfo = `
                <div class="activity-tracking">
                    <small>
                        ▶️ Iniciado às ${hasStart.markedAt}
                        ${hasStart.notes ? ` - ${hasStart.notes}` : ''}
                    </small>
                </div>
            `;
        }
    } else if (hasSimpleTracking) {
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

    const hasDetailedTracking = activity.detailedTracking;
    const hasSimpleTracking = activity.simpleTracking;

    const hasDetailedStart = hasDetailedTracking && hasDetailedTracking.start;
    const hasDetailedEnd = hasDetailedTracking && hasDetailedTracking.end;
    const hasCompleteDetailedTracking = hasDetailedTracking && hasDetailedStart && hasDetailedEnd;
    const hasAnyCompleteTracking = hasCompleteDetailedTracking || hasSimpleTracking;

    if (hasDetailedStart && !hasDetailedEnd) {
        // Só início marcado: mostrar apenas botão de fim
        return `
            <div class="activity-actions">
                <button onclick="markEventEnd('${schedule.date}', ${index})" class="btn-icon btn-end" title="Marcar fim">⏹️</button>
            </div>
        `;
    }

    if (hasAnyCompleteTracking) {
        // Tracking completo: mostrar apenas reset
        return `
            <div class="activity-actions">
                <button onclick="clearEventStatus('${schedule.date}', ${index})" class="btn-icon btn-clear" title="Limpar status">↻</button>
            </div>
        `;
    }

    // Sem tracking: mostrar todos os botões
    return `
        <div class="activity-actions">
            <div class="tracking-mode-buttons">
                <div class="detailed-tracking-buttons">
                    <span class="mode-label">Detalhado:</span>
                    <button onclick="markEventStart('${schedule.date}', ${index})" class="btn-icon btn-start" title="Marcar início">▶️</button>
                </div>
                <div class="simple-tracking-buttons">
                    <span class="mode-label">Simples:</span>
                    <button onclick="markEventSimpleComplete('${schedule.date}', ${index})" class="btn-icon btn-success" title="Concluído">✓</button>
                    <button onclick="markEventSimpleIncomplete('${schedule.date}', ${index})" class="btn-icon btn-danger" title="Não feito">✗</button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar atividade completa
function renderActivity(schedule, activity, index, isToday) {
    const duration = calculateDuration(activity.startTime, activity.endTime);
    const isActive = isToday && isEventActive(activity.startTime, activity.endTime);

    const { statusClass, trackingInfo } = renderTrackingInfo(activity);
    const actionsHtml = renderActivityActions(schedule, activity, index, isToday);

    // Renderizar horário livre antes desta atividade (se não for a primeira)
    let freeTimeHtml = '';
    if (isToday && index > 0) {
        const previousActivity = schedule.activities[index - 1];
        freeTimeHtml = renderFreeTimeSlot(previousActivity, activity);
    }

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
