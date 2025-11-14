// Componentes de renderização de atividades individuais

/**
 * Renderizar informações de tracking de uma atividade
 */
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

/**
 * Renderizar informações da atividade (tempo, nome, tipo)
 */
function renderActivityInfo(activity) {
  const duration = activity.endTime ? calculateDuration(activity.startTime, activity.endTime) : '';
  const timeDisplay = activity.endTime ? `${activity.startTime} - ${activity.endTime}` : '';

  return `
        <div class="activity-info">
            ${timeDisplay ? `<span class="activity-time">${timeDisplay}</span>` : ''}
            ${duration ? `<span class="activity-duration">${duration}</span>` : ''}
            <span class="activity-name">${activity.name}</span>
            <span class="activity-type type-${activity.type}">${getTypeLabel(activity.type)}</span>
        </div>
    `;
}

/**
 * Renderizar botões de hidratação
 */
function renderHydrationActions(schedule, activity, index) {
  const waterData = activity.waterTracking || { consumed: 0, goal: activity.waterGoal || 2000 };
  const percentage = Math.min(100, Math.round((waterData.consumed / waterData.goal) * 100));

  return `
        <div class="hydration-actions" onclick="event.stopPropagation()">
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

/**
 * Renderizar botões de marcação simples
 */
function renderSimpleTrackingActions(schedule, activity, index) {
  const hasSimpleTracking = activity.simpleTracking;

  if (hasSimpleTracking) {
    // Já marcado: mostrar apenas reset
    return `
            <div class="activity-actions" onclick="event.stopPropagation()">
                <button onclick="clearEventStatus('${schedule.date}', ${index})" class="btn-icon btn-clear" title="Limpar status">↻</button>
            </div>
        `;
  }

  // Não marcado: mostrar botões de marcação simples
  return `
        <div class="activity-actions" onclick="event.stopPropagation()">
            <button onclick="markEventSimpleComplete('${schedule.date}', ${index})" class="btn-icon btn-success" title="Concluído">✓</button>
            <button onclick="markEventSimpleIncomplete('${schedule.date}', ${index})" class="btn-icon btn-danger" title="Não feito">✗</button>
        </div>
    `;
}

/**
 * Renderizar botões de ação para uma atividade
 */
function renderActivityActions(schedule, activity, index, isToday) {
  if (!isToday) return '';

  // Hidratação: sistema especial de tracking
  if (activity.type === 'hydration') {
    return renderHydrationActions(schedule, activity, index);
  }

  // Refeições e outras atividades: marcação simples padrão
  return renderSimpleTrackingActions(schedule, activity, index);
}

/**
 * Obter label do tipo de atividade
 */
function getTypeLabel(type) {
  const labels = {
    sleep: 'Sono',
    work: 'Trabalho',
    study: 'Estudo',
    cleaning: 'Limpeza',
    project: 'Projeto',
    hobby: 'Hobby & Lazer',
    exercise: 'Exercício',
    meal: 'Refeição',
    hydration: 'Hidratação',
    free: 'Livre'
  };
  return labels[type] || type;
}
