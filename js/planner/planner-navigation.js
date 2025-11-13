// Navegação e controle de telas do planejador

// Mostrar planejador diário para uma data específica
function planSpecificDay(dateKey) {
  // Converter YYYY-MM-DD para Date local (sem timezone)
  const date = parseDateKey(dateKey);
  const dayName = getDayName(date);
  const formattedDate = getFormattedDate(date);

  // Armazenar data sendo planejada no estado
  appState.planningDate = dateKey;
  appState.isPlanningMode = true;

  // Resetar contadores (importado de planner-work-handlers e planner-study-handlers)
  if (typeof resetPlannerJobCounter === 'function') resetPlannerJobCounter();
  if (typeof resetPlannerStudyCounter === 'function') resetPlannerStudyCounter();
  if (typeof resetPlannerProjectCounter === 'function') resetPlannerProjectCounter();

  // Atualizar displays em todas as telas
  const elements = {
    sleep: document.getElementById('planner-sleep-day-name'),
    work: document.getElementById('planner-work-day-name'),
    study: document.getElementById('planner-study-day-name'),
    cleaning: document.getElementById('planner-cleaning-day-name'),
    projects: document.getElementById('planner-projects-day-name'),
    meals: document.getElementById('planner-meals-day-name'),
    hydration: document.getElementById('planner-hydration-day-name'),
    exercise: document.getElementById('planner-exercise-day-name')
  };

  Object.values(elements).forEach(el => {
    if (el) el.textContent = `${dayName}, ${formattedDate}`;
  });

  // Verificar se já existe dados para este dia
  const existingSchedule = appState.userData.dailySchedules?.[dateKey];
  const hasData = existingSchedule && existingSchedule.planData;

  // Carregar dados existentes se houver
  if (hasData) {
    appState.tempPlanData = { ...existingSchedule.planData };
    setTimeout(() => loadPlanDataToWizard(existingSchedule.planData), 100);
  } else {
    appState.tempPlanData = {};
    setTimeout(() => clearPlannerForms(), 100);
  }

  // Iniciar pela tela de sono
  showPlannerScreen('planner-sleep');
}

// Navegar entre telas do planejador
function showPlannerScreen(screenId) {
  // Esconder todas as telas
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => s.classList.remove('active'));

  // Mostrar tela solicitada
  const screen = document.getElementById(screenId + '-screen');
  if (screen) screen.classList.add('active');

  // Renderizar quick configs quando a tela é aberta
  if (typeof renderQuickConfigs === 'function') {
    setTimeout(() => {
      const categoryMap = {
        'planner-sleep': {
          category: 'sleep', container: 'planner-sleep-quick-configs', callback: function (config) {
            const sleepInput = document.getElementById('plannerSleepTime');
            const wakeInput = document.getElementById('plannerWakeTime');
            if (sleepInput) sleepInput.value = config.sleep || '';
            if (wakeInput) wakeInput.value = config.wake || '';
          }
        },
        'planner-cleaning': {
          category: 'cleaning', container: 'planner-cleaning-quick-configs', callback: function (config) {
            const startTime = document.getElementById('plannerCleaningStartTime');
            const endTime = document.getElementById('plannerCleaningEndTime');
            const notes = document.getElementById('plannerCleaningNotes');
            if (startTime) startTime.value = config.start || '';
            if (endTime) endTime.value = config.end || '';
            if (notes) notes.value = config.notes || '';
          }
        },
        'planner-meals': {
          category: 'meals', container: 'planner-meals-quick-configs', callback: function (config) {
            const mealsCountInput = document.getElementById('plannerMealsCount');
            if (mealsCountInput && config.mealsCount) {
              mealsCountInput.value = config.mealsCount;
            }
          }
        },
        'planner-hydration': {
          category: 'hydration', container: 'planner-hydration-quick-configs', callback: function (config) {
            const weightInput = document.getElementById('plannerUserWeight');
            const heightInput = document.getElementById('plannerUserHeight');
            if (weightInput && config.weight) weightInput.value = config.weight;
            if (heightInput && config.height) heightInput.value = config.height;
            if (config.weight && config.height && typeof updatePlannerWaterRecommendation === 'function') {
              updatePlannerWaterRecommendation();
            }
          }
        },
        'planner-exercise': {
          category: 'exercise', container: 'planner-exercise-quick-configs', callback: function (config) {
            const exerciseStart = document.getElementById('plannerExerciseStartTime');
            const exerciseEnd = document.getElementById('plannerExerciseEndTime');
            const exerciseType = document.getElementById('plannerExerciseType');
            if (exerciseStart) exerciseStart.value = config.start || '';
            if (exerciseEnd) exerciseEnd.value = config.end || '';
            if (exerciseType) exerciseType.value = config.type || '';
          }
        }
      };

      const categoryConfig = categoryMap[screenId];
      if (categoryConfig) {
        renderQuickConfigs(categoryConfig.category, categoryConfig.container, categoryConfig.callback);
      }
    }, 150);
  }
}

