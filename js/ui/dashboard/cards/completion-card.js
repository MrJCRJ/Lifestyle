// Card de Taxa de Conclusão

/**
 * Renderiza card de taxa de conclusão
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderCompletionCard(data) {
  const rate = data.completion.rate;
  const color = getCompletionColor(rate);

  return '<div class="dashboard-card completion-card">' +
    '<h3>✅ Taxa de Conclusão</h3>' +
    '<div class="completion-content">' +
    createCompletionCircle(rate, color) +
    createCompletionStats(data.completion) +
    '</div>' +
    '</div>';
}

/**
 * Define cor baseado na taxa de conclusão
 */
function getCompletionColor(rate) {
  if (rate >= 80) return '#10b981';
  if (rate >= 60) return '#f59e0b';
  return '#ef4444';
}

/**
 * Cria círculo de progresso
 */
function createCompletionCircle(rate, color) {
  return '<div class="completion-circle" style="--progress: ' + rate + '%; --color: ' + color + '">' +
    '<div class="completion-value">' + rate + '%</div>' +
    '</div>';
}

/**
 * Cria estatísticas de conclusão
 */
function createCompletionStats(completion) {
  return '<div class="completion-stats">' +
    createCompletionStat('Concluídas:', completion.completed, 'success') +
    createCompletionStat('Incompletas:', completion.incomplete, 'warning') +
    createCompletionStat('Total:', completion.total, '') +
    '</div>';
}

/**
 * Cria uma linha de estatística
 */
function createCompletionStat(label, value, cssClass) {
  return '<div class="completion-stat">' +
    '<span class="completion-stat-label">' + label + '</span>' +
    '<span class="completion-stat-value ' + cssClass + '">' + value + '</span>' +
    '</div>';
}
