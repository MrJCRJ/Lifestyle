// Construtor de cronogramas - lógica centralizada

/**
 * Adiciona atividades de sono ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {Object} planData - Dados do plano (com sleep e wake)
 */
function addSleepActivities(schedule, planData) {
  const sleepMinutes = timeToMinutes(planData.sleep);
  const wakeMinutes = timeToMinutes(planData.wake);

  // Se wake < sleep, significa que atravessa a meia-noite
  if (wakeMinutes < sleepMinutes) {
    // Parte 1: Acordar (de 00:00 até horário de acordar) - vem primeiro no dia
    schedule.push({
      id: 'sleep-acordar',
      type: 'sleep',
      name: '😴 Acordar',
      startTime: '00:00',
      endTime: planData.wake
    });

    // Parte 2: Dormir (do horário de sono até 23:59) - vem no final do dia
    schedule.push({
      id: 'sleep-dormir',
      type: 'sleep',
      name: '😴 Dormir',
      startTime: planData.sleep,
      endTime: '23:59'
    });
  } else {
    // Sono no mesmo dia (raro, mas possível para cochilos)
    schedule.push({
      id: 'sleep-dormir',
      type: 'sleep',
      name: '😴 Dormir',
      startTime: planData.sleep,
      endTime: planData.wake
    });
  }
}

/**
 * Adiciona atividades de trabalho ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {Array} jobs - Array de trabalhos
 */
function addWorkActivities(schedule, jobs) {
  if (jobs && Array.isArray(jobs)) {
    jobs.forEach((job, jobIndex) => {
      job.times.forEach((time, timeIndex) => {
        schedule.push({
          id: `work-${jobIndex}-${timeIndex}`,
          type: 'work',
          name: job.name,
          startTime: time.start,
          endTime: time.end
        });
      });
    });
  }
}

/**
 * Adiciona atividades de estudo ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {Array} studies - Array de estudos
 */
function addStudyActivities(schedule, studies) {
  if (studies && Array.isArray(studies)) {
    studies.forEach((study, studyIndex) => {
      study.times.forEach((time, timeIndex) => {
        schedule.push({
          id: `study-${studyIndex}-${timeIndex}`,
          type: 'study',
          name: study.name,
          startTime: time.start,
          endTime: time.end
        });
      });
    });
  }
}

/**
 * Adiciona atividade de limpeza ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {Object} cleaning - Dados da limpeza
 */
function addCleaningActivity(schedule, cleaning) {
  if (cleaning) {
    schedule.push({
      id: 'cleaning-0',
      type: 'cleaning',
      name: 'Limpeza / Organização',
      startTime: cleaning.start,
      endTime: cleaning.end,
      notes: cleaning.notes
    });
  }
}

/**
 * Adiciona atividades de refeições ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {number} mealsCount - Quantidade de refeições
 */
function addMealActivities(schedule, mealsCount) {
  if (mealsCount && mealsCount > 0) {
    for (let i = 0; i < mealsCount; i++) {
      schedule.push({
        id: `meal-${i}`,
        type: 'meal',
        name: `🍽️ Refeição ${i + 1}`,
        // Sem horário fixo - usuário marca quando fizer
        startTime: null,
        endTime: null,
        duration: 0
      });
    }
  }
}

/**
 * Adiciona atividade de exercício ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {Object} exercise - Dados do exercício
 */
function addExerciseActivity(schedule, exercise) {
  if (exercise) {
    schedule.push({
      id: 'exercise-0',
      type: 'exercise',
      name: `💪 ${exercise.type}`,
      startTime: exercise.start,
      endTime: exercise.end
    });
  }
}

/**
 * Adiciona atividade de hidratação ao cronograma
 * @param {Array} schedule - Array de atividades
 * @param {number} waterGoal - Meta de água em ml
 */
function addHydrationActivity(schedule, waterGoal) {
  if (waterGoal) {
    schedule.push({
      id: 'hydration-daily',
      type: 'hydration',
      name: '💧 Hidratação Diária',
      startTime: '23:59',
      endTime: '23:59',
      waterGoal: waterGoal,
      duration: 0
    });
  }
}

/**
 * Constrói cronograma completo a partir dos dados do plano (formato 24h)
 * @param {Object} planData - Dados do plano
 * @param {number} waterGoal - Meta de água (opcional)
 * @returns {Array} Array de atividades ordenadas de 00:00 a 23:59
 */
function buildScheduleFromPlanData(planData, waterGoal = null) {
  const schedule = [];

  // Adicionar atividades com horário fixo
  addSleepActivities(schedule, planData);
  addWorkActivities(schedule, planData.jobs);
  addStudyActivities(schedule, planData.studies);
  addCleaningActivity(schedule, planData.cleaning);
  addExerciseActivity(schedule, planData.exercise);

  // Ordenar por horário (00:00 até 23:59) - apenas atividades com horário fixo
  schedule.sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });

  // Adicionar refeições no final (não têm horário fixo, usuário marca quando fizer)
  addMealActivities(schedule, planData.mealsCount);

  // Adicionar hidratação no final (não tem horário fixo)
  addHydrationActivity(schedule, waterGoal);

  return schedule;
}

/**
 * Preserva status de tracking de um cronograma existente
 * @param {Array} newSchedule - Novo cronograma
 * @param {Array} existingActivities - Atividades existentes com status
 */
function preserveTrackingStatus(newSchedule, existingActivities) {
  if (!existingActivities || !Array.isArray(existingActivities)) {
    return;
  }

  newSchedule.forEach(newActivity => {
    // Encontrar atividade correspondente pelo ID (mais confiável) ou pelo tipo e nome
    const existingActivity = existingActivities.find(
      act => (act.id && act.id === newActivity.id) ||
        (act.type === newActivity.type && act.name === newActivity.name)
    );

    if (existingActivity) {
      // Preservar rastreamento simples
      if (existingActivity.simpleTracking) {
        newActivity.simpleTracking = { ...existingActivity.simpleTracking };
      }

      // Preservar tracking de água
      if (existingActivity.waterTracking) {
        newActivity.waterTracking = { ...existingActivity.waterTracking };
      }

      // Preservar ajustes de horário
      if (existingActivity.originalTime) {
        newActivity.originalTime = { ...existingActivity.originalTime };
        newActivity.timeAdjusted = existingActivity.timeAdjusted;
      }
    }
  });
}