// Cancelar planejamento e voltar para cronogramas
function cancelPlanner() {
  // Não resetar o modo de planejamento, apenas voltar para tela de edição
  showScreen('planner-edit');

  // Atualizar status das categorias
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}

// Editar categoria específica do planejamento
function editPlannerCategory(category) {
  const screenMap = {
    'sleep': 'planner-sleep',
    'work': 'planner-work',
    'study': 'planner-study',
    'cleaning': 'planner-cleaning',
    'projects': 'planner-projects',
    'meals': 'planner-meals',
    'hydration': 'planner-hydration',
    'exercise': 'planner-exercise'
  };

  const screenId = screenMap[category];
  if (screenId) {
    showPlannerScreen(screenId);
  }
}

// Abrir tela de edição para um dia específico
function openEditPlanner(dateKey) {
  // Converter YYYY-MM-DD para Date local
  const date = parseDateKey(dateKey);
  const dayName = getDayName(date);
  const formattedDate = getFormattedDate(date);

  // Armazenar data sendo planejada no estado
  appState.planningDate = dateKey;
  appState.isPlanningMode = true;

  // Resetar contadores
  if (typeof resetPlannerJobCounter === 'function') resetPlannerJobCounter();
  if (typeof resetPlannerStudyCounter === 'function') resetPlannerStudyCounter();
  if (typeof resetPlannerProjectCounter === 'function') resetPlannerProjectCounter();

  // Atualizar displays em todas as telas
  const elements = {
    sleep: document.getElementById('planner-sleep-day-name'),
    work: document.getElementById('planner-work-day-name'),
    study: document.getElementById('planner-study-day-name'),
    cleaning: document.getElementById('planner-cleaning-day-name'),
    projects: document.getElementById('planner-projects-day-name'),
    meals: document.getElementById('planner-meals-day-name'),
    hydration: document.getElementById('planner-hydration-day-name'),
    exercise: document.getElementById('planner-exercise-day-name')
  };

  Object.values(elements).forEach(el => {
    if (el) el.textContent = `${dayName}, ${formattedDate}`;
  });

  // Carregar dados existentes
  const existingSchedule = appState.userData.dailySchedules?.[dateKey];
  if (existingSchedule && existingSchedule.planData) {
    appState.tempPlanData = { ...existingSchedule.planData };
    setTimeout(() => loadPlanDataToWizard(existingSchedule.planData), 100);
  } else {
    appState.tempPlanData = {};
    setTimeout(() => clearPlannerForms(), 100);
  }

  // Mostrar tela de edição
  showScreen('planner-edit');

  // Atualizar status das categorias
  setTimeout(() => {
    if (typeof updateEditPlannerStatus === 'function') {
      updateEditPlannerStatus();
    }
  }, 150);
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showPlannerScreen,
    editPlannerCategory,
    cancelPlanner,
    openEditPlanner,
    planSpecificDay
  };
}
