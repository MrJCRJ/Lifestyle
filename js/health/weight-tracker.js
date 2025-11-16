// Gerenciamento de Histórico de Peso

/**
 * Estrutura do histórico de peso:
 * weightHistory: [
 *   {
 *     id: "weight_001",
 *     date: "2025-11-15",
 *     weight: 71.2,
 *     bmi: 23.2,
 *     registeredAt: "2025-11-15T08:30:00",
 *     note: "Observação opcional"
 *   }
 * ]
 */

// Inicializar histórico de peso
function initializeWeightHistory() {
  if (!appState.userData.weightHistory) {
    appState.userData.weightHistory = [];
  }
}

// Adicionar novo registro de peso
function addWeightRecord(weightData) {
  initializeWeightHistory();

  const { date, weight, note } = weightData;

  // Validações
  if (!date || !weight) {
    console.error('Data e peso são obrigatórios');
    return false;
  }

  if (weight <= 0 || weight > 500) {
    console.error('Peso inválido');
    return false;
  }

  // Verificar se já existe registro para esta data
  const existingIndex = appState.userData.weightHistory.findIndex(
    record => record.date === date
  );

  const height = appState.userData.userProfile?.height || 170;
  const bmi = calculateBMI(weight, height);

  const newRecord = {
    id: `weight_${Date.now()}`,
    date: date,
    weight: parseFloat(weight),
    bmi: bmi,
    registeredAt: new Date().toISOString(),
    note: note || ''
  };

  if (existingIndex >= 0) {
    // Atualizar registro existente
    appState.userData.weightHistory[existingIndex] = newRecord;
  } else {
    // Adicionar novo registro
    appState.userData.weightHistory.push(newRecord);
  }

  // Ordenar por data (mais recente primeiro)
  appState.userData.weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Atualizar meta de água automaticamente
  if (typeof updateWaterGoal === 'function') {
    updateWaterGoal();
  }

  saveToStorage();
  return true;
}

// Obter registro de peso por data
function getWeightByDate(date) {
  if (!appState.userData.weightHistory) {
    return null;
  }

  return appState.userData.weightHistory.find(record => record.date === date);
}

// Obter peso mais recente
function getLatestWeight() {
  if (!appState.userData.weightHistory || appState.userData.weightHistory.length === 0) {
    return null;
  }

  const sorted = [...appState.userData.weightHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return sorted[0];
}

// Obter primeiro peso registrado (peso inicial)
function getInitialWeight() {
  if (!appState.userData.weightHistory || appState.userData.weightHistory.length === 0) {
    return null;
  }

  const sorted = [...appState.userData.weightHistory].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return sorted[0];
}

// Obter histórico completo ordenado por data
function getWeightHistory(order = 'desc') {
  if (!appState.userData.weightHistory) {
    return [];
  }

  const sorted = [...appState.userData.weightHistory].sort((a, b) => {
    return order === 'desc'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  return sorted;
}

// Obter histórico dos últimos N dias
function getWeightHistoryLastDays(days) {
  const history = getWeightHistory('desc');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return history.filter(record => new Date(record.date) >= cutoffDate);
}

// Calcular variação de peso entre duas datas
function calculateWeightChange(startDate, endDate) {
  const start = getWeightByDate(startDate);
  const end = getWeightByDate(endDate);

  if (!start || !end) {
    return null;
  }

  const change = end.weight - start.weight;
  const percentChange = (change / start.weight) * 100;

  return {
    absolute: change,
    percent: percentChange,
    direction: change > 0 ? 'gain' : change < 0 ? 'loss' : 'stable'
  };
}

// Calcular variação total (primeiro ao último registro)
function calculateTotalWeightChange() {
  const initial = getInitialWeight();
  const latest = getLatestWeight();

  if (!initial || !latest || initial.id === latest.id) {
    return null;
  }

  const change = latest.weight - initial.weight;
  const percentChange = (change / initial.weight) * 100;

  return {
    initialWeight: initial.weight,
    initialDate: initial.date,
    currentWeight: latest.weight,
    currentDate: latest.date,
    absolute: change,
    percent: percentChange,
    direction: change > 0 ? 'gain' : change < 0 ? 'loss' : 'stable'
  };
}

// Calcular média de peso em um período
function calculateAverageWeight(days = 7) {
  const history = getWeightHistoryLastDays(days);

  if (history.length === 0) {
    return null;
  }

  const sum = history.reduce((acc, record) => acc + record.weight, 0);
  return Math.round((sum / history.length) * 10) / 10;
}

// Calcular taxa média de perda/ganho de peso (kg/mês)
function calculateWeightTrend() {
  const history = getWeightHistory('asc');

  if (history.length < 2) {
    return null;
  }

  const first = history[0];
  const last = history[history.length - 1];

  const daysDiff = Math.abs(new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
  const weightDiff = last.weight - first.weight;

  if (daysDiff === 0) {
    return null;
  }

  // Taxa em kg/mês
  const monthlyRate = (weightDiff / daysDiff) * 30;

  return {
    rate: monthlyRate,
    direction: monthlyRate > 0 ? 'gaining' : monthlyRate < 0 ? 'losing' : 'stable',
    description: monthlyRate > 0
      ? `Ganho de ${Math.abs(monthlyRate).toFixed(1)} kg/mês`
      : monthlyRate < 0
        ? `Perda de ${Math.abs(monthlyRate).toFixed(1)} kg/mês`
        : 'Peso estável'
  };
}

// Remover registro de peso
function deleteWeightRecord(recordId) {
  if (!appState.userData.weightHistory) {
    return false;
  }

  const index = appState.userData.weightHistory.findIndex(record => record.id === recordId);

  if (index === -1) {
    return false;
  }

  appState.userData.weightHistory.splice(index, 1);
  saveToStorage();

  // Atualizar meta de água se necessário
  if (typeof updateWaterGoal === 'function') {
    updateWaterGoal();
  }

  return true;
}

// Obter estatísticas completas
function getWeightStatistics() {
  const latest = getLatestWeight();
  const initial = getInitialWeight();
  const totalChange = calculateTotalWeightChange();
  const trend = calculateWeightTrend();
  const average7days = calculateAverageWeight(7);
  const average30days = calculateAverageWeight(30);
  const history = getWeightHistory('desc');

  const goal = appState.userData.userProfile?.weightGoal;
  const height = appState.userData.userProfile?.height;

  let goalProgress = null;
  if (goal && latest) {
    const remaining = latest.weight - goal;
    const direction = remaining > 0 ? 'lose' : 'gain';
    const achieved = Math.abs(remaining) < 0.5;

    goalProgress = {
      goal: goal,
      current: latest.weight,
      remaining: Math.abs(remaining),
      direction: direction,
      achieved: achieved,
      percentage: initial ? Math.min(100, ((initial.weight - latest.weight) / (initial.weight - goal)) * 100) : 0
    };
  }

  return {
    latest: latest,
    initial: initial,
    totalRecords: history.length,
    totalChange: totalChange,
    trend: trend,
    averages: {
      week: average7days,
      month: average30days
    },
    goalProgress: goalProgress,
    currentBMI: latest?.bmi,
    bmiClassification: latest ? getBMIClassification(latest.bmi) : null
  };
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addWeightRecord,
    getWeightByDate,
    getLatestWeight,
    getInitialWeight,
    getWeightHistory,
    calculateWeightChange,
    calculateTotalWeightChange,
    calculateAverageWeight,
    calculateWeightTrend,
    deleteWeightRecord,
    getWeightStatistics
  };
}
