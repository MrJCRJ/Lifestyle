/**
 * Testes para garantir que openEditPlanner chama showScreen corretamente
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Planner Wizard - openEditPlanner', () => {
  let sandbox;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="planner-navbar" style="display: none;"></div>
      <span id="planner-sleep-day-name"></span>
      <span id="planner-work-day-name"></span>
      <span id="planner-study-day-name"></span>
      <span id="planner-cleaning-day-name"></span>
      <span id="planner-meals-day-name"></span>
      <span id="planner-hydration-day-name"></span>
      <span id="planner-exercise-day-name"></span>
      <section id="planner-edit-screen" class="screen"></section>
    `;

    sandbox = {
      appState: {
        tempPlanData: null,
        planningDate: null,
        isPlanningMode: false,
        userData: {
          dailySchedules: {}
        }
      },
      plannerJobCounter: 0,
      plannerStudyCounter: 0,
      parseDateKey: jest.fn(() => new Date('2025-11-12T00:00:00')),
      getDayName: jest.fn(() => 'Quarta'),
      getFormattedDate: jest.fn(() => '12 de novembro de 2025'),
      loadPlanDataToWizard: jest.fn(),
      clearPlannerForms: jest.fn(),
      saveToStorage: jest.fn(),
      showScreen: jest.fn(),
      resetPlannerJobCounter: jest.fn(),
      resetPlannerStudyCounter: jest.fn(),
      setTimeout: (fn) => {
        fn();
        return 1;
      },
      alert: jest.fn(),
      document,
      window: {},
      console
    };

    // Carregar planner-navigation.js que contém openEditPlanner
    const navigationPath = path.join(__dirname, '..', 'js/planner/planner-navigation.js');
    const navigationContent = fs.readFileSync(navigationPath, 'utf-8');
    vm.createContext(sandbox);
    vm.runInContext(navigationContent, sandbox);
  });

  test('openEditPlanner usa showScreen com ID base', () => {
    sandbox.openEditPlanner('2025-11-12');

    expect(sandbox.showScreen).toHaveBeenCalledWith('planner-edit');
  });

  test('openEditPlanner prepara estado e navbar', () => {
    sandbox.openEditPlanner('2025-11-12');

    expect(sandbox.appState.planningDate).toBe('2025-11-12');
    expect(sandbox.appState.isPlanningMode).toBe(true);
    expect(sandbox.document.getElementById('planner-navbar').style.display).toBe('none');
  });
});
