// Cópia de configurações entre dias no planejador

/**
 * Carregar configuração do dia anterior
 */
function loadConfigFromPreviousDay() {
  const planningDate = parseDateKey(appState.planningDate);
  const previousDay = new Date(planningDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const previousDayKey = getDateKey(previousDay);

  const previousSchedule = appState.userData.dailySchedules?.[previousDayKey];

  if (previousSchedule && previousSchedule.planData) {
    loadPlanDataToWizard(previousSchedule.planData);
    alert('✅ Configuração do dia anterior carregada!');
  } else {
    alert('❌ Não há configuração no dia anterior para copiar.');
  }
}

/**
 * Carregar configuração da semana passada (mesmo dia da semana)
 */
function loadConfigFromLastWeek() {
  const planningDate = parseDateKey(appState.planningDate);
  const lastWeek = new Date(planningDate);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekKey = getDateKey(lastWeek);

  const lastWeekSchedule = appState.userData.dailySchedules?.[lastWeekKey];

  if (lastWeekSchedule && lastWeekSchedule.planData) {
    loadPlanDataToWizard(lastWeekSchedule.planData);
    alert('✅ Configuração da semana passada carregada!');
  } else {
    alert('❌ Não há configuração na semana passada para copiar.');
  }
}

/**
 * Copiar configuração de uma data específica
 * @param {string} sourceDateKey - Chave da data de origem
 */
function loadConfigFromDate(sourceDateKey) {
  const sourceSchedule = appState.userData.dailySchedules?.[sourceDateKey];

  if (sourceSchedule && sourceSchedule.planData) {
    loadPlanDataToWizard(sourceSchedule.planData);
    const sourceDate = parseDateKey(sourceDateKey);
    const sourceDayName = getDayName(sourceDate);
    const sourceFormattedDate = getFormattedDate(sourceDate);
    alert(`✅ Configuração de ${sourceDayName}, ${sourceFormattedDate} carregada!`);
  } else {
    alert('❌ Não há configuração nesta data para copiar.');
  }
}
