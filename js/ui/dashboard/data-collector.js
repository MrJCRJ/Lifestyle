// Coleta e agregação de dados do dashboard

/**
 * Coleta dados agregados dos cronogramas
 * @param {string} period - 'week' ou 'month'
 * @returns {Object} Dados agregados
 */
function collectDashboardData(period = 'week') {
  const schedules = appState.userData.dailySchedules || {};
  const scheduleKeys = Object.keys(schedules);

  if (scheduleKeys.length === 0) {
    return { isEmpty: true };
  }

  // Filtrar por período
  const today = new Date();
  const daysToInclude = period === 'week' ? 7 : 30;

  const filteredKeys = scheduleKeys.filter(dateKey => {
    const scheduleDate = parseDateKey(dateKey);
    const daysDiff = Math.floor((today - scheduleDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff < daysToInclude;
  }).sort();

  if (filteredKeys.length === 0) {
    return { isEmpty: true, period };
  }

  const stats = initializeStats(period, filteredKeys.length);

  // Processar cada dia
  filteredKeys.reverse().forEach(dateKey => {
    const schedule = schedules[dateKey];
    if (!schedule.activities) return;

    const dayData = createDayData(dateKey, schedule.activities.length);

    schedule.activities.forEach(activity => {
      processActivity(activity, stats, dayData);
    });

    stats.recentDays.push(dayData);
  });

  // Calcular métricas finais
  calculateFinalMetrics(stats);

  return stats;
}

/**
 * Inicializa estrutura de estatísticas
 */
function initializeStats(period, totalDays) {
  return {
    period,
    totalDays,
    activities: {
      work: { count: 0, totalMinutes: 0 },
      study: { count: 0, totalMinutes: 0 },
      exercise: { count: 0, totalMinutes: 0 },
      sleep: { count: 0, totalMinutes: 0 },
      cleaning: { count: 0, totalMinutes: 0 },
      hobby: { count: 0, totalMinutes: 0 },
      projects: { count: 0, totalMinutes: 0 }
    },
    meals: {
      total: 0,
      completed: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    },
    hydration: {
      totalConsumed: 0,
      totalGoal: 0,
      daysTracked: 0
    },
    completion: {
      completed: 0,
      incomplete: 0,
      total: 0
    },
    health: {
      weights: [],
      heights: []
    },
    recentDays: []
  };
}

/**
 * Cria dados de um dia
 */
function createDayData(dateKey, activityCount) {
  return {
    date: dateKey,
    formattedDate: getFormattedDate(dateKey),
    dayName: getDayName(dateKey),
    activityCount: activityCount,
    completedCount: 0
  };
}

/**
 * Processa uma atividade e atualiza estatísticas
 */
function processActivity(activity, stats, dayData) {
  const duration = calculateActivityDurationMinutes(activity);
  const type = activity.type;

  // Contar atividades por tipo
  if (stats.activities[type]) {
    stats.activities[type].count++;
    stats.activities[type].totalMinutes += duration;
  }

  // Contar refeições
  if (type === 'meal') {
    processMeal(activity, stats);
  }

  // Contar hidratação e coletar dados de saúde
  if (type === 'hydration' && activity.waterTracking) {
    processHydration(activity, stats);
  }

  // Contar conclusões
  if (activity.simpleTracking) {
    processCompletion(activity, stats, dayData);
  }
}

/**
 * Processa dados de refeições
 */
function processMeal(activity, stats) {
  stats.meals.total++;

  if (activity.simpleTracking && activity.simpleTracking.status === 'complete') {
    stats.meals.completed++;
  }

  const mealType = activity.mealType || 'snacks';
  if (stats.meals[mealType] !== undefined) {
    stats.meals[mealType]++;
  }
}

/**
 * Processa dados de hidratação
 */
function processHydration(activity, stats) {
  stats.hydration.totalConsumed += activity.waterTracking.consumed || 0;
  stats.hydration.totalGoal += activity.waterTracking.goal || 0;
  stats.hydration.daysTracked++;

  // Coletar dados de saúde
  if (activity.waterTracking.weight) {
    stats.health.weights.push(activity.waterTracking.weight);
  }
  if (activity.waterTracking.height) {
    stats.health.heights.push(activity.waterTracking.height);
  }
}

/**
 * Processa dados de conclusão
 */
function processCompletion(activity, stats, dayData) {
  stats.completion.total++;
  if (activity.simpleTracking.status === 'complete') {
    stats.completion.completed++;
    dayData.completedCount++;
  } else {
    stats.completion.incomplete++;
  }
}

/**
 * Calcula métricas finais
 */
function calculateFinalMetrics(stats) {
  // Taxa de conclusão
  stats.completion.rate = stats.completion.total > 0
    ? Math.round((stats.completion.completed / stats.completion.total) * 100)
    : 0;

  // Média de hidratação
  calculateHydrationMetrics(stats);

  // Métricas de saúde
  calculateHealthMetrics(stats);
}

/**
 * Calcula métricas de hidratação
 */
function calculateHydrationMetrics(stats) {
  stats.hydration.average = stats.hydration.daysTracked > 0
    ? Math.round(stats.hydration.totalConsumed / stats.hydration.daysTracked)
    : 0;

  stats.hydration.goalAverage = stats.hydration.daysTracked > 0
    ? Math.round(stats.hydration.totalGoal / stats.hydration.daysTracked)
    : 0;

  stats.hydration.percentage = stats.hydration.goalAverage > 0
    ? Math.round((stats.hydration.average / stats.hydration.goalAverage) * 100)
    : 0;
}

/**
 * Calcula métricas de saúde
 */
function calculateHealthMetrics(stats) {
  // Processar pesos
  if (stats.health.weights.length > 0) {
    stats.health.currentWeight = stats.health.weights[stats.health.weights.length - 1];
    stats.health.averageWeight = Math.round(
      stats.health.weights.reduce((sum, w) => sum + w, 0) / stats.health.weights.length
    );
    stats.health.firstWeight = stats.health.weights[0];
    stats.health.weightChange = stats.health.currentWeight - stats.health.firstWeight;
  }

  if (stats.health.heights.length > 0) {
    stats.health.currentHeight = stats.health.heights[stats.health.heights.length - 1];
  }

  // Fallback para perfil do usuário
  applyProfileFallback(stats);

  // Calcular IMC e peso ideal
  if (stats.health.currentWeight && stats.health.currentHeight) {
    calculateBMIAndIdealWeight(stats);
  }
}

/**
 * Aplica dados do perfil como fallback
 */
function applyProfileFallback(stats) {
  if (!stats.health.currentWeight && appState.userData.userProfile?.weight) {
    stats.health.currentWeight = appState.userData.userProfile.weight;
    stats.health.averageWeight = appState.userData.userProfile.weight;
    stats.health.firstWeight = appState.userData.userProfile.weight;
    stats.health.weightChange = 0;
    stats.health.fromProfile = true;
  }

  if (!stats.health.currentHeight && appState.userData.userProfile?.height) {
    stats.health.currentHeight = appState.userData.userProfile.height;
    stats.health.fromProfile = true;
  }
}

/**
 * Calcula IMC e peso ideal
 */
function calculateBMIAndIdealWeight(stats) {
  const heightInMeters = stats.health.currentHeight / 100;
  stats.health.bmi = (stats.health.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);

  // Classificação do IMC
  const bmi = parseFloat(stats.health.bmi);
  if (bmi < 18.5) {
    stats.health.bmiCategory = 'Abaixo do peso';
    stats.health.bmiColor = '#f59e0b';
  } else if (bmi < 25) {
    stats.health.bmiCategory = 'Peso normal';
    stats.health.bmiColor = '#10b981';
  } else if (bmi < 30) {
    stats.health.bmiCategory = 'Sobrepeso';
    stats.health.bmiColor = '#f59e0b';
  } else {
    stats.health.bmiCategory = 'Obesidade';
    stats.health.bmiColor = '#ef4444';
  }

  // Peso ideal (fórmula: 22 * altura²)
  const idealWeight = Math.round(22 * (heightInMeters * heightInMeters));
  stats.health.idealWeight = idealWeight;
  stats.health.weightDifference = stats.health.currentWeight - idealWeight;
}

/**
 * Calcula duração de uma atividade em minutos
 */
function calculateActivityDurationMinutes(activity) {
  if (!activity.startTime || !activity.endTime) return 0;

  const start = activity.startTime.split(':').map(Number);
  const end = activity.endTime.split(':').map(Number);

  let duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);

  if (duration < 0) {
    duration += 24 * 60;
  }

  return duration;
}
