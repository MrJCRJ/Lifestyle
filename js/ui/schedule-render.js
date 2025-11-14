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
    const hasValidDate = scheduleDate && typeof scheduleDate.getTime === 'function' && !isNaN(scheduleDate.getTime());
    const fallbackDate = hasValidDate ? scheduleDate : new Date();

    return {
        dayName: getDayName(fallbackDate),
        formattedDate: getFormattedDate(fallbackDate)
    };
}

// Renderizar card de dia vazio
function renderEmptyDayCard(schedule) {
    const { dayName, formattedDate } = resolveScheduleDayInfo(schedule);
    return `
        <div class="day-schedule empty-schedule clickable-card" onclick="openEditPlanner('${schedule.date}')">
            <div class="schedule-header">
                <h3>${dayName} - ${formattedDate}</h3>
            </div>
            <div class="empty-schedule-content">
                <p>📝 Nenhum planejamento para este dia</p>
                <p class="card-hint">Clique para planejar</p>
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

// Renderizar card unificado de Nutrição (Refeições + Hidratação)
function renderNutritionCard(schedule, hydrationActivity, mealActivities) {
    const totalMeals = mealActivities.length;
    const completedMeals = mealActivities.filter(m => m.simpleTracking?.status === 'complete').length;

    let waterData = { consumed: 0, goal: 2000 };
    let waterPercentage = 0;
    let hydrationIndex = -1;

    if (hydrationActivity) {
        waterData = hydrationActivity.waterTracking || { consumed: 0, goal: hydrationActivity.waterGoal || 2000 };
        waterPercentage = Math.min(100, Math.round((waterData.consumed / waterData.goal) * 100));
        hydrationIndex = schedule.activities.indexOf(hydrationActivity);
    }

    // Recuperar tab ativa salva (default: 'meals')
    const activeTab = localStorage.getItem('activeNutritionTab') || 'meals';
    const isMealsActive = activeTab === 'meals';
    const isHydrationActive = activeTab === 'hydration';

    // Renderizar conteúdo de hidratação
    const hydrationContent = hydrationActivity ? `
        <div class="hydration-summary">
            <div class="hydration-header">
                <span class="hydration-icon">💧</span>
                <span class="hydration-title">Hidratação Diária</span>
                <span class="hydration-percentage">${waterPercentage}%</span>
            </div>
            <div class="water-progress">
                <div class="water-progress-bar">
                    <div class="water-progress-fill" style="width: ${waterPercentage}%"></div>
                </div>
            </div>
            <div class="hydration-info">
                <span class="water-amount">${waterData.consumed}ml / ${waterData.goal}ml</span>
                <div class="water-buttons-compact" onclick="event.stopPropagation()">
                    <button onclick="addWaterIntake('${schedule.date}', ${hydrationIndex}, 250)" class="btn-icon btn-water-small" title="+ 250ml">💧</button>
                    <button onclick="addWaterIntake('${schedule.date}', ${hydrationIndex}, 500)" class="btn-icon btn-water-small" title="+ 500ml">🥤</button>
                    <button onclick="resetWaterIntake('${schedule.date}', ${hydrationIndex})" class="btn-icon btn-clear-small" title="Resetar">↻</button>
                </div>
            </div>
        </div>
    ` : '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhuma meta de hidratação definida</p>';

    // Renderizar conteúdo de refeições
    const mealsContent = mealActivities.length > 0 ? `
        <div class="meals-summary-compact">
            <div class="meals-header-compact">
                <div class="meals-title-group">
                    <span class="meals-icon">🍽️</span>
                    <span class="meals-title">Refeições</span>
                </div>
                <div class="meals-stats">
                    <span class="meals-percentage">${completedMeals}/${totalMeals}</span>
                    <div class="meals-progress-mini">
                        <div class="meals-progress-fill-mini" style="width: ${Math.round((completedMeals / totalMeals) * 100)}%"></div>
                    </div>
                </div>
            </div>
            <div class="meals-list-compact">
                ${mealActivities.map((meal, idx) => {
        const mealIndex = schedule.activities.indexOf(meal);
        const isCompleted = meal.simpleTracking?.status === 'complete';
        const completedTime = meal.simpleTracking?.completedAt || '';

        // Encontrar a próxima refeição pendente
        const firstPendingIndex = mealActivities.findIndex(m => !m.simpleTracking?.status);
        const isNextPending = idx === firstPendingIndex;

        // Mostrar APENAS a próxima pendente (esconder completadas E futuras)
        if (!isNextPending) {
            return ''; // Esconder refeições completadas e futuras
        }

        const mealName = meal.customName || meal.name;
        const mealDescription = meal.description || '';

        return `
                        <div class="meal-item-compact next-pending" onclick="event.stopPropagation()">
                            <div class="meal-check">
                                <button onclick="markMealComplete('${schedule.date}', ${mealIndex})" class="meal-checkbox" title="Marcar como feita">
                                    <span class="checkbox-icon">☐</span>
                                </button>
                            </div>
                            <div class="meal-content">
                                <div class="meal-main-info">
                                    <span class="meal-name-compact">${mealName}</span>
                                </div>
                                ${mealDescription ? `<div class="meal-description">${mealDescription}</div>` : ''}
                            </div>
                        </div>
                    `;
    }).join('')}
                ${completedMeals === totalMeals ? '<div class="all-meals-done">✅ Todas as refeições concluídas!</div>' : ''}
            </div>
        </div>
    ` : '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhuma refeição planejada</p>';

    return `
        <div class="nutrition-hydration-card" onclick="event.stopPropagation()">
            <div class="nutrition-card-inner">
                <div class="nutrition-tabs">
                    <button class="nutrition-tab ${isMealsActive ? 'active' : ''}" onclick="switchNutritionTab(event, 'meals')">
                        <span class="tab-icon">🍽️</span>
                        <span>Refeições</span>
                        ${totalMeals > 0 ? `<span class="tab-badge">${completedMeals}/${totalMeals}</span>` : ''}
                    </button>
                    <button class="nutrition-tab ${isHydrationActive ? 'active' : ''}" onclick="switchNutritionTab(event, 'hydration')">
                        <span class="tab-icon">💧</span>
                        <span>Hidratação</span>
                        ${hydrationActivity ? `<span class="tab-badge">${waterPercentage}%</span>` : ''}
                    </button>
                </div>
                <div class="nutrition-content">
                    <div id="meals-panel" class="tab-panel ${isMealsActive ? 'active' : ''}">
                        ${mealsContent}
                    </div>
                    <div id="hydration-panel" class="tab-panel ${isHydrationActive ? 'active' : ''}">
                        ${hydrationContent}
                    </div>
                </div>
            </div>
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

    // Renderizar card unificado de nutrição (refeições + hidratação)
    let nutritionCardHtml = '';
    if (isToday && (hydrationActivity || mealActivities.length > 0)) {
        nutritionCardHtml = renderNutritionCard(schedule, hydrationActivity, mealActivities);
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
        <div class="day-schedule ${schedule.isPlanned ? 'planned-schedule' : ''} clickable-card" onclick="openEditPlanner('${schedule.date}')">
            ${headerHtml}
            <p class="card-hint">Clique no card para editar</p>
            ${nutritionCardHtml}
            <div class="schedule-activities" onclick="event.stopPropagation()">
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
