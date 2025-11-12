/**
 * Testes da função collectCategoryData do category-manager.js
 * Esta é a função REAL que é usada no navegador
 */

describe('category-manager.js: collectCategoryData (função REAL)', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="jobs-container"></div>`;
    global.jobSlotCounter = 0;
  });

  // Copiar EXATAMENTE a função createCategoryCardHTML do category-manager.js
  global.createCategoryCardHTML = function (type, id, data = null, isFirst = false) {
    const typeConfig = {
      job: { label: 'Trabalho', namePlaceholder: 'Nome do trabalho' },
      study: { label: 'Estudo', namePlaceholder: 'Disciplina/Curso' }
    };

    const config = typeConfig[type];
    const itemName = data?.name || '';
    const times = data?.times || [{ start: '', end: '' }];

    let timesHTML = times.map((time, index) => `
        <div class="time-input-group">
            <input type="time" 
                   class="${type}-time-start" 
                   value="${time.start}" 
                   required />
            <span>até</span>
            <input type="time" 
                   class="${type}-time-end" 
                   value="${time.end}" 
                   required />
            ${index > 0 ? `<button type="button" class="btn-remove">×</button>` : ''}
        </div>
    `).join('');

    return `
        <div class="item-header">
            <input type="text" 
                   class="${type}-name" 
                   placeholder="${config.namePlaceholder}" 
                   value="${itemName}" 
                   required />
            ${!isFirst ? `<button type="button" class="btn-remove">×</button>` : ''}
        </div>
        <div class="times-container" id="${type}-times-${id}">
            ${timesHTML}
        </div>
        <button type="button" class="btn-secondary btn-small">
            + Adicionar Horário
        </button>
    `;
  };

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

  // Copiar EXATAMENTE a função collectCategoryData CORRIGIDA do category-manager.js
  global.collectCategoryData = function (containerId, slotPrefix) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} não encontrado!`);
    }

    const items = [];
    const slots = container.querySelectorAll('.item-card');

    if (slots.length === 0) {
      throw new Error(`Nenhum item encontrado em ${containerId}!`);
    }

    slots.forEach(slot => {
      // Buscar input de nome por classe
      const nameInput = slot.querySelector(`.${slotPrefix}-name`);

      if (!nameInput) {
        console.error(`Slot problemático:`, slot);
        throw new Error(`Input de nome (.${slotPrefix}-name) não encontrado no slot!`);
      }

      const name = nameInput.value.trim();

      if (!name) {
        throw new Error('Por favor, preencha o nome de todos os itens!');
      }

      // Buscar horários
      const timeGroups = slot.querySelectorAll('.time-input-group');
      const times = [];

      if (timeGroups.length === 0) {
        console.error(`Slot sem timeGroups:`, slot);
        throw new Error(`Nenhum grupo de horários (.time-input-group) encontrado para ${name}!`);
      }

      timeGroups.forEach(group => {
        const startInput = group.querySelector(`.${slotPrefix}-time-start`);
        const endInput = group.querySelector(`.${slotPrefix}-time-end`);

        if (!startInput || !endInput) {
          console.error(`TimeGroup problemático:`, group);
          throw new Error(`Inputs de horário não encontrados para ${name}!`);
        }

        const start = startInput.value;
        const end = endInput.value;

        if (!start || !end) {
          throw new Error(`Preencha todos os horários de ${name}!`);
        }

        times.push({ start, end });
      });

      items.push({ name, times });
    });

    return items;
  };

  // Wrapper usado no schedule-generator.js
  global.collectJobsData = function (containerName, itemPrefix) {
    return global.collectCategoryData(`${containerName}-container`, 'job');
  };

  test('✅ Deve coletar dados preenchidos corretamente', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    const jobs = collectJobsData('jobs', 'job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('✅ Deve detectar quando não há slots', () => {
    // Não adicionar nenhum slot
    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Nenhum item encontrado em jobs-container!');
  });

  test('✅ Deve detectar quando nome está vazio', () => {
    addJobSlot();

    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');
    startInput.value = '08:00';
    endInput.value = '17:00';
    // nome fica vazio

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Por favor, preencha o nome de todos os itens!');
  });

  test('✅ Deve detectar quando horários estão vazios', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    nameInput.value = 'Desenvolvedor';
    // horários ficam vazios

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Preencha todos os horários de Desenvolvedor!');
  });

  test('✅ Deve coletar múltiplos trabalhos', () => {
    addJobSlot();
    addJobSlot();

    const nameInputs = document.querySelectorAll('.job-name');
    const startInputs = document.querySelectorAll('.job-time-start');
    const endInputs = document.querySelectorAll('.job-time-end');

    nameInputs[0].value = 'Job 1';
    startInputs[0].value = '08:00';
    endInputs[0].value = '12:00';

    nameInputs[1].value = 'Job 2';
    startInputs[1].value = '14:00';
    endInputs[1].value = '18:00';

    const jobs = collectJobsData('jobs', 'job');

    expect(jobs).toHaveLength(2);
    expect(jobs[0].name).toBe('Job 1');
    expect(jobs[1].name).toBe('Job 2');
  });

  test('✅ Deve processar dados pré-preenchidos', () => {
    // Adicionar com dados
    addJobSlot({
      name: 'Designer',
      times: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ]
    });

    const jobs = collectJobsData('jobs', 'job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Designer');
    expect(jobs[0].times).toHaveLength(2);
    expect(jobs[0].times[0].start).toBe('09:00');
    expect(jobs[0].times[1].end).toBe('18:00');
  });

  test('✅ Deve fazer trim em nomes com espaços', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = '  Desenvolvedor  ';
    startInput.value = '08:00';
    endInput.value = '17:00';

    const jobs = collectJobsData('jobs', 'job');

    expect(jobs[0].name).toBe('Desenvolvedor'); // Sem espaços
  });
});
