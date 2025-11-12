// Salvamento final do planejamento

/**
 * Preservar status de tracking de atividades existentes
 * @param {Array} newSchedule - Novo cronograma
 * @param {Array} existingActivities - Atividades existentes
 */
function preservePlannerTrackingStatus(newSchedule, existingActivities) {
  if (!existingActivities) return;

  newSchedule.forEach(newActivity => {
    // Encontrar atividade correspondente pelo ID ou tipo+nome
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

/**
 * Finalizar salvamento do planejamento
 */
function finalizePlannerSave() {
  const planningDateKey = appState.planningDate;
  const planningDate = parseDateKey(planningDateKey);
  const dayName = getDayName(planningDate);
  const formattedDate = getFormattedDate(planningDate);
  const todayKey = getDateKey(new Date());
  const isToday = planningDateKey === todayKey;

  const planData = appState.tempPlanData
    ? JSON.parse(JSON.stringify(appState.tempPlanData))
    : null;

  if (!planData) {
    alert('Nenhum dado de planejamento encontrado. Salve pelo menos uma categoria antes de finalizar.');
    return;
  }

  if (!planData.sleep || !planData.wake) {
    alert('Por favor, salve os horários de sono e acordar antes de finalizar o planejamento.');
    return;
  }

  // Gerar cronograma do dia planejado
  const schedule = generateScheduleFromData(planData);

  if (!Array.isArray(schedule) || schedule.length === 0) {
    alert('Nenhuma atividade foi gerada. Verifique se todas as categorias foram salvas corretamente e tente novamente.');
    return;
  }

  // Validar conflitos incluindo sono do dia anterior
  const conflicts = validateScheduleConflicts(schedule, planningDateKey);
  if (conflicts.length > 0) {
    const message = formatConflictsMessage(conflicts);
    alert(message);
    return;
  }

  // Preservar status de atividades existentes
  const existingSchedule = appState.userData.dailySchedules[planningDateKey];
  if (existingSchedule && existingSchedule.activities) {
    preservePlannerTrackingStatus(schedule, existingSchedule.activities);
  }

  // Salvar no dailySchedules
  appState.userData.dailySchedules[planningDateKey] = {
    date: planningDateKey,
    dayName: dayName,
    formattedDate: formattedDate,
    planData: planData,
    activities: schedule,
    createdAt: existingSchedule?.createdAt || new Date().toISOString(),
    lastSaved: new Date().toISOString(),
    isPlanned: !isToday
  };

  saveToStorage();

  // Limpar dados temporários
  appState.tempPlanData = null;
  appState.isPlanningMode = false;
  appState.planningDate = null;

  // Esconder navbar
  const navbar = document.getElementById('planner-navbar');
  if (navbar) navbar.style.display = 'none';


  const message = isToday ? 'Cronograma de hoje atualizado!' : `Planejamento para ${dayName} salvo!`;
  alert(`✅ ${message}`);
  goToSchedules();
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    finalizePlannerSave
  };
}
