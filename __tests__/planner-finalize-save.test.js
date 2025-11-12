/**
 * Testes para garantir que finalizePlannerSave gera cronograma corretamente
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Planner Save - finalizePlannerSave', () => {
  const loadScript = (sandbox, relativePath) => {
    const filePath = path.join(__dirname, '..', relativePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    vm.runInContext(content, sandbox);
  };

  let sandbox;

  const setupSandbox = (options = {}) => {
    document.body.innerHTML = `
      <nav id="planner-navbar" style="display: block;"></nav>
    `;

    sandbox = {
      appState: {
        planningDate: '2025-11-12',
        tempPlanData: null,
        isPlanningMode: true,
        userData: {
          dailySchedules: {},
          userProfile: {}
        }
      },
      parseDateKey: jest.fn(dateKey => new Date(`${dateKey}T00:00:00`)),
      getDayName: jest.fn(() => 'Quarta'),
      getFormattedDate: jest.fn(() => '12 de novembro de 2025'),
      getDateKey: jest.fn(() => '2025-11-10'),
      validateScheduleConflicts: jest.fn(() => []),
      formatConflictsMessage: jest.fn(() => 'Conflito!'),
      saveToStorage: jest.fn(),
      goToSchedules: jest.fn(),
      alert: jest.fn(),
      console,
      document,
      window: {},
      setTimeout: (fn) => {
        fn();
        return 1;
      }
    };

    // Carregar dependências necessários para gerar cronograma real
    if (options.withGenerator) {
      vm.createContext(sandbox);
      loadScript(sandbox, 'js/utils/time-utils.js');
      loadScript(sandbox, 'js/utils/schedule-builder.js');
      loadScript(sandbox, 'js/schedule/schedule-generator.js');
    } else {
      vm.createContext(sandbox);
      sandbox.generateScheduleFromData = jest.fn(() => []);
    }

    loadScript(sandbox, 'js/planner/planner-save.js');
  };

  test('gera cronograma e salva atividades quando dados são válidos', () => {
    setupSandbox({ withGenerator: true });

    sandbox.appState.userData.userProfile.waterNeeds = 2500;
    sandbox.appState.tempPlanData = {
      sleep: '22:00',
      wake: '06:00',
      jobs: [
        {
          name: 'Trabalho',
          times: [{ start: '09:00', end: '17:00' }]
        }
      ],
      studies: [
        {
          name: 'Estudos',
          times: [{ start: '19:00', end: '20:30' }]
        }
      ],
      cleaning: {
        start: '18:00',
        end: '18:30',
        notes: 'Quarto'
      },
      mealsCount: 3,
      exercise: {
        start: '20:45',
        end: '21:30',
        type: 'Alongamento'
      }
    };

    sandbox.finalizePlannerSave();

    const savedSchedule = sandbox.appState.userData.dailySchedules['2025-11-12'];
    expect(savedSchedule).toBeDefined();
    expect(savedSchedule.activities.length).toBeGreaterThan(0);
    expect(savedSchedule.activities.some(act => act.type === 'sleep')).toBe(true);
    expect(savedSchedule.activities.some(act => act.type === 'work')).toBe(true);
    expect(sandbox.goToSchedules).toHaveBeenCalledTimes(1);
    expect(sandbox.alert).toHaveBeenCalledWith(expect.stringContaining('Planejamento para Quarta salvo!'));
  });

  test('impede finalização sem horários de sono', () => {
    setupSandbox({ withGenerator: true });

    sandbox.appState.tempPlanData = {
      wake: '06:00',
      jobs: []
    };

    sandbox.finalizePlannerSave();

    expect(sandbox.alert).toHaveBeenCalledWith('Por favor, salve os horários de sono e acordar antes de finalizar o planejamento.');
    expect(Object.keys(sandbox.appState.userData.dailySchedules)).toHaveLength(0);
    expect(sandbox.goToSchedules).not.toHaveBeenCalled();
  });

  test('impede finalização quando nenhuma atividade é gerada', () => {
    setupSandbox({ withGenerator: false });

    sandbox.appState.tempPlanData = {
      sleep: '22:00',
      wake: '06:00'
    };

    sandbox.finalizePlannerSave();

    expect(sandbox.alert).toHaveBeenCalledWith('Nenhuma atividade foi gerada. Verifique se todas as categorias foram salvas corretamente e tente novamente.');
    expect(Object.keys(sandbox.appState.userData.dailySchedules)).toHaveLength(0);
    expect(sandbox.goToSchedules).not.toHaveBeenCalled();
  });
});
