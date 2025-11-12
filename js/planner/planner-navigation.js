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

  // Atualizar displays em todas as telas
  const elements = {
    sleep: document.getElementById('planner-sleep-day-name'),
    work: document.getElementById('planner-work-day-name'),
    study: document.getElementById('planner-study-day-name'),
    cleaning: document.getElementById('planner-cleaning-day-name'),
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
}

// Cancelar planejamento e voltar para cronogramas
function cancelPlanner() {
  appState.isPlanningMode = false;
  appState.planningDate = null;

  goToSchedules();
}

// Editar categoria específica do planejamento
function editPlannerCategory(category) {
  const screenMap = {
    'sleep': 'planner-sleep',
    'work': 'planner-work',
    'study': 'planner-study',
    'cleaning': 'planner-cleaning',
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

  // Atualizar displays em todas as telas
  const elements = {
    sleep: document.getElementById('planner-sleep-day-name'),
    work: document.getElementById('planner-work-day-name'),
    study: document.getElementById('planner-study-day-name'),
    cleaning: document.getElementById('planner-cleaning-day-name'),
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
