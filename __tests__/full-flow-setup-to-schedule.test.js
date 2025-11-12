/**
 * Teste do Fluxo Completo: Setup → Geração de Cronograma
 * Simula exatamente o que acontece no navegador do usuário
 */

describe('Fluxo Completo: Do Preenchimento à Geração', () => {
  beforeEach(() => {
    // Simular a estrutura completa da página
    document.body.innerHTML = `
      <!-- Tela de Trabalho -->
      <section id="work-screen" class="screen">
        <div class="form-content">
          <div class="form-group">
            <label>Você trabalha?</label>
            <div class="radio-group">
              <label><input type="radio" name="hasWork" value="yes" /> Sim</label>
              <label><input type="radio" name="hasWork" value="no" /> Não</label>
            </div>
          </div>
          <div id="work-details" style="display: none">
            <div id="jobs-container"></div>
          </div>
        </div>
      </section>

      <!-- Outras telas... -->
      <section id="study-screen" class="screen"></section>
      <section id="cleaning-screen" class="screen"></section>
      <section id="meals-screen" class="screen"></section>
      <section id="hydration-screen" class="screen"></section>
      <section id="exercise-screen" class="screen"></section>
    `;

    global.jobSlotCounter = 0;
  });

  // Simular todas as funções necessárias
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

  global.toggleCategoryForm = function (type, show) {
    const detailsId = type === 'job' ? 'work-details' : `${type}-details`;
    const detailsElement = document.getElementById(detailsId);
    if (detailsElement) {
      detailsElement.style.display = show ? 'block' : 'none';
    }
    if (show && type === 'job') {
      const container = document.getElementById('jobs-container');
      if (container && container.children.length === 0) {
        global.addJobSlot();
      }
    }
  };

  global.toggleWorkForm = function (show) {
    global.toggleCategoryForm('job', show);
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
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} não encontrado!`);
    }

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

      if (times.length === 0) {
        throw new Error(`Adicione pelo menos um horário para ${name}!`);
      }

      items.push({ name, times });
    });

    return items;
  };

  global.collectJobsData = function (containerName, itemPrefix) {
    return global.collectCategoryData(`${containerName}-container`, 'job');
  };

  test('FLUXO COMPLETO: Usuário preenche trabalho e depois gera cronograma', () => {
    // PASSO 1: Usuário está na tela de trabalho
    console.log('\n=== PASSO 1: Tela de Trabalho ===');

    // Usuário clica em "Sim" para trabalho
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;

    // Trigger do onchange (toggleWorkForm)
    toggleWorkForm(true);

    // Verificar que o formulário apareceu
    const workDetails = document.getElementById('work-details');
    expect(workDetails.style.display).toBe('block');

    // Verificar que um slot foi criado automaticamente
    const container = document.getElementById('jobs-container');
    expect(container.children.length).toBe(1);

    // PASSO 2: Usuário preenche os dados
    console.log('\n=== PASSO 2: Usuário Preenche Dados ===');

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    console.log('Inputs encontrados:');
    console.log('  nameInput:', !!nameInput);
    console.log('  startInput:', !!startInput);
    console.log('  endInput:', !!endInput);

    nameInput.value = 'Desenvolvedor Full Stack';
    startInput.value = '08:00';
    endInput.value = '17:00';

    console.log('Valores após preenchimento:');
    console.log('  nome:', nameInput.value);
    console.log('  início:', startInput.value);
    console.log('  fim:', endInput.value);

    // PASSO 3: Usuário clica em "Continuar" (saveWork)
    console.log('\n=== PASSO 3: saveWork() ===');
    // saveWork não coleta dados, apenas valida e muda de tela
    const hasWork = document.querySelector('input[name="hasWork"]:checked');
    expect(hasWork).not.toBeNull();
    expect(hasWork.value).toBe('yes');

    // PASSO 4: ... usuário preenche outras telas ...
    console.log('\n=== PASSO 4: Outras Telas (puladas) ===');

    // PASSO 5: Ao final, gera o cronograma (generateTodaySchedule)
    console.log('\n=== PASSO 5: generateTodaySchedule() ===');

    // Simular a coleta de dados
    console.log('Coletando dados de trabalho...');

    const hasWorkCheck = document.querySelector('input[name="hasWork"]:checked');
    let jobs = [];

    if (hasWorkCheck && hasWorkCheck.value === 'yes') {
      console.log('hasWork é "yes", coletando jobs...');

      // AQUI É ONDE O ERRO ACONTECE NO NAVEGADOR REAL!
      try {
        jobs = collectJobsData('jobs', 'job');
        console.log('Dados coletados com sucesso:', JSON.stringify(jobs, null, 2));
      } catch (error) {
        console.error('ERRO ao coletar dados:', error.message);
        throw error;
      }
    }

    // Verificar resultado
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor Full Stack');
    expect(jobs[0].times).toHaveLength(1);
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('FLUXO COMPLETO: Verificar que DOM persiste entre etapas', () => {
    // Adicionar trabalho
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    toggleWorkForm(true);

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Test Job';
    startInput.value = '09:00';
    endInput.value = '18:00';

    // Simular mudança de tela (esconder work-screen)
    document.getElementById('work-screen').style.display = 'none';
    document.getElementById('study-screen').style.display = 'block';

    // ... usuário interage com outras telas ...

    // Voltar para verificar se os dados ainda estão lá
    document.getElementById('study-screen').style.display = 'none';
    document.getElementById('work-screen').style.display = 'block';

    // Dados devem persistir
    const nameInputAgain = document.querySelector('.job-name');
    expect(nameInputAgain.value).toBe('Test Job');

    // Coletar dados (como no generateTodaySchedule)
    const jobs = collectJobsData('jobs', 'job');
    expect(jobs[0].name).toBe('Test Job');
  });

  test('DEBUG: Verificar se problema é com .value ou .value.trim()', () => {
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    toggleWorkForm(true);

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    // Simular diferentes cenários de whitespace
    nameInput.value = '  Desenvolvedor  '; // com espaços
    startInput.value = '08:00';
    endInput.value = '17:00';

    console.log('\n=== TESTE DE WHITESPACE ===');
    console.log('valor original:', `"${nameInput.value}"`);
    console.log('valor trimmed:', `"${nameInput.value.trim()}"`);
    console.log('Boolean do valor:', Boolean(nameInput.value));
    console.log('Boolean do trim:', Boolean(nameInput.value.trim()));

    const jobs = collectJobsData('jobs', 'job');
    expect(jobs[0].name).toBe('Desenvolvedor'); // trim remove espaços
  });
});
