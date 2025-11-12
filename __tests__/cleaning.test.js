/**
 * Testes básicos para formulários de limpeza
 */

describe('Formulário de Limpeza', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="cleaning-form">
        <input type="radio" name="hasCleaning" value="yes" />
        <input type="radio" name="hasCleaning" value="no" />
        <input type="time" id="cleaningStart" />
        <input type="time" id="cleaningEnd" />
        <textarea id="cleaningNotes"></textarea>
      </div>
    `;
  });

  function collectCleaningData() {
    const hasCleaning = document.querySelector('input[name="hasCleaning"]:checked');

    if (!hasCleaning) {
      throw new Error('Por favor, selecione se você faz limpeza!');
    }

    if (hasCleaning.value === 'no') {
      return null;
    }

    const start = document.getElementById('cleaningStart').value;
    const end = document.getElementById('cleaningEnd').value;
    const notes = document.getElementById('cleaningNotes').value;

    if (!start || !end) {
      throw new Error('Por favor, preencha os horários de limpeza!');
    }

    return {
      start,
      end,
      notes: notes || ''
    };
  }

  test('Deve validar seleção obrigatória de limpeza', () => {
    expect(() => {
      collectCleaningData();
    }).toThrow('Por favor, selecione se você faz limpeza!');
  });

  test('Deve permitir não fazer limpeza', () => {
    const noRadio = document.querySelector('input[name="hasCleaning"][value="no"]');
    noRadio.checked = true;

    const data = collectCleaningData();
    expect(data).toBeNull();
  });

  test('Deve validar horários quando selecionado sim', () => {
    const yesRadio = document.querySelector('input[name="hasCleaning"][value="yes"]');
    yesRadio.checked = true;

    expect(() => {
      collectCleaningData();
    }).toThrow('Por favor, preencha os horários de limpeza!');
  });

  test('Deve coletar dados de limpeza corretamente', () => {
    const yesRadio = document.querySelector('input[name="hasCleaning"][value="yes"]');
    const start = document.getElementById('cleaningStart');
    const end = document.getElementById('cleaningEnd');
    const notes = document.getElementById('cleaningNotes');

    yesRadio.checked = true;
    start.value = '10:00';
    end.value = '11:30';
    notes.value = 'Limpeza da casa toda';

    const data = collectCleaningData();
    expect(data.start).toBe('10:00');
    expect(data.end).toBe('11:30');
    expect(data.notes).toBe('Limpeza da casa toda');
  });

  test('Deve permitir limpeza sem notas', () => {
    const yesRadio = document.querySelector('input[name="hasCleaning"][value="yes"]');
    const start = document.getElementById('cleaningStart');
    const end = document.getElementById('cleaningEnd');

    yesRadio.checked = true;
    start.value = '14:00';
    end.value = '15:00';

    const data = collectCleaningData();
    expect(data.start).toBe('14:00');
    expect(data.end).toBe('15:00');
    expect(data.notes).toBe('');
  });
});
