/**
 * Testes básicos para formulários de estudo
 */

describe('Formulário de Estudo', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="studies-container"></div>
      <div id="planner-studies-container"></div>
    `;
    global.studySlotCounter = 0;
  });

  // Simular função createCategoryCardHTML para estudo
  global.createStudyCard = function (type, id, data = null) {
    const itemName = data?.name || '';
    const times = data?.times || [{ start: '', end: '' }];

    return `
      <div class="item-header">
        <input type="text" class="${type}-name" value="${itemName}" placeholder="Nome do curso" required />
      </div>
      <div class="times-container" id="${type}-times-${id}">
        ${times.map((time, index) => `
          <div class="time-input-group">
            <input type="time" class="${type}-time-start" value="${time.start}" required />
            <input type="time" class="${type}-time-end" value="${time.end}" required />
          </div>
        `).join('')}
      </div>
    `;
  };

  global.addStudySlot = function (studyData = null) {
    global.studySlotCounter++;
    const container = document.getElementById('studies-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `study-slot-${global.studySlotCounter}`;
    slotDiv.innerHTML = global.createStudyCard('study', global.studySlotCounter, studyData);
    container.appendChild(slotDiv);
  };

  global.collectStudiesData = function (containerName, itemPrefix) {
    const studies = [];
    const studySlots = document.querySelectorAll(`#${containerName}-container .item-card`);

    for (let slot of studySlots) {
      const slotId = slot.id.split('-').pop();
      let nameInput = document.getElementById(`${itemPrefix}-name-${slotId}`);

      if (!nameInput) {
        nameInput = slot.querySelector(`.${itemPrefix.replace('planner-', '')}-name`);
      }

      const name = nameInput?.value?.trim();

      if (!name) {
        throw new Error('Por favor, preencha o nome do curso!');
      }

      const times = [];
      const timesContainer = document.getElementById(`${itemPrefix}-times-${slotId}`);
      const hasTimeSlots = timesContainer && timesContainer.querySelectorAll('.time-slot').length > 0;

      if (hasTimeSlots) {
        const timeSlots = timesContainer.querySelectorAll('.time-slot');
        for (let timeSlot of timeSlots) {
          const timeIndex = timeSlot.id.split('-').pop();
          const startInput = document.getElementById(`${itemPrefix}-start-${slotId}-${timeIndex}`);
          const endInput = document.getElementById(`${itemPrefix}-end-${slotId}-${timeIndex}`);
          const start = startInput?.value;
          const end = endInput?.value;
          if (!start || !end) throw new Error('Por favor, preencha todos os horários!');
          times.push({ start, end });
        }
      } else {
        const timeGroups = slot.querySelectorAll('.time-input-group');
        for (let timeGroup of timeGroups) {
          const startInput = timeGroup.querySelector(`.${itemPrefix.replace('planner-', '')}-time-start`);
          const endInput = timeGroup.querySelector(`.${itemPrefix.replace('planner-', '')}-time-end`);
          const start = startInput?.value;
          const end = endInput?.value;
          if (!start || !end) throw new Error('Por favor, preencha todos os horários!');
          times.push({ start, end });
        }
      }

      if (times.length === 0) throw new Error(`Adicione pelo menos um horário para ${name}!`);
      studies.push({ name, times });
    }

    return studies;
  };

  test('Deve adicionar um slot de estudo vazio', () => {
    addStudySlot();
    const container = document.getElementById('studies-container');
    expect(container.children.length).toBe(1);
  });

  test('Deve validar nome do curso obrigatório', () => {
    addStudySlot();
    const startInput = document.querySelector('.study-time-start');
    const endInput = document.querySelector('.study-time-end');
    startInput.value = '08:00';
    endInput.value = '10:00';

    expect(() => {
      collectStudiesData('studies', 'study');
    }).toThrow('Por favor, preencha o nome do curso!');
  });

  test('Deve validar horários obrigatórios', () => {
    addStudySlot();
    const nameInput = document.querySelector('.study-name');
    nameInput.value = 'Matemática';

    expect(() => {
      collectStudiesData('studies', 'study');
    }).toThrow('Por favor, preencha todos os horários!');
  });

  test('Deve coletar dados de estudo corretamente', () => {
    addStudySlot();
    const nameInput = document.querySelector('.study-name');
    const startInput = document.querySelector('.study-time-start');
    const endInput = document.querySelector('.study-time-end');

    nameInput.value = 'Programação';
    startInput.value = '19:00';
    endInput.value = '22:00';

    const studies = collectStudiesData('studies', 'study');
    expect(studies).toHaveLength(1);
    expect(studies[0].name).toBe('Programação');
    expect(studies[0].times[0].start).toBe('19:00');
    expect(studies[0].times[0].end).toBe('22:00');
  });
});
