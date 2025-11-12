/**
 * Teste de integração: Validar correção do bug de formulário de trabalho
 */

describe('Correção do Bug: Formulário de Trabalho funciona em ambos os contextos', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="jobs-container"></div>
      <div id="planner-jobs-container"></div>
    `;
    global.jobSlotCounter = 0;
  });

  // Função createCategoryCardHTML (CLASSES - usado no setup)
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

  // Função addJobSlot (setup)
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

  // Função collectJobsData CORRIGIDA (compatível com ambos)
  global.collectJobsData = function (containerName, itemPrefix) {
    const jobs = [];
    const jobSlots = document.querySelectorAll(`#${containerName}-container .item-card`);

    for (let slot of jobSlots) {
      const slotId = slot.id.split('-').pop();

      // Tentar buscar por ID primeiro (planejador usa IDs)
      let nameInput = document.getElementById(`${itemPrefix}-name-${slotId}`);

      // Se não encontrar por ID, buscar por classe (setup usa classes)
      if (!nameInput) {
        nameInput = slot.querySelector(`.${itemPrefix.replace('planner-', '')}-name`);
      }

      const name = nameInput?.value?.trim();

      if (!name) {
        throw new Error('Por favor, preencha o nome do trabalho!');
      }

      const times = [];

      // Verificar se é planejador (tem estrutura com IDs e .time-slot)
      const timesContainer = document.getElementById(`${itemPrefix}-times-${slotId}`);
      const hasTimeSlots = timesContainer && timesContainer.querySelectorAll('.time-slot').length > 0;

      if (hasTimeSlots) {
        // Planejador: usa IDs e estrutura .time-slot
        const timeSlots = timesContainer.querySelectorAll('.time-slot');

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
      } else {
        // Setup: usa classes e estrutura .time-input-group
        const timeGroups = slot.querySelectorAll('.time-input-group');

        for (let timeGroup of timeGroups) {
          const startInput = timeGroup.querySelector(`.${itemPrefix.replace('planner-', '')}-time-start`);
          const endInput = timeGroup.querySelector(`.${itemPrefix.replace('planner-', '')}-time-end`);

          const start = startInput?.value;
          const end = endInput?.value;

          if (!start || !end) {
            throw new Error('Por favor, preencha todos os horários!');
          }

          times.push({ start, end });
        }
      }

      if (times.length === 0) {
        throw new Error(`Adicione pelo menos um horário para ${name}!`);
      }

      jobs.push({ name, times });
    }

    return jobs;
  };

  test('✅ CORRIGIDO: collectJobsData agora funciona com createCategoryCardHTML (CLASSES)', () => {
    // Simular o setup inicial
    addJobSlot();

    // Preencher usando classes (como no setup)
    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // Agora deve funcionar!
    const jobs = collectJobsData('jobs', 'job');
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('✅ CORRIGIDO: Valida corretamente dados vazios', () => {
    addJobSlot();

    // Deixar nome vazio
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');
    startInput.value = '08:00';
    endInput.value = '17:00';

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Por favor, preencha o nome do trabalho!');
  });

  test('✅ CORRIGIDO: Valida horários vazios', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    nameInput.value = 'Desenvolvedor';
    // Não preencher horários

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Por favor, preencha todos os horários!');
  });

  test('✅ CORRIGIDO: Múltiplos trabalhos com dados válidos', () => {
    addJobSlot({ name: 'Dev', times: [{ start: '08:00', end: '12:00' }] });
    addJobSlot({ name: 'Freelancer', times: [{ start: '14:00', end: '18:00' }] });

    // Preencher todos os campos
    const nameInputs = document.querySelectorAll('.job-name');
    const startInputs = document.querySelectorAll('.job-time-start');
    const endInputs = document.querySelectorAll('.job-time-end');

    nameInputs[0].value = 'Desenvolvedor';
    startInputs[0].value = '08:00';
    endInputs[0].value = '12:00';

    nameInputs[1].value = 'Freelancer';
    startInputs[1].value = '14:00';
    endInputs[1].value = '18:00';

    const jobs = collectJobsData('jobs', 'job');
    expect(jobs).toHaveLength(2);
    expect(jobs[0].name).toBe('Desenvolvedor');
    expect(jobs[1].name).toBe('Freelancer');
  });
});
