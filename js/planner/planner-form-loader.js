// Carregamento de formulários do planejador

/**
 * Limpar todos os formulários do planejador
 */
function clearPlannerForms() {
  // Limpar sono
  document.getElementById('plannerSleepTime').value = '';
  document.getElementById('plannerWakeTime').value = '';

  // Limpar trabalho
  document.querySelectorAll('input[name="plannerHasWork"]').forEach(radio => radio.checked = false);
  document.getElementById('planner-work-details').style.display = 'none';
  document.getElementById('planner-jobs-container').innerHTML = '';

  // Limpar estudo
  document.querySelectorAll('input[name="plannerHasStudy"]').forEach(radio => radio.checked = false);
  document.getElementById('planner-study-details').style.display = 'none';
  document.getElementById('planner-studies-container').innerHTML = '';

  // Limpar limpeza
  document.querySelectorAll('input[name="plannerHasCleaning"]').forEach(radio => radio.checked = false);
  document.getElementById('planner-cleaning-details').style.display = 'none';
  document.getElementById('plannerCleaningStartTime').value = '';
  document.getElementById('plannerCleaningEndTime').value = '';
  document.getElementById('plannerCleaningNotes').value = '';

  // Limpar projetos
  document.querySelectorAll('input[name="plannerHasProject"]').forEach(radio => radio.checked = false);
  document.getElementById('planner-project-details').style.display = 'none';
  document.getElementById('planner-projects-container').innerHTML = '';
}

/**
 * Carregar dados de sono no planejador
 */
function loadPlannerSleepData(planData) {
  const sleepInput = document.getElementById('plannerSleepTime');
  const wakeInput = document.getElementById('plannerWakeTime');

  if (sleepInput) sleepInput.value = planData.sleep || '';
  if (wakeInput) wakeInput.value = planData.wake || '';
}

/**
 * Carregar dados de trabalho no planejador
 */
function loadPlannerWorkData(planData) {
  const plannerJobsContainer = document.getElementById('planner-jobs-container');
  if (!plannerJobsContainer) return;

  if (planData.jobs && planData.jobs.length > 0) {
    const yesRadio = document.querySelector('input[name="plannerHasWork"][value="yes"]');
    if (yesRadio) yesRadio.checked = true;

    // Mostrar detalhes primeiro
    const detailsDiv = document.getElementById('planner-work-details');
    if (detailsDiv) detailsDiv.style.display = 'block';

    // Renderizar quick configs
    if (typeof renderQuickConfigs === 'function') {
      renderQuickConfigs('jobs', 'planner-work-quick-configs', addPlannerJobSlot);
    }

    // Carregar jobs existentes
    plannerJobsContainer.innerHTML = '';
    plannerJobCounter = 0;
    planData.jobs.forEach(job => {
      addPlannerJobSlot(job);
    });
  } else {
    const noRadio = document.querySelector('input[name="plannerHasWork"][value="no"]');
    if (noRadio) noRadio.checked = true;
    togglePlannerWorkForm(false);
  }
}

/**
 * Carregar dados de estudo no planejador
 */
function loadPlannerStudyData(planData) {
  const plannerStudiesContainer = document.getElementById('planner-studies-container');
  if (!plannerStudiesContainer) return;

  if (planData.studies && planData.studies.length > 0) {
    const yesRadio = document.querySelector('input[name="plannerHasStudy"][value="yes"]');
    if (yesRadio) yesRadio.checked = true;

    // Mostrar detalhes primeiro
    const detailsDiv = document.getElementById('planner-study-details');
    if (detailsDiv) detailsDiv.style.display = 'block';

    // Renderizar quick configs
    if (typeof renderQuickConfigs === 'function') {
      renderQuickConfigs('studies', 'planner-study-quick-configs', addPlannerStudySlot);
    }

    // Carregar estudos existentes
    plannerStudiesContainer.innerHTML = '';
    plannerStudyCounter = 0;
    planData.studies.forEach(study => {
      addPlannerStudySlot(study);
    });
  } else {
    const noRadio = document.querySelector('input[name="plannerHasStudy"][value="no"]');
    if (noRadio) noRadio.checked = true;
    togglePlannerStudyForm(false);
  }
}

/**
 * Carregar dados de limpeza no planejador
 */
function loadPlannerCleaningData(planData) {
  if (!planData.cleaning) {
    const noRadio = document.querySelector('input[name="plannerHasCleaning"][value="no"]');
    if (noRadio) noRadio.checked = true;
    togglePlannerCleaningForm(false);
    return;
  }

  const yesRadio = document.querySelector('input[name="plannerHasCleaning"][value="yes"]');
  if (yesRadio) yesRadio.checked = true;
  togglePlannerCleaningForm(true);

  const startTime = document.getElementById('plannerCleaningStartTime');
  const endTime = document.getElementById('plannerCleaningEndTime');
  const notes = document.getElementById('plannerCleaningNotes');

  if (startTime) startTime.value = planData.cleaning.start || '';
  if (endTime) endTime.value = planData.cleaning.end || '';
  if (notes) notes.value = planData.cleaning.notes || '';
}

/**
 * Carregar dados de projetos no planejador
 */
function loadPlannerProjectData(planData) {
  const plannerProjectsContainer = document.getElementById('planner-projects-container');
  if (!plannerProjectsContainer) return;

  if (planData.projects && planData.projects.length > 0) {
    const yesRadio = document.querySelector('input[name="plannerHasProject"][value="yes"]');
    if (yesRadio) yesRadio.checked = true;

    // Mostrar detalhes primeiro
    const detailsDiv = document.getElementById('planner-project-details');
    if (detailsDiv) detailsDiv.style.display = 'block';

    // Renderizar quick configs
    if (typeof renderQuickConfigs === 'function') {
      renderQuickConfigs('projects', 'planner-project-quick-configs', addPlannerProjectSlot);
    }

    // Carregar projetos existentes
    plannerProjectsContainer.innerHTML = '';
    plannerProjectCounter = 0;
    planData.projects.forEach(project => {
      addPlannerProjectSlot(project);
    });
  } else {
    const noRadio = document.querySelector('input[name="plannerHasProject"][value="no"]');
    if (noRadio) noRadio.checked = true;
    togglePlannerProjectForm(false);
  }
}

/**
 * Carregar dados de refeições no planejador
 */
function loadPlannerMealsFormData(planData) {
  const mealsCount = planData.mealsCount || appState.userData.userProfile?.mealsCount;

  if (mealsCount && mealsCount > 0) {
    const yesRadio = document.querySelector('input[name="plannerHasMeals"][value="yes"]');
    if (yesRadio) yesRadio.checked = true;
    togglePlannerMealsForm(true);

    const mealsCountInput = document.getElementById('plannerMealsCount');
    if (mealsCountInput) mealsCountInput.value = mealsCount;
  } else {
    const noRadio = document.querySelector('input[name="plannerHasMeals"][value="no"]');
    if (noRadio) noRadio.checked = true;
    togglePlannerMealsForm(false);
  }
}

/**
 * Carregar todos os dados do plano para o wizard de planejamento
 */
function loadPlanDataToWizard(planData) {
  if (!planData) return;

  // Armazenar em tempPlanData para edição (fazer cópia profunda)
  appState.tempPlanData = JSON.parse(JSON.stringify(planData));

  // Carregar cada seção
  loadPlannerSleepData(planData);
  loadPlannerWorkData(planData);
  loadPlannerStudyData(planData);
  loadPlannerCleaningData(planData);
  loadPlannerProjectData(planData);
  loadPlannerMealsFormData(planData);
}
