/**
 * Testes para o sistema de Configurações Rápidas
 */

// Mock do appState
global.appState = {
  userData: {
    dailySchedules: {}
  }
};

// Mock de funções globais
global.getDayName = jest.fn((date) => 'Segunda-feira');
global.parseDateKey = jest.fn((key) => new Date(key));

const {
  getPreviousConfigs,
  applyQuickConfig,
  applyQuickConfigFromButton,
  renderQuickConfigs,
  toggleQuickConfigSection
} = require('../js/utils/quick-config.js');

describe('Quick Config - getPreviousConfigs', () => {
  beforeEach(() => {
    // Limpar dados
    global.appState.userData.dailySchedules = {};
  });

  test('deve retornar array vazio quando não há schedules', () => {
    const configs = getPreviousConfigs('jobs', 2);
    expect(configs).toEqual([]);
  });

  test('deve buscar configurações de jobs (array category)', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          jobs: [
            { name: 'Desenvolvimento', times: [{ start: '09:00', end: '17:00' }] }
          ]
        }
      },
      '2025-11-09': {
        dayName: 'Sábado',
        planData: {
          jobs: [
            { name: 'Reunião', times: [{ start: '10:00', end: '11:00' }] }
          ]
        }
      }
    };

    const configs = getPreviousConfigs('jobs', 2);
    expect(configs).toHaveLength(2);
    expect(configs[0].config.name).toBe('Desenvolvimento');
    expect(configs[1].config.name).toBe('Reunião');
  });

  test('deve buscar configurações de sono (object category)', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          sleep: '23:00',
          wake: '07:00'
        }
      }
    };

    const configs = getPreviousConfigs('sleep', 2);
    expect(configs).toHaveLength(1);
    expect(configs[0].config.sleep).toBe('23:00');
    expect(configs[0].config.wake).toBe('07:00');
  });

  test('deve buscar configurações de limpeza', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          cleaning: {
            start: '10:00',
            end: '12:00',
            notes: 'Cozinha e banheiro'
          }
        }
      }
    };

    const configs = getPreviousConfigs('cleaning', 2);
    expect(configs).toHaveLength(1);
    expect(configs[0].config.start).toBe('10:00');
    expect(configs[0].config.notes).toBe('Cozinha e banheiro');
  });

  test('deve buscar configurações de exercício', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          exercise: {
            type: 'Musculação',
            start: '06:00',
            end: '07:30'
          }
        }
      }
    };

    const configs = getPreviousConfigs('exercise', 2);
    expect(configs).toHaveLength(1);
    expect(configs[0].config.type).toBe('Musculação');
  });

  test('deve buscar configurações de refeições', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          mealsCount: 3
        }
      }
    };

    const configs = getPreviousConfigs('meals', 2);
    expect(configs).toHaveLength(1);
    expect(configs[0].config.mealsCount).toBe(3);
  });

  test('deve buscar configurações de hidratação', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          hydration: {
            weight: 70,
            height: 175,
            waterNeeds: 2450
          }
        }
      }
    };

    const configs = getPreviousConfigs('hydration', 2);
    expect(configs).toHaveLength(1);
    expect(configs[0].config.waterNeeds).toBe(2450);
  });

  test('deve evitar configurações duplicadas', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          sleep: '23:00',
          wake: '07:00'
        }
      },
      '2025-11-09': {
        dayName: 'Sábado',
        planData: {
          sleep: '23:00',
          wake: '07:00'
        }
      }
    };

    const configs = getPreviousConfigs('sleep', 2);
    expect(configs).toHaveLength(1); // Deve retornar apenas 1, não 2
  });

  test('deve respeitar o limite de resultados', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        planData: {
          jobs: [{ name: 'Job 1', times: [{ start: '09:00', end: '10:00' }] }]
        }
      },
      '2025-11-09': {
        planData: {
          jobs: [{ name: 'Job 2', times: [{ start: '10:00', end: '11:00' }] }]
        }
      },
      '2025-11-08': {
        planData: {
          jobs: [{ name: 'Job 3', times: [{ start: '11:00', end: '12:00' }] }]
        }
      }
    };

    const configs = getPreviousConfigs('jobs', 2);
    expect(configs).toHaveLength(2);
  });

  test('deve ordenar datas em ordem decrescente (mais recente primeiro)', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-08': {
        planData: {
          sleep: '22:00',
          wake: '06:00'
        }
      },
      '2025-11-10': {
        planData: {
          sleep: '23:00',
          wake: '07:00'
        }
      },
      '2025-11-09': {
        planData: {
          sleep: '22:30',
          wake: '06:30'
        }
      }
    };

    const configs = getPreviousConfigs('sleep', 2);
    expect(configs[0].date).toBe('2025-11-10'); // Mais recente
    expect(configs[1].date).toBe('2025-11-09');
  });
});

describe('Quick Config - applyQuickConfig', () => {
  test('deve chamar função de adicionar slot com configuração', () => {
    const mockAddSlot = jest.fn();
    const config = { name: 'Teste', times: [{ start: '09:00', end: '10:00' }] };

    applyQuickConfig('jobs', config, mockAddSlot);

    expect(mockAddSlot).toHaveBeenCalledWith(config);
  });

  test('não deve crashar se função não for válida', () => {
    const config = { name: 'Teste', times: [] };

    // Deve apenas logar erro, não crashar
    expect(() => {
      applyQuickConfig('jobs', config, null);
    }).not.toThrow();
  });
});

