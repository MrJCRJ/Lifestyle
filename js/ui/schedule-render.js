// Renderização de componentes de cronograma

// Resolver metadados do dia do cronograma com fallback para dados antigos
function resolveScheduleDayInfo(schedule) {
    const info = {
        dayName: schedule.dayName,
        formattedDate: schedule.formattedDate
    };

    if (info.dayName && info.formattedDate) {
        return info;
    }

    const scheduleDate = schedule.date ? parseDateKey(schedule.date) : null;
    const fallbackDate = scheduleDate instanceof Date && !isNaN(scheduleDate) ? scheduleDate : new Date();

    return {
        dayName: getDayName(fallbackDate),
        formattedDate: getFormattedDate(fallbackDate)
    };
}

// Renderizar card de dia vazio
function renderEmptyDayCard(schedule) {
    const { dayName, formattedDate } = resolveScheduleDayInfo(schedule);
    return `
        <div class="day-schedule empty-schedule">
            <div class="schedule-header">
                <h3>${dayName} - ${formattedDate}</h3>
            </div>
            <div class="empty-schedule-content">
                <p>📝 Nenhum planejamento para este dia</p>
                <button onclick="openEditPlanner('${schedule.date}')" class="btn btn-primary">Planejar</button>
            </div>
        </div>
    `;
}

// Renderizar header do cronograma
function renderScheduleHeader(schedule) {
    const { dayName, formattedDate } = resolveScheduleDayInfo(schedule);
    return `
        <div class="schedule-header">
            <h3>${dayName} - ${formattedDate}</h3>
            <div class="schedule-actions">
                <button onclick="openEditPlanner('${schedule.date}')" class="btn btn-secondary btn-small">Editar</button>
                ${schedule.isPlanned ? `<button onclick="removeScheduledDay('${schedule.date}')" class="btn btn-danger btn-small">Remover</button>` : ''}
            </div>
        </div>
    `;
}

// Renderizar horário livre entre eventos
function renderFreeTimeSlot(previousActivity, currentActivity, isToday) {
    const prevEndMinutes = timeToMinutes(previousActivity.endTime);
    const currStartMinutes = timeToMinutes(currentActivity.startTime);

    // Calcular diferença de minutos
    if (currStartMinutes <= prevEndMinutes) {
        return '';
    }

    const freeMinutes = currStartMinutes - prevEndMinutes;

    // Não mostrar se o gap for muito pequeno (menos de 5 minutos)
    if (freeMinutes < 5) {
        return '';
    }

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

    // Verificar se está no horário livre agora
    const isActiveFree = isToday && isEventActive(previousActivity.endTime, currentActivity.startTime);

    // Timer para horário livre ativo
    let countdownHtml = '';
    if (isActiveFree) {
        const remaining = getTimeRemaining(currentActivity.startTime);
        countdownHtml = `<div class="event-countdown" data-end-time="${currentActivity.startTime}">${remaining.text}</div>`;
    }

    return `
        <div class="activity free-time-activity ${isActiveFree ? 'active-event' : ''}">
            <div class="activity-main">
                <div class="activity-info">
                    <span class="activity-time">${previousActivity.endTime} - ${currentActivity.startTime}</span>
                    <span class="activity-duration">${freeDuration}</span>
                    <span class="activity-name">⏰ Horário Livre</span>
                    <span class="activity-type type-free">Livre</span>
                </div>
            </div>
            ${countdownHtml}
        </div>
    `;
}

// Renderizar atividade completa
function renderActivity(schedule, activity, index, isToday) {
    const isActive = isToday && isEventActive(activity.startTime, activity.endTime);

    const { statusClass, trackingInfo } = renderTrackingInfo(activity);
    const activityInfoHtml = renderActivityInfo(activity);
    const actionsHtml = renderActivityActions(schedule, activity, index, isToday);

    // Timer regressivo para evento ativo
    let countdownHtml = '';
    if (isActive && activity.type !== 'meal' && activity.type !== 'hydration') {
        const remaining = getTimeRemaining(activity.endTime);
        countdownHtml = `<div class="event-countdown" data-end-time="${activity.endTime}">${remaining.text}</div>`;
    }

    // Renderizar horário livre antes desta atividade
    let freeTimeHtml = '';

    // Apenas mostrar horário livre se a atividade atual não for refeição ou hidratação
    if (activity.type !== 'meal' && activity.type !== 'hydration' && index > 0) {
        // Encontrar a última atividade não-pontual (não refeição, não hidratação)
        let previousActivity = null;
        for (let i = index - 1; i >= 0; i--) {
            const prevAct = schedule.activities[i];
            if (prevAct.type !== 'meal' && prevAct.type !== 'hydration') {
                previousActivity = prevAct;
                break;
            }
        }

        if (previousActivity) {
            freeTimeHtml = renderFreeTimeSlot(previousActivity, activity, isToday);
        }
    }

    return `
        ${freeTimeHtml}
        <div class="activity ${isActive ? 'active-event' : ''} ${statusClass}">
            <div class="activity-main">
                ${activityInfoHtml}
                ${actionsHtml}
            </div>
            ${countdownHtml}
            ${trackingInfo}
        </div>
    `;
}

