/**
 * Testes básicos para formulários de hidratação
 */

describe('Formulário de Hidratação', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="hydration-form">
        <input type="number" id="waterGoal" min="500" max="5000" step="100" />
        <input type="number" id="waterInterval" min="30" max="240" step="15" />
        <input type="time" id="hydrationStart" />
        <input type="time" id="hydrationEnd" />
      </div>
    `;
  });

  function collectHydrationData() {
    const waterGoal = document.getElementById('waterGoal').value;
    const waterInterval = document.getElementById('waterInterval').value;
    const start = document.getElementById('hydrationStart').value;
    const end = document.getElementById('hydrationEnd').value;

    if (!waterGoal || !waterInterval) {
      throw new Error('Por favor, preencha a meta de água e o intervalo!');
    }

    if (!start || !end) {
      throw new Error('Por favor, preencha os horários de hidratação!');
    }

    const goal = parseInt(waterGoal);
    const interval = parseInt(waterInterval);

    if (goal < 500 || goal > 5000) {
      throw new Error('Meta de água deve estar entre 500ml e 5000ml!');
    }

    if (interval < 30 || interval > 240) {
      throw new Error('Intervalo deve estar entre 30 e 240 minutos!');
    }

    return {
      waterGoal: goal,
      waterInterval: interval,
      hydrationStart: start,
      hydrationEnd: end
    };
  }

  test('Deve validar meta de água obrigatória', () => {
    const waterInterval = document.getElementById('waterInterval');
    const start = document.getElementById('hydrationStart');
    const end = document.getElementById('hydrationEnd');

    waterInterval.value = '60';
    start.value = '08:00';
    end.value = '22:00';

    expect(() => {
      collectHydrationData();
    }).toThrow('Por favor, preencha a meta de água e o intervalo!');
  });

  test('Deve validar intervalo obrigatório', () => {
    const waterGoal = document.getElementById('waterGoal');
    const start = document.getElementById('hydrationStart');
    const end = document.getElementById('hydrationEnd');

    waterGoal.value = '2000';
    start.value = '08:00';
    end.value = '22:00';

    expect(() => {
      collectHydrationData();
    }).toThrow('Por favor, preencha a meta de água e o intervalo!');
  });

  test('Deve validar horários obrigatórios', () => {
    const waterGoal = document.getElementById('waterGoal');
    const waterInterval = document.getElementById('waterInterval');

    waterGoal.value = '2000';
    waterInterval.value = '60';

    expect(() => {
      collectHydrationData();
    }).toThrow('Por favor, preencha os horários de hidratação!');
  });

  test('Deve validar faixa de meta de água', () => {
    const waterGoal = document.getElementById('waterGoal');
    const waterInterval = document.getElementById('waterInterval');
    const start = document.getElementById('hydrationStart');
    const end = document.getElementById('hydrationEnd');

    waterGoal.value = '10000'; // Muito alto
    waterInterval.value = '60';
    start.value = '08:00';
    end.value = '22:00';

    expect(() => {
      collectHydrationData();
    }).toThrow('Meta de água deve estar entre 500ml e 5000ml!');
  });

  test('Deve validar faixa de intervalo', () => {
    const waterGoal = document.getElementById('waterGoal');
    const waterInterval = document.getElementById('waterInterval');
    const start = document.getElementById('hydrationStart');
    const end = document.getElementById('hydrationEnd');

    waterGoal.value = '2000';
    waterInterval.value = '300'; // Muito alto
    start.value = '08:00';
    end.value = '22:00';

    expect(() => {
      collectHydrationData();
    }).toThrow('Intervalo deve estar entre 30 e 240 minutos!');
  });

  test('Deve coletar dados de hidratação corretamente', () => {
    const waterGoal = document.getElementById('waterGoal');
    const waterInterval = document.getElementById('waterInterval');
    const start = document.getElementById('hydrationStart');
    const end = document.getElementById('hydrationEnd');

    waterGoal.value = '2500';
    waterInterval.value = '90';
    start.value = '07:00';
    end.value = '23:00';

    const data = collectHydrationData();
    expect(data.waterGoal).toBe(2500);
    expect(data.waterInterval).toBe(90);
    expect(data.hydrationStart).toBe('07:00');
    expect(data.hydrationEnd).toBe('23:00');
  });
});
