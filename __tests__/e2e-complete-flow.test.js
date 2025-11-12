/**
 * Teste end-to-end completo do fluxo de planejamento independente
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('E2E: Fluxo Completo de Planejamento Independente', () => {
  let sandbox;

  const loadScript = (relativePath) => {
    const filePath = path.join(__dirname, '..', relativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    vm.runInContext(content, sandbox);
  };

  beforeEach(() => {
    // Setup DOM completo
    document.body.innerHTML = `
      <nav id="planner-navbar" style="display: none;">
        <button class="planner-nav-item" data-screen="planner-sleep"></button>
        <button class="planner-nav-item" data-screen="planner-work"></button>
      </nav>
      <section id="planner-edit-screen" class="screen"></section>
      <section id="planner-sleep-screen" class="screen planner-screen"></section>
      <section id="planner-work-screen" class="screen planner-screen"></section>
      <section id="planner-study-screen" class="screen planner-screen"></section>
      <section id="planner-cleaning-screen" class="screen planner-screen"></section>
      <section id="planner-meals-screen" class="screen planner-screen"></section>
      <section id="planner-hydration-screen" class="screen planner-screen"></section>
      <section id="planner-exercise-screen" class="screen planner-screen"></section>
      
      <span id="planner-sleep-day-name"></span>
      <span id="planner-work-day-name"></span>
      <span id="planner-study-day-name"></span>
      <span id="planner-cleaning-day-name"></span>
      <span id="planner-meals-day-name"></span>
      <span id="planner-hydration-day-name"></span>
      <span id="planner-exercise-day-name"></span>
      
      <input id="plannerSleepTime" type="time" />
      <input id="plannerWakeTime" type="time" />
      
      <input type="radio" name="plannerHasWork" value="yes" />
      <input type="radio" name="plannerHasWork" value="no" />
      <div id="planner-work-details" style="display: none;"></div>
      <div id="planner-jobs-container"></div>
      
      <input type="radio" name="plannerHasStudy" value="yes" />
      <input type="radio" name="plannerHasStudy" value="no" />
      <div id="planner-study-details" style="display: none;"></div>
      <div id="planner-studies-container"></div>
      
      <input type="radio" name="plannerHasCleaning" value="yes" />
      <input type="radio" name="plannerHasCleaning" value="no" />
      <div id="planner-cleaning-details" style="display: none;"></div>
      <input id="plannerCleaningStartTime" type="time" />
      <input id="plannerCleaningEndTime" type="time" />
      <input id="plannerCleaningNotes" type="text" />
      
      <input type="radio" name="plannerHasMeals" value="yes" />
      <input type="radio" name="plannerHasMeals" value="no" />
      <div id="planner-meals-details" style="display: none;"></div>
      <input id="plannerMealsCount" type="number" value="3" />
      
      <input id="plannerUserWeight" type="number" />
      <input id="plannerUserHeight" type="number" />
      <div id="planner-water-recommendation"></div>
      
      <input type="radio" name="plannerHasExercise" value="yes" />
      <input type="radio" name="plannerHasExercise" value="no" />
      <div id="planner-exercise-details" style="display: none;"></div>
      <input id="plannerExerciseStartTime" type="time" />
      <input id="plannerExerciseEndTime" type="time" />
      <input id="plannerExerciseType" type="text" />
    `;

    // Setup sandbox
    sandbox = {
      appState: {
        planningDate: '2025-11-15',
        tempPlanData: {},
        isPlanningMode: true,
        userData: {
          dailySchedules: {},
          userProfile: {
            waterNeeds: 2500
          }
        }
      },
      plannerJobCounter: 0,
      plannerStudyCounter: 0,
      parseDateKey: jest.fn((key) => {
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d);
      }),
      getDayName: jest.fn((date) => {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[date.getDay()];
      }),
      getFormattedDate: jest.fn((date) => {
        return `${date.getDate()} de novembro de 2025`;
      }),
      getDateKey: jest.fn(() => '2025-11-12'),
      validateScheduleConflicts: jest.fn(() => []),
      formatConflictsMessage: jest.fn(() => ''),
      saveToStorage: jest.fn(),
      goToSchedules: jest.fn(),
      showScreen: jest.fn(),
      alert: jest.fn(),
      console,
      document,
      window: {},
      setTimeout: (fn) => { fn(); return 1; }
    };

    vm.createContext(sandbox);

    // Carregar todos os scripts necessários
    loadScript('js/utils/time-utils.js');
    loadScript('js/utils/forms.js');
    loadScript('js/utils/category-manager.js');
    loadScript('js/utils/schedule-builder.js');
    loadScript('js/schedule/schedule-generator.js');
    loadScript('js/planner/planner-work-handlers.js');
    loadScript('js/planner/planner-study-handlers.js');
    loadScript('js/planner/planner-navigation.js');
    loadScript('js/planner/planner-wizard.js');
    loadScript('js/planner/planner-form-loader.js');
    loadScript('js/categories/meals.js');
    loadScript('js/categories/hydration.js');
    loadScript('js/categories/exercise.js');
    loadScript('js/planner/planner-save.js');
  });

  test('🎯 E2E: Planejamento completo com todas categorias', () => {
    console.log('\n🚀 === INICIANDO TESTE E2E COMPLETO ===\n');

    // 1. Abrir editor para o dia 15/11
    console.log('📅 1. Abrindo editor para 15/11/2025...');
    sandbox.openEditPlanner('2025-11-15');
    expect(sandbox.appState.planningDate).toBe('2025-11-15');
    expect(sandbox.appState.tempPlanData).toEqual({});
    console.log('✓ Editor aberto, tempPlanData inicializado\n');

    // 2. Salvar SONO
    console.log('😴 2. Configurando horários de sono...');
    document.getElementById('plannerSleepTime').value = '23:00';
    document.getElementById('plannerWakeTime').value = '07:00';
    sandbox.savePlannerSleep();
    expect(sandbox.appState.tempPlanData.sleep).toBe('23:00');
    expect(sandbox.appState.tempPlanData.wake).toBe('07:00');
    console.log('✓ Sono salvo: 23:00 - 07:00\n');

    // 3. Salvar TRABALHO
    console.log('💼 3. Configurando trabalho...');
    document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;
    sandbox.togglePlannerWorkForm(true); // Já adiciona 1 slot automaticamente

    const jobNameInput = document.getElementById('planner-job-name-1');
    if (jobNameInput) jobNameInput.value = 'Desenvolvimento';

    const jobStartInput = document.getElementById('planner-job-start-1-0');
    const jobEndInput = document.getElementById('planner-job-end-1-0');
    if (jobStartInput) jobStartInput.value = '09:00';
    if (jobEndInput) jobEndInput.value = '17:00';

    sandbox.savePlannerWork();
    expect(sandbox.appState.tempPlanData.jobs).toBeDefined();
    expect(sandbox.appState.tempPlanData.jobs.length).toBeGreaterThan(0);
    console.log('✓ Trabalho salvo: Desenvolvimento 09:00-17:00\n');

    // 4. Salvar ESTUDO  
    console.log('📚 4. Configurando estudo...');
    document.querySelector('input[name="plannerHasStudy"][value="yes"]').checked = true;
    sandbox.togglePlannerStudyForm(true); // Já adiciona 1 slot automaticamente

    const studyNameInput = document.getElementById('planner-study-name-1');
    if (studyNameInput) studyNameInput.value = 'JavaScript';

    const studyStartInput = document.getElementById('planner-study-start-1-0');
    const studyEndInput = document.getElementById('planner-study-end-1-0');
    if (studyStartInput) studyStartInput.value = '19:00';
    if (studyEndInput) studyEndInput.value = '21:00';

    sandbox.savePlannerStudy();
    expect(sandbox.appState.tempPlanData.studies).toBeDefined();
    expect(sandbox.appState.tempPlanData.studies.length).toBeGreaterThan(0);
    console.log('✓ Estudo salvo: JavaScript 19:00-21:00\n');

    // 5. Salvar LIMPEZA
    console.log('🧹 5. Configurando limpeza...');
    document.querySelector('input[name="plannerHasCleaning"][value="yes"]').checked = true;
    document.getElementById('plannerCleaningStartTime').value = '08:00';
    document.getElementById('plannerCleaningEndTime').value = '08:30';
    document.getElementById('plannerCleaningNotes').value = 'Quarto';
    sandbox.savePlannerCleaning();
    expect(sandbox.appState.tempPlanData.cleaning).toBeDefined();
    expect(sandbox.appState.tempPlanData.cleaning.start).toBe('08:00');
    console.log('✓ Limpeza salva: 08:00-08:30 (Quarto)\n');

    // 6. Salvar REFEIÇÕES
    console.log('🍽️ 6. Configurando refeições...');
    document.querySelector('input[name="plannerHasMeals"][value="yes"]').checked = true;
    document.getElementById('plannerMealsCount').value = '3';
    sandbox.savePlannerMeals();
    expect(sandbox.appState.tempPlanData.mealsCount).toBe(3);
    console.log('✓ Refeições salvas: 3 refeições\n');

    // 7. Salvar HIDRATAÇÃO
    console.log('💧 7. Configurando hidratação...');
    document.getElementById('plannerUserWeight').value = '70';
    document.getElementById('plannerUserHeight').value = '175';
    sandbox.savePlannerHydration();
    expect(sandbox.appState.userData.userProfile.waterNeeds).toBeDefined();
    console.log('✓ Hidratação salva\n');

    // 8. Salvar EXERCÍCIO
    console.log('💪 8. Configurando exercício...');
    document.querySelector('input[name="plannerHasExercise"][value="yes"]').checked = true;
    document.getElementById('plannerExerciseStartTime').value = '21:30';
    document.getElementById('plannerExerciseEndTime').value = '22:30';
    document.getElementById('plannerExerciseType').value = 'Corrida';
    sandbox.savePlannerExercise();
    expect(sandbox.appState.tempPlanData.exercise).toBeDefined();
    expect(sandbox.appState.tempPlanData.exercise.type).toBe('Corrida');
    console.log('✓ Exercício salvo: Corrida 21:30-22:30\n');

    // 9. FINALIZAR e verificar cronograma gerado
    console.log('✅ 9. Finalizando planejamento...');
    sandbox.finalizePlannerSave();

    const savedSchedule = sandbox.appState.userData.dailySchedules['2025-11-15'];

    expect(savedSchedule).toBeDefined();
    expect(savedSchedule.activities).toBeDefined();
    expect(Array.isArray(savedSchedule.activities)).toBe(true);
    expect(savedSchedule.activities.length).toBeGreaterThan(0);

    console.log(`✓ Cronograma gerado com ${savedSchedule.activities.length} atividades\n`);

    // Verificar tipos de atividades
    const activityTypes = savedSchedule.activities.map(a => a.type);
    console.log('📋 Atividades geradas:', activityTypes);

    expect(activityTypes).toContain('sleep');
    expect(activityTypes).toContain('work');
    expect(activityTypes).toContain('study');
    expect(activityTypes).toContain('cleaning');
    expect(activityTypes).toContain('meal');
    expect(activityTypes).toContain('exercise');
    expect(activityTypes).toContain('hydration');

    // Verificar planData preservado
    expect(savedSchedule.planData).toBeDefined();
    expect(savedSchedule.planData.sleep).toBe('23:00');
    expect(savedSchedule.planData.wake).toBe('07:00');

    // Verificar limpeza de estado
    expect(sandbox.appState.tempPlanData).toBeNull();
    expect(sandbox.appState.isPlanningMode).toBe(false);
    expect(sandbox.goToSchedules).toHaveBeenCalled();

    console.log('\n🎉 === TESTE E2E COMPLETO COM SUCESSO ===\n');
  });
});
