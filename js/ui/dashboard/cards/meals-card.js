// Card de Refeições

/**
 * Renderiza card de refeições
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderMealsCard(data) {
  if (data.meals.total === 0) {
    return '<div class="dashboard-card meals-card">' +
      '<h3>🍽️ Refeições</h3>' +
      '<p class="no-data">Nenhuma refeição registrada</p>' +
      '</div>';
  }

  const avgPerDay = (data.meals.total / data.totalDays).toFixed(1);

  return '<div class="dashboard-card meals-card">' +
    '<h3>🍽️ Refeições</h3>' +
    createMealsSummary(data.meals.total, avgPerDay, data.meals.completed) +
    createMealsInfo() +
    '</div>';
}

/**
 * Cria resumo de refeições
 */
function createMealsSummary(total, avgPerDay, completed) {
  return '<div class="meals-summary">' +
    createMealsSummaryItem('🍽️', total, 'Total no período') +
    createMealsSummaryItem('📊', avgPerDay, 'Média por dia') +
    createMealsSummaryItem('✅', completed, 'Registradas') +
    '</div>';
}

/**
 * Cria item do resumo
 */
function createMealsSummaryItem(icon, value, label) {
  return '<div class="meals-summary-item">' +
    '<span class="meals-summary-icon">' + icon + '</span>' +
    '<div>' +
    '<span class="meals-summary-value">' + value + '</span>' +
    '<span class="meals-summary-label">' + label + '</span>' +
    '</div>' +
    '</div>';
}

/**
 * Cria informação sobre refeições
 */
function createMealsInfo() {
  return '<div class="meals-info">' +
    '<p class="info-text">📝 As refeições são rastreadas conforme você as registra ao longo do dia</p>' +
    '</div>';
}
