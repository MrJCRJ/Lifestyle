// Dashboard Principal - Coordenador
// Estado do dashboard
let dashboardPeriod = 'week'; // 'week' ou 'month'

/**
 * Mostra dashboard com período específico
 * @param {string} period - 'week' ou 'month'
 */
function showDashboard(period = 'week') {
  dashboardPeriod = period;
  const dashboardData = collectDashboardData(period);
  renderDashboard(dashboardData, period);
  showScreen('dashboard');
}

/**
 * Muda período do dashboard
 * @param {string} period - 'week' ou 'month'
 */
function changeDashboardPeriod(period) {
  showDashboard(period);
}

/**
 * Renderiza dashboard completo
 * @param {Object} data - Dados agregados
 * @param {string} period - Período atual
 */
function renderDashboard(data, period) {
  const container = document.getElementById('dashboard-content');

  if (!container) {
    console.error('Container do dashboard não encontrado');
    return;
  }

  if (data.isEmpty) {
    container.innerHTML = renderEmptyDashboard(period);
    return;
  }

  const periodLabel = period === 'week' ? 'Última Semana' : 'Último Mês';

  container.innerHTML =
    '<div class="dashboard-controls">' +
    renderPeriodTabs(period) +
    '<div class="period-label">' + periodLabel + '</div>' +
    '</div>' +
    '<div class="dashboard-grid">' +
    renderOverviewCard(data) +
    renderCompletionCard(data) +
    renderHealthCard(data) +
    renderHydrationCard(data) +
    renderActivitiesCard(data) +
    renderMealsCard(data) +
    renderRecentDaysCard(data) +
    '</div>';
}

/**
 * Renderiza dashboard vazio
 */
function renderEmptyDashboard(period) {
  const periodText = period === 'week' ? 'nos últimos 7 dias' : 'nos últimos 30 dias';
  return '<div class="empty-dashboard">' +
    '<div class="empty-icon">📊</div>' +
    '<h3>Nenhum dado disponível</h3>' +
    '<p>Você não tem cronogramas ' + periodText + '. Comece criando seu primeiro cronograma!</p>' +
    '<button onclick="showScheduleView(\'today\')" class="btn btn-primary">Criar Cronograma</button>' +
    '</div>';
}

/**
 * Renderiza abas de período
 */
function renderPeriodTabs(period) {
  const weekActive = period === 'week' ? ' active' : '';
  const monthActive = period === 'month' ? ' active' : '';

  return '<div class="period-tabs">' +
    '<button class="period-tab' + weekActive + '" onclick="changeDashboardPeriod(\'week\')">📅 Semana</button>' +
    '<button class="period-tab' + monthActive + '" onclick="changeDashboardPeriod(\'month\')">📆 Mês</button>' +
    '</div>';
}
