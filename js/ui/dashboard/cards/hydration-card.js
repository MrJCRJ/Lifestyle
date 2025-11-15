// Card de Hidratação

/**
 * Renderiza card de hidratação
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderHydrationCard(data) {
  if (data.hydration.daysTracked === 0) {
    return '<div class="dashboard-card hydration-card">' +
      '<h3>💧 Hidratação</h3>' +
      '<p class="no-data">Nenhum dado de hidratação registrado</p>' +
      '</div>';
  }

  const percentage = Math.min(100, data.hydration.percentage);
  const color = getHydrationColor(percentage);

  return '<div class="dashboard-card hydration-card">' +
    '<h3>💧 Hidratação</h3>' +
    '<div class="hydration-content">' +
    createHydrationProgress(percentage, color) +
    createHydrationStats(data.hydration) +
    '</div>' +
    '</div>';
}

/**
 * Define cor baseado na porcentagem
 */
function getHydrationColor(percentage) {
  if (percentage >= 80) return '#10b981';
  if (percentage >= 60) return '#3b82f6';
  return '#f59e0b';
}

/**
 * Cria barra de progresso de hidratação
 */
function createHydrationProgress(percentage, color) {
  return '<div class="hydration-main">' +
    '<div class="hydration-progress">' +
    '<div class="hydration-fill" style="width: ' + percentage + '%; background: ' + color + '"></div>' +
    '</div>' +
    '<div class="hydration-label">' + percentage + '% da meta diária</div>' +
    '</div>';
}

/**
 * Cria estatísticas de hidratação
 */
function createHydrationStats(hydration) {
  return '<div class="hydration-stats">' +
    createHydrationStat('💧', hydration.average + 'ml', 'Média consumida') +
    createHydrationStat('🎯', hydration.goalAverage + 'ml', 'Meta diária') +
    '</div>';
}

/**
 * Cria uma estatística de hidratação
 */
function createHydrationStat(icon, value, label) {
  return '<div class="hydration-stat">' +
    '<span class="hydration-icon">' + icon + '</span>' +
    '<div>' +
    '<div class="hydration-stat-value">' + value + '</div>' +
    '<div class="hydration-stat-label">' + label + '</div>' +
    '</div>' +
    '</div>';
}
