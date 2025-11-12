// Validação de conflitos de horários em cronogramas

/**
 * Verifica conflitos com o sono do dia anterior
 * @param {Array} schedule - Cronograma atual
 * @param {string} currentDateKey - Chave da data atual
 * @returns {Array} Array de conflitos encontrados
 */
function checkPreviousDayConflicts(schedule, currentDateKey) {
  const conflicts = [];

  if (!currentDateKey || !appState.userData.dailySchedules) {
    return conflicts;
  }

  // Calcular data do dia anterior
  const currentDate = parseDateKey(currentDateKey);
  const previousDate = new Date(currentDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateKey = getDateKey(previousDate);

  const previousSchedule = appState.userData.dailySchedules[previousDateKey];

  if (!previousSchedule || !previousSchedule.planData) {
    return conflicts;
  }

  const previousSleep = previousSchedule.planData;
  const sleepEnd = timeToMinutes(previousSleep.wake);

  // Verificar conflitos com eventos de madrugada (antes das 12:00)
  schedule.forEach(event => {
    if (event.type === 'sleep') return; // Pular o sono do dia atual

    // Pular atividades sem horário fixo (refeições e hidratação)
    if (!event.startTime || !event.endTime) return;

    const eventStart = timeToMinutes(event.startTime);
    const eventEnd = timeToMinutes(event.endTime);

    // Se o evento é de madrugada (horário menor que 12:00 = 720 min)
    if (eventStart < 720 || eventEnd <= 720) {
      // Verificar se conflita com o fim do sono do dia anterior
      if (eventStart < sleepEnd) {
        conflicts.push({
          event1: {
            name: `Dormir (${previousSchedule.dayName})`,
            startTime: previousSleep.sleep,
            endTime: previousSleep.wake
          },
          event2: event
        });
      }
    }
  });

  return conflicts;
}

/**
 * Verifica se dois eventos se sobrepõem
 * @param {number} start1 - Início do evento 1 em minutos
 * @param {number} end1 - Fim do evento 1 em minutos
 * @param {number} start2 - Início do evento 2 em minutos
 * @param {number} end2 - Fim do evento 2 em minutos
 * @returns {boolean} True se há sobreposição
 */
function eventsOverlap(start1, end1, start2, end2) {
  return (start1 < end2 && end1 > start2);
}

/**
 * Verifica conflitos entre eventos do mesmo dia
 * @param {Array} schedule - Cronograma do dia
 * @returns {Array} Array de conflitos encontrados
 */
function checkSameDayConflicts(schedule) {
  const conflicts = [];

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const event1 = schedule[i];
      const event2 = schedule[j];

      // Pular atividades sem horário fixo (refeições e hidratação)
      const time1 = event1.start || event1.startTime;
      const time2 = event2.start || event2.startTime;

      if (!time1 || !time2) {
        continue; // Pular comparação se alguma não tem horário
      }

      // Converter horários para minutos
      const start1 = timeToMinutes(time1);
      let end1 = timeToMinutes(event1.end || event1.endTime);
      const start2 = timeToMinutes(time2);
      let end2 = timeToMinutes(event2.end || event2.endTime);

      // Se fim < início, o evento atravessa meia-noite (adicionar 24h)
      if (end1 < start1) end1 += 1440;
      if (end2 < start2) end2 += 1440;

      // Verificar sobreposição
      if (eventsOverlap(start1, end1, start2, end2)) {
        conflicts.push({
          type: 'overlap',
          message: `${event1.name} (${event1.start || event1.startTime}-${event1.end || event1.endTime}) conflita com ${event2.name} (${event2.start || event2.startTime}-${event2.end || event2.endTime})`,
          event1: event1,
          event2: event2,
          activities: [event1, event2]
        });
      }
    }
  }

  return conflicts;
}

/**
 * Formata mensagem de conflitos para exibição
 * @param {Array} conflicts - Array de conflitos
 * @returns {string} Mensagem formatada
 */
function formatConflictsMessage(conflicts) {
  if (conflicts.length === 0) {
    return '';
  }

  let message = '⚠️ Conflitos de horário detectados:\n\n';

  conflicts.forEach(conflict => {
    message += `• ${conflict.event1.name} (${conflict.event1.startTime}-${conflict.event1.endTime}) conflita com ${conflict.event2.name} (${conflict.event2.startTime}-${conflict.event2.endTime})\n`;
  });

  message += '\nPor favor, ajuste os horários para evitar sobreposições.';

  return message;
}

/**
 * Validar conflitos de horários (função principal)
 * @param {Array} schedule - Cronograma a validar
 * @param {string} currentDateKey - Chave da data atual
 * @returns {Array} Array de conflitos encontrados
 */
function validateScheduleConflicts(schedule, currentDateKey) {
  const conflicts = [];

  // 1. Verificar conflitos com sono do dia anterior
  const previousDayConflicts = checkPreviousDayConflicts(schedule, currentDateKey);
  conflicts.push(...previousDayConflicts);

  // 2. Verificar conflitos entre eventos do mesmo dia
  const sameDayConflicts = checkSameDayConflicts(schedule);
  conflicts.push(...sameDayConflicts);

  return conflicts;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateScheduleConflicts,
    checkSameDayConflicts,
    checkPreviousDayConflicts,
    formatConflictsMessage,
    eventsOverlap
  };
}
