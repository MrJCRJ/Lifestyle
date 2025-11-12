/**
 * Testes para identificar bugs no fluxo de trabalho (setup vs planejador)
 * Verifica a inconsistência entre createCategoryCardHTML e collectCategoryData
 */

describe('Bug: Inconsistência entre Setup e Planejador de Trabalho', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="jobs-container"></div>
      <div id="planner-jobs-container"></div>
    `;
    global.jobSlotCounter = 0;
    global.plannerJobCounter = 0;
  });

  // Simulando a função createCategoryCardHTML (usa CLASSES)
  global.createCategoryCardHTML = function (type, id, data = null, isFirst = false) {
    const itemName = data?.name || '';
    const times = data?.times || [{ start: '', end: '' }];

    let timesHTML = times.map((time, index) => `
      <div class="time-input-group">
        <input type="time" class="${type}-time-start" value="${time.start}" required />
        <span>até</span>
        <input type="time" class="${type}-time-end" value="${time.end}" required />
      </div>
    `).join('');

    return `
      <div class="item-header">
        <input type="text" class="${type}-name" placeholder="Nome" value="${itemName}" required />
      </div>
      <div class="times-container" id="${type}-times-${id}">
        ${timesHTML}
      </div>
    `;
  };

  // Simulando addJobSlot (setup inicial - usa createCategoryCardHTML)
  global.addJobSlot = function (jobData = null) {
    global.jobSlotCounter++;
    const container = document.getElementById('jobs-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `job-slot-${global.jobSlotCounter}`;
    const isFirstItem = container.children.length === 0;
    slotDiv.innerHTML = global.createCategoryCardHTML('job', global.jobSlotCounter, jobData, isFirstItem);
    container.appendChild(slotDiv);
  };

  // Simulando collectCategoryData (tenta coletar por classes - CORRETO para setup)
  global.collectCategoryData = function (containerId, slotPrefix) {
    const container = document.getElementById(containerId);
    const items = [];
    const slots = container.querySelectorAll('.item-card');

    slots.forEach(slot => {
      const nameInput = slot.querySelector(`.${slotPrefix}-name`);
      const name = nameInput?.value.trim();

      if (!name) {
        throw new Error('Por favor, preencha o nome de todos os itens!');
      }

      const timeGroups = slot.querySelectorAll('.time-input-group');
      const times = [];

      timeGroups.forEach(group => {
        const startInput = group.querySelector(`.${slotPrefix}-time-start`);
        const endInput = group.querySelector(`.${slotPrefix}-time-end`);
        const start = startInput?.value;
        const end = endInput?.value;

        if (!start || !end) {
          throw new Error(`Preencha todos os horários de ${name}!`);
        }
        times.push({ start, end });
      });

      items.push({ name, times });
    });

    return items;
  };

  // Simulando a versão com IDs (forms.js) - USADA NO PLANEJADOR
  global.collectJobsDataById = function (containerName, itemPrefix) {
    const jobs = [];
    const jobSlots = document.querySelectorAll(`#${containerName}-container .item-card`);

    for (let slot of jobSlots) {
      const slotId = slot.id.split('-').pop();
      const nameInput = document.getElementById(`${itemPrefix}-name-${slotId}`);
      const name = nameInput?.value;

      if (!name) {
        throw new Error('Por favor, preencha o nome do trabalho!');
      }

      const times = [];
      const timeSlots = document.querySelectorAll(`#${itemPrefix}-times-${slotId} .time-slot`);

      for (let timeSlot of timeSlots) {
        const timeIndex = timeSlot.id.split('-').pop();
        const startInput = document.getElementById(`${itemPrefix}-start-${slotId}-${timeIndex}`);
        const endInput = document.getElementById(`${itemPrefix}-end-${slotId}-${timeIndex}`);

        const start = startInput?.value;
        const end = endInput?.value;

        if (!start || !end) {
          throw new Error('Por favor, preencha todos os horários!');
        }

        times.push({ start, end });
      }

      jobs.push({ name, times });
    }

    return jobs;
  };

  test('PROBLEMA: collectCategoryData funciona com createCategoryCardHTML (CLASSES)', () => {
    addJobSlot();

    // Preencher usando classes
    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // Deve funcionar com collectCategoryData
    const jobs = collectCategoryData('jobs-container', 'job');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
  });

  test('PROBLEMA: collectJobsDataById NÃO funciona com createCategoryCardHTML', () => {
    addJobSlot();

    // Preencher usando classes
    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // PROBLEMA: collectJobsDataById procura por IDs que não existem!
    const nameById = document.getElementById('job-name-1');
    expect(nameById).toBeNull(); // NÃO EXISTE!

    // Vai falhar porque os IDs não existem
    expect(() => {
      collectJobsDataById('jobs', 'job');
    }).toThrow();
  });

  test('DEMONSTRAÇÃO: Solução - unificar para usar sempre CLASSES', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // Ambas as funções devem usar a mesma estratégia (classes)
    const jobs = collectCategoryData('jobs-container', 'job');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
    expect(jobs[0].times[0].start).toBe('08:00');
  });
});
