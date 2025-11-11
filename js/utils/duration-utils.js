// Utilitários para cálculos de duração de atividades

/**
 * Calcular duração de atividade em minutos
 * @param {Object} activity - Atividade com startTime e endTime
 * @returns {number} Duração em minutos
 */
function calculateActivityDurationMinutes(activity) {
  if (!activity.startTime || !activity.endTime) return 0;

  let start = timeToMinutes(activity.startTime);
  let end = timeToMinutes(activity.endTime);

  // Se atravessa meia-noite
  if (end < start) {
    end += 1440; // adiciona 24h
  }

  return end - start;
}

/**
 * Converter minutos para formato legível
 * @param {number} minutes - Total de minutos
 * @returns {string} Formato "Xh Ymin" ou "Xh" ou "Ymin"
 */
function formatMinutesToReadable(minutes) {
  if (minutes <= 0) return '0min';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

/**
 * Converter minutos para formato de horas decimais
 * @param {number} minutes - Total de minutos
 * @returns {number} Horas em formato decimal (ex: 1.5 para 1h30min)
 */
function minutesToDecimalHours(minutes) {
  return (minutes / 60).toFixed(2);
}

/**
 * Calcular duração total de múltiplas atividades
 * @param {Array} activities - Array de atividades
 * @param {string} type - Tipo de atividade para filtrar (opcional)
 * @returns {number} Duração total em minutos
 */
function calculateTotalDuration(activities, type = null) {
  if (!activities || activities.length === 0) return 0;

  return activities
    .filter(activity => !type || activity.type === type)
    .reduce((total, activity) => {
      return total + calculateActivityDurationMinutes(activity);
    }, 0);
}

/**
 * Calcular média de duração de atividades
 * @param {Array} activities - Array de atividades
 * @param {string} type - Tipo de atividade para filtrar (opcional)
 * @returns {number} Média em minutos
 */
function calculateAverageDuration(activities, type = null) {
  if (!activities || activities.length === 0) return 0;

  const filtered = type ? activities.filter(a => a.type === type) : activities;
  if (filtered.length === 0) return 0;

  const total = calculateTotalDuration(filtered);
  return Math.round(total / filtered.length);
}

/**
 * Verificar se duas atividades se sobrepõem
 * @param {Object} activity1 - Primeira atividade
 * @param {Object} activity2 - Segunda atividade
 * @returns {boolean} True se há sobreposição
 */
function activitiesOverlap(activity1, activity2) {
  const start1 = timeToMinutes(activity1.startTime);
  const end1 = timeToMinutes(activity1.endTime);
  const start2 = timeToMinutes(activity2.startTime);
  const end2 = timeToMinutes(activity2.endTime);

  // Verificar sobreposição
  return (start1 < end2 && end1 > start2);
}
