/**
 * Testes básicos para formulários de exercícios
 */

describe('Formulário de Exercícios', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="exercise-form">
        <select id="exerciseType">
          <option value="">Selecione</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Musculação</option>
          <option value="flexibility">Alongamento</option>
          <option value="sports">Esportes</option>
        </select>
        <input type="time" id="exerciseStart" />
        <input type="time" id="exerciseEnd" />
        <textarea id="exerciseNotes"></textarea>
      </div>
    `;
  });

  function collectExerciseData() {
    const type = document.getElementById('exerciseType').value;
    const start = document.getElementById('exerciseStart').value;
    const end = document.getElementById('exerciseEnd').value;
    const notes = document.getElementById('exerciseNotes').value;

    if (!type) {
      throw new Error('Por favor, selecione o tipo de exercício!');
    }

    if (!start || !end) {
      throw new Error('Por favor, preencha os horários do exercício!');
    }

    return {
      type,
      start,
      end,
      notes: notes || ''
    };
  }

  test('Deve validar tipo de exercício obrigatório', () => {
    const start = document.getElementById('exerciseStart');
    const end = document.getElementById('exerciseEnd');

    start.value = '06:00';
    end.value = '07:00';

    expect(() => {
      collectExerciseData();
    }).toThrow('Por favor, selecione o tipo de exercício!');
  });

  test('Deve validar horários obrigatórios', () => {
    const type = document.getElementById('exerciseType');
    type.value = 'cardio';

    expect(() => {
      collectExerciseData();
    }).toThrow('Por favor, preencha os horários do exercício!');
  });

  test('Deve coletar dados de exercício corretamente', () => {
    const type = document.getElementById('exerciseType');
    const start = document.getElementById('exerciseStart');
    const end = document.getElementById('exerciseEnd');
    const notes = document.getElementById('exerciseNotes');

    type.value = 'cardio';
    start.value = '06:00';
    end.value = '07:00';
    notes.value = 'Corrida no parque';

    const data = collectExerciseData();
    expect(data.type).toBe('cardio');
    expect(data.start).toBe('06:00');
    expect(data.end).toBe('07:00');
    expect(data.notes).toBe('Corrida no parque');
  });

  test('Deve permitir exercício sem notas', () => {
    const type = document.getElementById('exerciseType');
    const start = document.getElementById('exerciseStart');
    const end = document.getElementById('exerciseEnd');

    type.value = 'strength';
    start.value = '18:00';
    end.value = '19:30';

    const data = collectExerciseData();
    expect(data.type).toBe('strength');
    expect(data.notes).toBe('');
  });
});
