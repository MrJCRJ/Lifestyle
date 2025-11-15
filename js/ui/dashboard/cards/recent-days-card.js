// Card de Dias Recentes

/**
 * Renderiza card de dias recentes
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderRecentDaysCard(data) {
  const maxDays = data.period === 'week' ? 7 : 10;
  const daysToShow = data.recentDays.slice(0, maxDays);
  const title = data.period === 'week' ? '📅 Últimos 7 Dias' : '📅 Últimos 10 Dias';

  const daysHTML = daysToShow.map(day => createDayCard(day)).join('');

  return '<div class="dashboard-card recent-days-card">' +
    '<h3>' + title + '</h3>' +
    '<div class="recent-days-list">' + daysHTML + '</div>' +
    '</div>';
}

/**
 * Cria card de um dia
 */
function createDayCard(day) {
  const completionRate = day.activityCount > 0
    ? Math.round((day.completedCount / day.activityCount) * 100)
    : 0;
  const completionClass = getCompletionClass(completionRate);

  return '<div class="recent-day">' +
    '<div class="day-header">' +
    '<span class="day-name">' + day.dayName + '</span>' +
    '<span class="day-date">' + formatShortDate(day.date) + '</span>' +
    '</div>' +
    '<div class="day-info">' +
    '<div class="day-activities">' + day.activityCount + ' atividades</div>' +
    '<div class="day-completion ' + completionClass + '">' + completionRate + '%</div>' +
    '</div>' +
    '</div>';
}

/**
 * Define classe baseado na taxa de conclusão
 */
function getCompletionClass(rate) {
  if (rate >= 80) return 'high';
  if (rate >= 60) return 'medium';
  return 'low';
}

/**
 * Formata data curta (DD/MM)
 */
function formatShortDate(dateKey) {
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  return parts[2] + '/' + parts[1];
}