// Renderizar card de dia com cronograma
function renderScheduleDayCard(schedule, isToday) {
    const headerHtml = renderScheduleHeader(schedule);

    // Verificar se activities existe
    if (!schedule.activities || !Array.isArray(schedule.activities)) {
        schedule.activities = [];
    }

    // Separar hidratação e refeições das outras atividades
    const hydrationActivity = schedule.activities.find(act => act.type === 'hydration');
    const mealActivities = schedule.activities.filter(act => act.type === 'meal');
    const regularActivities = schedule.activities.filter(act => act.type !== 'hydration' && act.type !== 'meal');

    // Renderizar hidratação no topo (se for hoje)
    let hydrationHtml = '';
    if (isToday && hydrationActivity) {
        const waterData = hydrationActivity.waterTracking || { consumed: 0, goal: hydrationActivity.waterGoal || 2000 };
        const percentage = Math.min(100, Math.round((waterData.consumed / waterData.goal) * 100));
        const hydrationIndex = schedule.activities.indexOf(hydrationActivity);

        hydrationHtml = `
            <div class="hydration-summary">
                <div class="hydration-header">
                    <span class="hydration-icon">💧</span>
                    <span class="hydration-title">Hidratação Diária</span>
                    <span class="hydration-percentage">${percentage}%</span>
                </div>
                <div class="water-progress">
                    <div class="water-progress-bar">
                        <div class="water-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="hydration-info">
                    <span class="water-amount">${waterData.consumed}ml / ${waterData.goal}ml</span>
                    <div class="water-buttons-compact">
                        <button onclick="addWaterIntake('${schedule.date}', ${hydrationIndex}, 250)" class="btn-icon btn-water-small" title="+ 250ml">💧</button>
                        <button onclick="addWaterIntake('${schedule.date}', ${hydrationIndex}, 500)" class="btn-icon btn-water-small" title="+ 500ml">🥤</button>
                        <button onclick="resetWaterIntake('${schedule.date}', ${hydrationIndex})" class="btn-icon btn-clear-small" title="Resetar">↻</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar refeições no topo (se for hoje)
    let mealsHtml = '';
    if (isToday && mealActivities.length > 0) {
        const totalMeals = mealActivities.length;
        const completedMeals = mealActivities.filter(m => m.simpleTracking?.status === 'complete').length;
        const percentage = Math.round((completedMeals / totalMeals) * 100);

        mealsHtml = `
            <div class="meals-summary">
                <div class="meals-header">
                    <span class="meals-icon">🍽️</span>
                    <span class="meals-title">Refeições do Dia</span>
                    <span class="meals-percentage">${completedMeals}/${totalMeals}</span>
                </div>
                <div class="meals-progress">
                    <div class="meals-progress-bar">
                        <div class="meals-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="meals-list">
                    ${mealActivities.map((meal, idx) => {
            const mealIndex = schedule.activities.indexOf(meal);
            const isCompleted = meal.simpleTracking?.status === 'complete';
            const completedTime = meal.simpleTracking?.completedAt || '';

            return `
                            <div class="meal-item ${isCompleted ? 'completed' : ''}">
                                <div class="meal-info">
                                    <span class="meal-name">${meal.name}</span>
                                    ${isCompleted && completedTime ? `<span class="meal-time">✓ ${completedTime}</span>` : ''}
                                </div>
                                <div class="meal-actions">
                                    ${!isCompleted ? `
                                        <button onclick="markMealComplete('${schedule.date}', ${mealIndex})" class="btn-icon btn-success btn-small" title="Marcar como feita">✓</button>
                                    ` : `
                                        <button onclick="clearEventStatus('${schedule.date}', ${mealIndex})" class="btn-icon btn-clear btn-small" title="Desmarcar">↻</button>
                                    `}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // Renderizar atividades regulares
    const activitiesHtml = regularActivities
        .map((activity, index) => {
            // Passar índice original para manter tracking correto
            const originalIndex = schedule.activities.indexOf(activity);
            return renderActivity(schedule, activity, originalIndex, isToday);
        })
        .join('');

    return `
        <div class="day-schedule ${schedule.isPlanned ? 'planned-schedule' : ''}">
            ${headerHtml}
            ${hydrationHtml}
            ${mealsHtml}
            <div class="schedule-activities">
                ${activitiesHtml}
            </div>
        </div>
    `;
}

// Atualizar contadores regressivos a cada minuto
function updateCountdownTimers() {
    const countdowns = document.querySelectorAll('.event-countdown');
    countdowns.forEach(countdown => {
        const endTime = countdown.dataset.endTime;
        if (endTime) {
            const remaining = getTimeRemaining(endTime);
            countdown.textContent = remaining.text;
        }
    });
}

// Iniciar atualização automática dos timers
if (typeof window !== 'undefined') {
    setInterval(updateCountdownTimers, 60000); // Atualizar a cada 1 minuto
}
