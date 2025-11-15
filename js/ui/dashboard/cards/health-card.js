// Card de Objetivos de Saúde

/**
 * Renderiza card de saúde
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderHealthCard(data) {
  if (!data.health || !data.health.currentWeight || !data.health.currentHeight) {
    return renderEmptyHealthCard();
  }

  const healthInfo = calculateHealthInfo(data.health);
  const dataSourceHTML = createDataSourceBadge(data.health.fromProfile);
  const metricsHTML = createHealthMetrics(data.health);
  const progressBarHTML = createWeightProgressBar(data.health, healthInfo);
  const periodProgressHTML = createPeriodProgress(data.health, healthInfo);

  return '<div class="dashboard-card health-card">' +
    '<h3>💪 Objetivos de Saúde</h3>' +
    dataSourceHTML +
    '<div class="health-content">' +
    metricsHTML +
    progressBarHTML +
    periodProgressHTML +
    '</div>' +
    '</div>';
}

/**
 * Renderiza card vazio
 */
function renderEmptyHealthCard() {
  return '<div class="dashboard-card health-card">' +
    '<h3>💪 Objetivos de Saúde</h3>' +
    '<div class="health-empty">' +
    '<div class="empty-icon">⚖️</div>' +
    '<p class="no-data">Configure peso e altura no planner de hidratação para ver suas métricas de saúde</p>' +
    '<button onclick="showPlannerNavigation()" class="btn btn-primary">Configurar Agora</button>' +
    '</div>' +
    '</div>';
}

/**
 * Calcula informações de saúde
 */
function calculateHealthInfo(health) {
  const weightDiff = health.weightDifference;
  const absWeightDiff = Math.abs(weightDiff);
  const isOverweight = weightDiff > 0;
  const isUnderweight = weightDiff < 0;
  const isIdeal = Math.abs(weightDiff) < 2;

  let goalIcon, goalMessage, goalColor;
  if (isIdeal) {
    goalIcon = '🎯';
    goalMessage = 'Você está no peso ideal!';
    goalColor = '#10b981';
  } else if (isOverweight) {
    goalIcon = '📉';
    goalMessage = 'Falta perder ' + absWeightDiff.toFixed(1) + ' kg';
    goalColor = '#f59e0b';
  } else {
    goalIcon = '📈';
    goalMessage = 'Falta ganhar ' + absWeightDiff.toFixed(1) + ' kg';
    goalColor = '#3b82f6';
  }

  return {
    absWeightDiff,
    isOverweight,
    isUnderweight,
    isIdeal,
    goalIcon,
    goalMessage,
    goalColor
  };
}

/**
 * Cria badge de fonte de dados
 */
function createDataSourceBadge(fromProfile) {
  const text = fromProfile ? '📋 Dados do seu perfil' : '📊 Dados do período selecionado';
  return '<div class="data-source">' + text + '</div>';
}

/**
 * Cria métricas de saúde
 */
function createHealthMetrics(health) {
  return '<div class="health-metrics">' +
    createMetric('⚖️', 'Peso Atual', health.currentWeight + ' kg', false) +
    createMetric('📏', 'Altura', health.currentHeight + ' cm', false) +
    createMetric('📊', 'IMC', health.bmi, true, health.bmiCategory, health.bmiColor) +
    '</div>';
}

/**
 * Cria uma métrica
 */
function createMetric(icon, label, value, highlight, category, color) {
  const highlightClass = highlight ? ' highlight' : '';
  const categoryHTML = category
    ? '<span class="metric-category">' + category + '</span>'
    : '';
  const valueStyle = color ? ' style="color: ' + color + '"' : '';

  return '<div class="health-metric' + highlightClass + '">' +
    '<div class="metric-icon">' + icon + '</div>' +
    '<div class="metric-info">' +
    '<div class="metric-label">' + label + '</div>' +
    '<div class="metric-value"' + valueStyle + '>' + value + categoryHTML + '</div>' +
    '</div>' +
    '</div>';
}

/**
 * Cria barra de progresso de peso
 */
function createWeightProgressBar(health, info) {
  const minWeight = Math.min(health.currentWeight, health.idealWeight) - 5;
  const maxWeight = Math.max(health.currentWeight, health.idealWeight) + 5;
  const range = maxWeight - minWeight;
  const currentPos = ((health.currentWeight - minWeight) / range) * 100;
  const idealPos = ((health.idealWeight - minWeight) / range) * 100;

  return '<div class="weight-progress-container">' +
    '<div class="weight-progress-label">' +
    '<span>' + info.goalIcon + ' ' + info.goalMessage + '</span>' +
    '<span style="color: ' + info.goalColor + '; font-weight: 700;">' +
    info.absWeightDiff.toFixed(1) + ' kg</span>' +
    '</div>' +
    '<div class="weight-progress-bar">' +
    createWeightMarker('current', currentPos, 'Atual', health.currentWeight) +
    createWeightMarker('ideal', idealPos, 'Ideal', health.idealWeight) +
    '<div class="progress-line"></div>' +
    '</div>' +
    '</div>';
}

/**
 * Cria marcador de peso
 */
function createWeightMarker(type, position, label, weight) {
  return '<div class="weight-marker ' + type + '" style="left: ' + position + '%">' +
    '<div class="marker-label">' + label + '<br>' + weight + 'kg</div>' +
    '</div>';
}

/**
 * Cria progresso no período
 */
function createPeriodProgress(health, info) {
  if (health.weights.length <= 1 || health.fromProfile) {
    return '';
  }

  const change = health.weightChange;
  const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
  const changeColor = getChangeColor(change, info.isOverweight, info.isUnderweight);
  const changeText = change > 0 ? 'Ganhou' : change < 0 ? 'Perdeu' : 'Manteve';

  return '<div class="health-period-progress">' +
    '<span class="progress-icon">' + changeIcon + '</span>' +
    '<span class="progress-text" style="color: ' + changeColor + '">' +
    changeText + ' ' + Math.abs(change).toFixed(1) + ' kg no período' +
    '</span>' +
    '</div>';
}

/**
 * Define cor da mudança de peso
 */
function getChangeColor(change, isOverweight, isUnderweight) {
  if ((isOverweight && change < 0) || (isUnderweight && change > 0)) {
    return '#10b981'; // Verde - mudança positiva
  }
  if ((isOverweight && change > 0) || (isUnderweight && change < 0)) {
    return '#ef4444'; // Vermelho - mudança negativa
  }
  return '#6b7280'; // Cinza - sem mudança
}
