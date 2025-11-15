// Card de Visão Geral

/**
 * Renderiza card de visão geral
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderOverviewCard(data) {
  const totalActivities = Object.values(data.activities).reduce((sum, act) => sum + act.count, 0);
  const totalHours = Object.values(data.activities).reduce((sum, act) => sum + act.totalMinutes, 0) / 60;
  const avgHoursPerDay = data.totalDays > 0 ? (totalHours / data.totalDays).toFixed(1) : 0;

  return '<div class="dashboard-card overview-card">' +
    '<h3>📈 Visão Geral</h3>' +
    '<div class="overview-stats">' +
    createStatItem(data.totalDays, 'Dias Planejados') +
    createStatItem(totalActivities, 'Atividades') +
    createStatItem(totalHours.toFixed(1) + 'h', 'Horas Totais') +
    createStatItem(avgHoursPerDay + 'h', 'Média/Dia') +
    '</div>' +
    '</div>';
}

/**
 * Cria um item de estatística
 */
function createStatItem(value, label) {
  return '<div class="stat-item">' +
    '<div class="stat-value">' + value + '</div>' +
    '<div class="stat-label">' + label + '</div>' +
    '</div>';
}
