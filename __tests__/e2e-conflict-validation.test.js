/**
 * Teste E2E: Validação de conflitos ao finalizar planejamento
 */

const fs = require('fs');
const path = require('path');

describe('🚨 E2E: Bloquear finalização com conflitos', () => {
  let finalizePlannerSave, validateScheduleConflicts, generateScheduleFromData;
  let appState, alert;

  beforeEach(() => {
    // Mock alert
    alert = jest.fn();
    global.alert = alert;

    // Mock appState
    appState = {
      planningDate: '2025-11-12',
      tempPlanData: null,
      userData: {
        dailySchedules: {}
      },
      get todayDate() {
        return new Date('2025-11-12T10:00:00');
      }
    };
    global.appState = appState;

    // Mock funções globais
    global.parseDateKey = (dateKey) => {
      if (typeof dateKey !== 'string') return null;
      const parts = dateKey.split('-');
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    global.getDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    global.getDayName = (date) => {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return days[date.getDay()];
    };

    global.getFormattedDate = (date) => {
      const day = date.getDate();
      const month = date.toLocaleString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };

    global.saveToStorage = jest.fn();
    global.goToSchedules = jest.fn();

    // Carregar time-utils
    global.timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Carregar módulos necessários
    const conflictValidatorPath = path.join(__dirname, '../js/utils/conflict-validator.js');
    delete require.cache[require.resolve(conflictValidatorPath)];
    const conflictModule = require(conflictValidatorPath);
    validateScheduleConflicts = conflictModule.validateScheduleConflicts;
    global.validateScheduleConflicts = validateScheduleConflicts;
    global.formatConflictsMessage = conflictModule.formatConflictsMessage;

    // Carregar schedule-generator (mock simplificado)
    global.generateScheduleFromData = (planData) => {
      const schedule = [];

      // Adicionar sono
      if (planData.sleep && planData.wake) {
        schedule.push({
          id: 1,
          type: 'sleep',
          name: 'Dormir',
          start: planData.sleep,
          end: planData.wake
        });
      }

      // Adicionar trabalhos
      if (planData.jobs && planData.jobs.length > 0) {
        planData.jobs.forEach((job, index) => {
          job.times.forEach(time => {
            schedule.push({
              id: schedule.length + 1,
              type: 'work',
              name: job.name,
              start: time.start,
              end: time.end
            });
          });
        });
      }

      return schedule;
    };

    // Carregar planner-save
    const plannerSavePath = path.join(__dirname, '../js/planner/planner-save.js');
    delete require.cache[require.resolve(plannerSavePath)];
    const plannerSaveModule = require(plannerSavePath);
    finalizePlannerSave = plannerSaveModule.finalizePlannerSave;
  });

  test('🔴 CASO REAL: Bloquear sono que sobrepõe trabalho', () => {
    console.log('\n=== SIMULANDO CASO REAL DO USUÁRIO ===\n');

    // Dados do planejamento com CONFLITO
    appState.tempPlanData = {
      sleep: '05:30',
      wake: '08:00',
      jobs: [
        {
          name: 'PADARIA',
          times: [
            {
              start: '06:26', // Começa DURANTE o sono!
              end: '08:26'
            }
          ]
        }
      ],
      studies: [],
      cleaning: null,
      meals: ['07:00', '12:00', '19:00'],
      hydration: true,
      exercise: null
    };

    console.log('📋 Dados do planejamento:');
    console.log(`   Sono: ${appState.tempPlanData.sleep} - ${appState.tempPlanData.wake}`);
    console.log(`   Trabalho: PADARIA ${appState.tempPlanData.jobs[0].times[0].start} - ${appState.tempPlanData.jobs[0].times[0].end}`);
    console.log('');

    // Tentar finalizar
    finalizePlannerSave();

    console.log('📊 Resultado:');
    console.log(`   alert() foi chamado? ${alert.mock.calls.length > 0 ? 'SIM ✅' : 'NÃO ❌'}`);

    if (alert.mock.calls.length > 0) {
      console.log(`   Mensagem: "${alert.mock.calls[0][0]}"`);
    }

    console.log(`   Cronograma foi salvo? ${appState.userData.dailySchedules['2025-11-12'] ? 'SIM ❌' : 'NÃO ✅'}`);
    console.log('');

    // Verificações
    expect(alert).toHaveBeenCalled();
    expect(alert.mock.calls[0][0]).toMatch(/conflito|sobrepõe|Dormir|PADARIA/i);
    expect(appState.userData.dailySchedules['2025-11-12']).toBeUndefined();
    expect(global.goToSchedules).not.toHaveBeenCalled();
  });

  test('✅ Permitir finalização SEM conflitos', () => {
    console.log('\n=== TESTE: Cronograma sem conflitos ===\n');

    // Dados do planejamento SEM conflito
    appState.tempPlanData = {
      sleep: '22:00',
      wake: '06:00',
      jobs: [
        {
          name: 'Trabalho',
          times: [
            {
              start: '08:00', // Começa DEPOIS de acordar
              end: '17:00'
            }
          ]
        }
      ],
      studies: [],
      cleaning: null,
      meals: ['07:00', '12:00', '19:00'],
      hydration: true,
      exercise: null
    };

    console.log('📋 Dados do planejamento:');
    console.log(`   Sono: ${appState.tempPlanData.sleep} - ${appState.tempPlanData.wake}`);
    console.log(`   Trabalho: ${appState.tempPlanData.jobs[0].times[0].start} - ${appState.tempPlanData.jobs[0].times[0].end}`);
    console.log('');

    // Finalizar
    finalizePlannerSave();

    console.log('📊 Resultado:');
    console.log(`   alert() com erro? ${alert.mock.calls.some(call => call[0].includes('conflito')) ? 'SIM ❌' : 'NÃO ✅'}`);
    console.log(`   Cronograma foi salvo? ${appState.userData.dailySchedules['2025-11-12'] ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`   goToSchedules() chamado? ${global.goToSchedules.mock.calls.length > 0 ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log('');

    // Verificações
    expect(appState.userData.dailySchedules['2025-11-12']).toBeDefined();
    expect(appState.userData.dailySchedules['2025-11-12'].activities.length).toBeGreaterThan(0);
    expect(global.goToSchedules).toHaveBeenCalled();
  });

  test('🔴 Bloquear múltiplos conflitos', () => {
    console.log('\n=== TESTE: Múltiplos conflitos ===\n');

    appState.tempPlanData = {
      sleep: '22:00',
      wake: '06:00',
      jobs: [
        {
          name: 'Trabalho 1',
          times: [{ start: '09:00', end: '12:00' }]
        },
        {
          name: 'Trabalho 2',
          times: [{ start: '10:00', end: '13:00' }] // Sobrepõe Trabalho 1
        }
      ],
      studies: [],
      cleaning: null,
      meals: [],
      hydration: false,
      exercise: null
    };

    console.log('📋 Dados do planejamento:');
    console.log('   Trabalho 1: 09:00 - 12:00');
    console.log('   Trabalho 2: 10:00 - 13:00 (CONFLITO!)');
    console.log('');

    finalizePlannerSave();

    console.log('📊 Resultado:');
    console.log(`   alert() foi chamado? ${alert.mock.calls.length > 0 ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`   Cronograma foi salvo? ${appState.userData.dailySchedules['2025-11-12'] ? 'SIM ❌' : 'NÃO ✅'}`);
    console.log('');

    expect(alert).toHaveBeenCalled();
    expect(appState.userData.dailySchedules['2025-11-12']).toBeUndefined();
  });
});
