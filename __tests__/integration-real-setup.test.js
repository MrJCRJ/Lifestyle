/**
 * Testes de integração real - Simula o ambiente completo do browser
 */

describe('Integração Real: Setup de Trabalho', () => {
  beforeEach(() => {
    // Simular a estrutura HTML real do setup
    document.body.innerHTML = `
      <section id="work-screen" class="screen">
        <div class="form-content">
          <h2>💼 Trabalho</h2>
          
          <div class="form-group">
            <label>Você trabalha?</label>
            <div class="radio-group">
              <label>
                <input type="radio" name="hasWork" value="yes" />
                Sim
              </label>
              <label>
                <input type="radio" name="hasWork" value="no" />
                Não
              </label>
            </div>
          </div>

          <div id="job-details" style="display: none">
            <div id="jobs-container"></div>
            <button onclick="addJobSlot()" class="btn btn-secondary">
              + Adicionar outro trabalho/bico
            </button>
          </div>
        </div>
      </section>
    `;
  });

  // Simular a função createCategoryCardHTML (do category-manager.js)
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
        ${index > 0 ? `<button type="button" onclick="remove${capitalize(type)}Time(${id}, ${index})" class="btn-remove">×</button>` : ''}
      </div>
    `).join('');

    return `
      <div class="item-header">
        <input type="text" 
               class="${type}-name" 
               placeholder="${config.namePlaceholder}" 
               value="${itemName}" 
               required />
        ${!isFirst ? `<button type="button" onclick="remove${capitalize(type)}Slot(${id})" class="btn-remove">×</button>` : ''}
      </div>
      <div class="times-container" id="${type}-times-${id}">
        ${timesHTML}
      </div>
      <button type="button" onclick="add${capitalize(type)}Time(${id})" class="btn-secondary btn-small">
        + Adicionar Horário
      </button>
    `;
  };

  global.capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Simular addJobSlot (do work.js usando category-manager)
  global.jobSlotCounter = 0;
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

  // Simular collectCategoryData (do category-manager.js)
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

  // Wrapper usado em schedule-generator.js
  global.collectJobsData = function (containerName, itemPrefix) {
    return global.collectCategoryData(`${containerName}-container`, 'job');
  };

  test('REAL: Deve coletar dados quando usuário preenche formulário de setup', () => {
    // Simular que usuário clicou em "Sim" para trabalho
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;

    // Mostrar detalhes
    document.getElementById('job-details').style.display = 'block';

    // Adicionar um slot de trabalho
    addJobSlot();

    // Usuário preenche os dados
    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    nameInput.value = 'Desenvolvedor Full Stack';
    startInput.value = '08:00';
    endInput.value = '17:00';

    // Verificar que os campos estão preenchidos
    expect(nameInput.value).toBe('Desenvolvedor Full Stack');
    expect(startInput.value).toBe('08:00');
    expect(endInput.value).toBe('17:00');

    // Tentar coletar (como faz o schedule-generator.js)
    const jobs = collectJobsData('jobs', 'job');

    // Deve ter coletado com sucesso
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor Full Stack');
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('REAL: Erro quando nome vazio', () => {
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    document.getElementById('job-details').style.display = 'block';

    addJobSlot();

    // Preencher só os horários
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');
    startInput.value = '08:00';
    endInput.value = '17:00';

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Por favor, preencha o nome de todos os itens!');
  });

  test('REAL: Erro quando horário vazio', () => {
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    document.getElementById('job-details').style.display = 'block';

    addJobSlot();

    // Preencher só o nome
    const nameInput = document.querySelector('.job-name');
    nameInput.value = 'Desenvolvedor';

    expect(() => {
      collectJobsData('jobs', 'job');
    }).toThrow('Preencha todos os horários de Desenvolvedor!');
  });

  test('REAL: Múltiplos trabalhos', () => {
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    document.getElementById('job-details').style.display = 'block';

    // Adicionar dois trabalhos
    addJobSlot();
    addJobSlot();

    // Preencher primeiro trabalho
    const nameInputs = document.querySelectorAll('.job-name');
    const startInputs = document.querySelectorAll('.job-time-start');
    const endInputs = document.querySelectorAll('.job-time-end');

    nameInputs[0].value = 'Trabalho Principal';
    startInputs[0].value = '08:00';
    endInputs[0].value = '17:00';

    nameInputs[1].value = 'Freelancer';
    startInputs[1].value = '19:00';
    endInputs[1].value = '22:00';

    const jobs = collectJobsData('jobs', 'job');

    expect(jobs).toHaveLength(2);
    expect(jobs[0].name).toBe('Trabalho Principal');
    expect(jobs[1].name).toBe('Freelancer');
  });

  test('REAL: Verificar que inputs tem valores corretos antes de coletar', () => {
    const yesRadio = document.querySelector('input[name="hasWork"][value="yes"]');
    yesRadio.checked = true;
    document.getElementById('job-details').style.display = 'block';

    addJobSlot();

    const nameInput = document.querySelector('.job-name');
    const startInput = document.querySelector('.job-time-start');
    const endInput = document.querySelector('.job-time-end');

    // DEBUG: Verificar se os seletores estão funcionando
    expect(nameInput).not.toBeNull();
    expect(startInput).not.toBeNull();
    expect(endInput).not.toBeNull();

    nameInput.value = 'Test Job';
    startInput.value = '09:00';
    endInput.value = '18:00';

    // DEBUG: Verificar se os valores foram setados
    expect(nameInput.value).toBe('Test Job');
    expect(startInput.value).toBe('09:00');
    expect(endInput.value).toBe('18:00');

    // DEBUG: Verificar se o trim funciona
    expect(nameInput.value.trim()).toBe('Test Job');

    const jobs = collectJobsData('jobs', 'job');
    expect(jobs[0].name).toBe('Test Job');
  });
});
