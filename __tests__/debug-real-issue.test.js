/**
 * Teste de Debug - Verifica condições exatas do erro
 */

describe('DEBUG: Investigação do Bug Real', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="jobs-container"></div>
    `;
    global.jobSlotCounter = 0;
  });

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

  global.collectCategoryData = function (containerId, slotPrefix) {
    console.log('DEBUG collectCategoryData chamado:');
    console.log('  containerId:', containerId);
    console.log('  slotPrefix:', slotPrefix);

    const container = document.getElementById(containerId);
    console.log('  container encontrado:', !!container);

    if (!container) {
      throw new Error(`Container ${containerId} não encontrado!`);
    }

    const slots = container.querySelectorAll('.item-card');
    console.log('  slots encontrados:', slots.length);

    const items = [];

    slots.forEach((slot, slotIndex) => {
      console.log(`  Processando slot ${slotIndex}:`);

      const nameInput = slot.querySelector(`.${slotPrefix}-name`);
      console.log('    nameInput encontrado:', !!nameInput);
      console.log('    nameInput valor:', nameInput?.value);

      const name = nameInput?.value.trim();
      console.log('    name após trim:', name);

      if (!name) {
        console.log('    ERRO: Nome vazio!');
        throw new Error('Por favor, preencha o nome de todos os itens!');
      }

      const timeGroups = slot.querySelectorAll('.time-input-group');
      console.log('    timeGroups encontrados:', timeGroups.length);

      const times = [];

      timeGroups.forEach((group, groupIndex) => {
        console.log(`      Processando timeGroup ${groupIndex}:`);

        const startInput = group.querySelector(`.${slotPrefix}-time-start`);
        const endInput = group.querySelector(`.${slotPrefix}-time-end`);

        console.log('        startInput encontrado:', !!startInput);
        console.log('        startInput valor:', startInput?.value);
        console.log('        endInput encontrado:', !!endInput);
        console.log('        endInput valor:', endInput?.value);

        const start = startInput?.value;
        const end = endInput?.value;

        if (!start || !end) {
          console.log('        ERRO: Horários vazios!');
          throw new Error(`Preencha todos os horários de ${name}!`);
        }

        times.push({ start, end });
      });

      if (times.length === 0) {
        console.log('    ERRO: Nenhum horário adicionado!');
        throw new Error(`Adicione pelo menos um horário para ${name}!`);
      }

      items.push({ name, times });
    });

    console.log('  Total de items coletados:', items.length);
    return items;
  };

  global.collectJobsData = function (containerName, itemPrefix) {
    console.log('collectJobsData chamado:');
    console.log('  containerName:', containerName);
    console.log('  itemPrefix:', itemPrefix);
    console.log('  chamando collectCategoryData com:', `${containerName}-container`, 'job');
    return global.collectCategoryData(`${containerName}-container`, 'job');
  };

  test('DEBUG: Rastrear exatamente o que acontece', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    console.log('\n=== ANTES DE PREENCHER ===');
    console.log('nameInput.value:', nameInput.value);
    console.log('startInput.value:', startInput.value);
    console.log('endInput.value:', endInput.value);

    nameInput.value = 'Desenvolvedor';
    startInput.value = '08:00';
    endInput.value = '17:00';

    console.log('\n=== DEPOIS DE PREENCHER ===');
    console.log('nameInput.value:', nameInput.value);
    console.log('startInput.value:', startInput.value);
    console.log('endInput.value:', endInput.value);

    console.log('\n=== COLETANDO DADOS ===');
    const jobs = collectJobsData('jobs', 'job');

    console.log('\n=== RESULTADO ===');
    console.log('jobs:', JSON.stringify(jobs, null, 2));

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor');
  });

  test('DEBUG: Verificar quando valor está vazio string vs undefined', () => {
    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    console.log('\n=== VALORES INICIAIS ===');
    console.log('nameInput.value === "":', nameInput.value === '');
    console.log('nameInput.value.length:', nameInput.value.length);
    console.log('Boolean(nameInput.value):', Boolean(nameInput.value));
    console.log('!nameInput.value:', !nameInput.value);

    console.log('startInput.value === "":', startInput.value === '');
    console.log('startInput.value.length:', startInput.value.length);
    console.log('Boolean(startInput.value):', Boolean(startInput.value));
    console.log('!startInput.value:', !startInput.value);

    // Quando vazio, .value retorna "" (string vazia), não undefined ou null
    expect(nameInput.value).toBe('');
    expect(startInput.value).toBe('');
    expect(endInput.value).toBe('');

    // String vazia é falsy
    expect(!nameInput.value).toBe(true);
    expect(!startInput.value).toBe(true);
  });

  test('DEBUG: Simular exatamente o que o usuário vê no navegador', () => {
    // Adicionar slot exatamente como o código faz
    addJobSlot();

    // Verificar a estrutura DOM criada
    const container = document.getElementById('jobs-container');
    const slot = container.querySelector('.item-card');

    console.log('\n=== ESTRUTURA DOM ===');
    console.log('Container HTML:', container.innerHTML);

    // Verificar todos os inputs
    const nameInput = slot.querySelector('.job-name');
    const timeStartInput = slot.querySelector('.job-time-start');
    const timeEndInput = slot.querySelector('.job-time-end');

    console.log('\n=== INPUTS ENCONTRADOS ===');
    console.log('nameInput:', !!nameInput);
    console.log('timeStartInput:', !!timeStartInput);
    console.log('timeEndInput:', !!timeEndInput);

    // Simular preenchimento como no browser
    if (nameInput) nameInput.value = 'Dev';
    if (timeStartInput) timeStartInput.value = '08:00';
    if (timeEndInput) timeEndInput.value = '17:00';

    console.log('\n=== VALORES APÓS PREENCHIMENTO ===');
    console.log('nameInput.value:', nameInput?.value);
    console.log('timeStartInput.value:', timeStartInput?.value);
    console.log('timeEndInput.value:', timeEndInput?.value);

    // Tentar coletar
    console.log('\n=== TENTANDO COLETAR ===');
    const jobs = collectJobsData('jobs', 'job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Dev');
  });
});
