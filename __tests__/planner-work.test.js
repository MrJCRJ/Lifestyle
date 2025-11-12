/**
 * Testes para o formulário de trabalho do planejador
 * Objetivo: Identificar e corrigir o bug de validação que informa dados não preenchidos
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Simular o DOM para os testes
beforeEach(() => {
  document.body.innerHTML = `
    <div id="planner-work-details">
      <div id="planner-jobs-container"></div>
    </div>
  `;

  // Reset do contador
  global.plannerJobCounter = 0;
});

// Carregar funções necessárias
function loadScripts() {
  // Simular funções do utils/forms.js
  global.createJobCardHTML = function (prefix, slotId, jobData = null, isFirstItem = true) {
    const name = jobData?.name || '';
    const times = jobData?.times || [{ start: '', end: '' }];

    return `
      <div class="item-header">
          <h4>Trabalho</h4>
          ${!isFirstItem ? `<button class="remove-btn" onclick="removeItemSlot('${prefix}', ${slotId})">Remover</button>` : ''}
      </div>
      
      <div class="form-group">
          <label>Nome do trabalho:</label>
          <input type="text" id="${prefix}-name-${slotId}" value="${name}" placeholder="Ex: Desenvolvedor, Garçom...">
      </div>
      
      <div id="${prefix}-times-${slotId}">
          ${times.map((time, index) => `
            <div class="time-slot" id="${prefix}-time-${slotId}-${index}">
              <input type="time" id="${prefix}-start-${slotId}-${index}" value="${time.start}">
              <input type="time" id="${prefix}-end-${slotId}-${index}" value="${time.end}">
            </div>
          `).join('')}
      </div>
    `;
  };

  global.collectJobsData = function (containerName, itemPrefix) {
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

  global.addPlannerJobSlot = function (jobData = null) {
    global.plannerJobCounter++;
    const container = document.getElementById('planner-jobs-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `planner-job-slot-${global.plannerJobCounter}`;

    const isFirstItem = container.children.length === 0;
    slotDiv.innerHTML = global.createJobCardHTML('planner-job', global.plannerJobCounter, jobData, isFirstItem);

    container.appendChild(slotDiv);
  };
}

describe('Formulário de Trabalho do Planejador - Bug de Validação', () => {
  beforeEach(() => {
    loadScripts();
  });

  test('BUG: Deve adicionar um slot de trabalho vazio', () => {
    addPlannerJobSlot();

    const container = document.getElementById('planner-jobs-container');
    expect(container.children.length).toBe(1);
    expect(container.querySelector('.item-card')).toBeTruthy();
  });

  test('BUG: Deve encontrar o input de nome do trabalho com ID correto', () => {
    addPlannerJobSlot();

    // Verificar se o input foi criado com o ID esperado
    const nameInput = document.getElementById('planner-job-name-1');
    expect(nameInput).toBeTruthy();
    expect(nameInput.tagName).toBe('INPUT');
  });

  test('BUG: Deve encontrar os inputs de horário com IDs corretos', () => {
    addPlannerJobSlot();

    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    expect(startInput).toBeTruthy();
    expect(endInput).toBeTruthy();
  });

  test('BUG: collectJobsData deve conseguir ler dados preenchidos', () => {
    addPlannerJobSlot();

    // Preencher o formulário
    const nameInput = document.getElementById('planner-job-name-1');
    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // Tentar coletar os dados
    const jobs = collectJobsData('planner-jobs', 'planner-job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
    expect(jobs[0].times).toHaveLength(1);
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('BUG: collectJobsData deve lançar erro quando nome vazio', () => {
    addPlannerJobSlot();

    // Não preencher o nome
    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    startInput.value = '08:00';
    endInput.value = '17:00';

    expect(() => {
      collectJobsData('planner-jobs', 'planner-job');
    }).toThrow('Por favor, preencha o nome do trabalho!');
  });

  test('BUG: collectJobsData deve lançar erro quando horários vazios', () => {
    addPlannerJobSlot();

    // Preencher apenas o nome
    const nameInput = document.getElementById('planner-job-name-1');
    nameInput.value = 'Desenvolvedor';

    expect(() => {
      collectJobsData('planner-jobs', 'planner-job');
    }).toThrow('Por favor, preencha todos os horários!');
  });

  test('BUG: Deve adicionar trabalho com dados pré-existentes', () => {
    const jobData = {
      name: 'Designer',
      times: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ]
    };

    addPlannerJobSlot(jobData);

    const nameInput = document.getElementById('planner-job-name-1');
    expect(nameInput.value).toBe('Designer');

    const start1 = document.getElementById('planner-job-start-1-0');
    const end1 = document.getElementById('planner-job-end-1-0');
    expect(start1.value).toBe('09:00');
    expect(end1.value).toBe('12:00');

    const start2 = document.getElementById('planner-job-start-1-1');
    const end2 = document.getElementById('planner-job-end-1-1');
    expect(start2.value).toBe('14:00');
    expect(end2.value).toBe('18:00');
  });

  test('BUG: Múltiplos trabalhos devem ter IDs únicos', () => {
    addPlannerJobSlot({ name: 'Trabalho 1', times: [{ start: '08:00', end: '12:00' }] });
    addPlannerJobSlot({ name: 'Trabalho 2', times: [{ start: '14:00', end: '18:00' }] });

    const name1 = document.getElementById('planner-job-name-1');
    const name2 = document.getElementById('planner-job-name-2');

    expect(name1).toBeTruthy();
    expect(name2).toBeTruthy();
    expect(name1.value).toBe('Trabalho 1');
    expect(name2.value).toBe('Trabalho 2');

    const jobs = collectJobsData('planner-jobs', 'planner-job');
    expect(jobs).toHaveLength(2);
  });
});