describe('Quick Config - applyQuickConfigFromButton', () => {
  beforeEach(() => {
    // Mock console.error
    global.console.error = jest.fn();
    global.alert = jest.fn();
  });

  test('deve fazer parse do JSON e chamar função', () => {
    const mockFunction = jest.fn();
    global.testFunction = mockFunction;

    const configStr = '{"name":"Teste","times":[{"start":"09:00","end":"10:00"}]}';

    applyQuickConfigFromButton('jobs', configStr, 'testFunction');

    expect(mockFunction).toHaveBeenCalled();
    expect(mockFunction.mock.calls[0][0].name).toBe('Teste');
  });

  test('deve decodificar HTML entities', () => {
    const mockFunction = jest.fn();
    global.testFunction = mockFunction;

    const configStr = '{&quot;name&quot;:&quot;Teste&quot;}';

    applyQuickConfigFromButton('jobs', configStr, 'testFunction');

    expect(mockFunction).toHaveBeenCalledWith({ name: 'Teste' });
  });

  test('deve mostrar erro se função não existir', () => {
    const configStr = '{"name":"Teste"}';

    applyQuickConfigFromButton('jobs', configStr, 'funcaoInexistente');

    expect(console.error).toHaveBeenCalledWith('Função não encontrada:', 'funcaoInexistente');
  });

  test('deve mostrar alerta se JSON for inválido', () => {
    applyQuickConfigFromButton('jobs', 'JSON INVÁLIDO', 'qualquerCoisa');

    expect(alert).toHaveBeenCalledWith('Erro ao aplicar configuração rápida');
  });
});

describe('Quick Config - renderQuickConfigs', () => {
  let container;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container');

    // Mock appState com dados
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          jobs: [
            { name: 'Desenvolvimento', times: [{ start: '09:00', end: '17:00' }] }
          ]
        }
      }
    };
  });

  test('deve renderizar mensagem quando não há configs', () => {
    global.appState.userData.dailySchedules = {};

    renderQuickConfigs('jobs', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('Nenhuma configuração anterior');
  });

  test('deve renderizar cards de configurações para jobs', () => {
    const mockAddSlot = jest.fn();
    mockAddSlot.name = 'addJobSlot'; // Simular função nomeada

    renderQuickConfigs('jobs', 'test-container', mockAddSlot);

    expect(container.innerHTML).toContain('Desenvolvimento');
    expect(container.innerHTML).toContain('09:00→17:00');
    expect(container.innerHTML).toContain('⚡ Usar');
  });

  test('deve renderizar cards de configurações para sono', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          sleep: '23:00',
          wake: '07:00'
        }
      }
    };

    renderQuickConfigs('sleep', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('😴 23:00');
    expect(container.innerHTML).toContain('⏰ 07:00');
  });

  test('deve renderizar cards de configurações para limpeza', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          cleaning: {
            start: '10:00',
            end: '12:00',
            notes: 'Cozinha'
          }
        }
      }
    };

    renderQuickConfigs('cleaning', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('🕐 10:00');
    expect(container.innerHTML).toContain('→ <strong>12:00');
  });

  test('deve renderizar cards de configurações para exercício', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          exercise: {
            type: 'Musculação',
            start: '06:00',
            end: '07:30'
          }
        }
      }
    };

    renderQuickConfigs('exercise', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('Musculação');
    expect(container.innerHTML).toContain('06:00 → 07:30');
  });

  test('deve renderizar cards de configurações para refeições', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          mealsCount: 3
        }
      }
    };

    renderQuickConfigs('meals', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('3 refeições');
  });

  test('deve renderizar cards de configurações para hidratação', () => {
    global.appState.userData.dailySchedules = {
      '2025-11-10': {
        dayName: 'Domingo',
        planData: {
          hydration: {
            waterNeeds: 2450
          }
        }
      }
    };

    renderQuickConfigs('hydration', 'test-container', jest.fn());

    expect(container.innerHTML).toContain('2450ml');
  });

  test('não deve crashar se container não existir', () => {
    expect(() => {
      renderQuickConfigs('jobs', 'container-inexistente', jest.fn());
    }).not.toThrow();
  });

  test('deve criar callback global com nome único', () => {
    const mockCallback = jest.fn();
    renderQuickConfigs('jobs', 'test-container', mockCallback);

    const callbackKey = '__quickConfigCallback_jobs_test-container';
    expect(global[callbackKey]).toBe(mockCallback);
  });
});

describe('Quick Config - toggleQuickConfigSection', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="test-section"></div>';
  });

  test('deve mostrar seção quando show=true', () => {
    toggleQuickConfigSection('test-section', true);

    const section = document.getElementById('test-section');
    expect(section.style.display).toBe('block');
  });

  test('deve ocultar seção quando show=false', () => {
    const section = document.getElementById('test-section');
    section.style.display = 'block';

    toggleQuickConfigSection('test-section', false);
    expect(section.style.display).toBe('none');
  });

  test('não deve crashar se container não existir', () => {
    expect(() => {
      toggleQuickConfigSection('container-inexistente', true);
    }).not.toThrow();
  });
});
