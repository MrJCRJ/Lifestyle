// Componentes de renderização de cards de cronograma

/**
 * Renderizar card de dia vazio
 */
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

/**
 * Renderizar header do cronograma
 */
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

/**
 * Renderizar horário livre entre eventos
 */
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

  const freeDuration = formatMinutesToReadable(freeMinutes);

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

/**
 * Atualizar contadores regressivos a cada minuto
 */
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
