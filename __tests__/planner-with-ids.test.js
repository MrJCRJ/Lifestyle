/**
 * Testes para o PLANEJADOR (estrutura com IDs)
 * Cobre o caso: Input de nome (.job-name) não encontrado no slot!
 */

describe('PLANEJADOR: Formulário com IDs (planner-job-name-1)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="planner-jobs-container"></div>
    `;
    global.plannerJobCounter = 0;
  });

  // Simular a função createJobCardHTML do forms.js (usado no planejador)
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
            <div class="time-slot-header">
                <strong>Horário ${index + 1}</strong>
                ${index > 0 ? `<button class="remove-btn" onclick="removeGenericTime('${prefix}', ${slotId}, ${index})">Remover</button>` : ''}
            </div>
            <div class="time-inputs">
                <div class="form-group">
                    <label>Início:</label>
                    <input type="time" id="${prefix}-start-${slotId}-${index}" value="${time.start}">
                </div>
                <div class="form-group">
                    <label>Fim:</label>
                    <input type="time" id="${prefix}-end-${slotId}-${index}" value="${time.end}">
                </div>
            </div>
        </div>
    `).join('')}
        </div>
        
        <button onclick="addGenericTime('${prefix}', ${slotId})" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">
            + Adicionar outro horário
        </button>
    `;
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

  // Função collectCategoryData CORRIGIDA
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
      const slotId = slot.id.split('-').pop();
      let nameInput = null;
      let name = '';

      // Tentar buscar por ID primeiro (usado no planejador: planner-job-name-1)
      if (slotPrefix.includes('planner-')) {
        nameInput = document.getElementById(`${slotPrefix}-name-${slotId}`);
      }

      // Se não encontrou por ID, buscar por classe (usado no setup: .job-name)
      if (!nameInput) {
        const classPrefix = slotPrefix.replace('planner-', '');
        nameInput = slot.querySelector(`.${classPrefix}-name`);
      }

      if (!nameInput) {
        console.error(`Slot problemático:`, slot);
        console.error(`Tentou buscar por ID: ${slotPrefix}-name-${slotId}`);
        console.error(`Tentou buscar por classe: .${slotPrefix.replace('planner-', '')}-name`);
        throw new Error(`Input de nome não encontrado no slot!`);
      }

      name = nameInput.value.trim();

      if (!name) {
        throw new Error('Por favor, preencha o nome de todos os itens!');
      }

      // Buscar horários - tentar ambas as estruturas
      const times = [];

      // Estrutura do planejador: .time-slot com IDs
      const timeSlots = slot.querySelectorAll('.time-slot');
      if (timeSlots.length > 0) {
        timeSlots.forEach(timeSlot => {
          const timeIndex = timeSlot.id ? timeSlot.id.split('-').pop() : null;

          let startInput, endInput;

          if (timeIndex !== null) {
            // Buscar por ID (planejador)
            startInput = document.getElementById(`${slotPrefix}-start-${slotId}-${timeIndex}`);
            endInput = document.getElementById(`${slotPrefix}-end-${slotId}-${timeIndex}`);
          }

          // Se não encontrou por ID, buscar dentro do timeSlot
          if (!startInput) {
            startInput = timeSlot.querySelector('input[type="time"]');
            endInput = timeSlot.querySelectorAll('input[type="time"]')[1];
          }

          if (!startInput || !endInput) {
            console.error(`TimeSlot problemático:`, timeSlot);
            throw new Error(`Inputs de horário não encontrados para ${name}!`);
          }

          const start = startInput.value;
          const end = endInput.value;

          if (!start || !end) {
            throw new Error(`Preencha todos os horários de ${name}!`);
          }

          times.push({ start, end });
        });
      } else {
        // Estrutura do setup: .time-input-group com classes
        const timeGroups = slot.querySelectorAll('.time-input-group');

        if (timeGroups.length === 0) {
          console.error(`Slot sem horários:`, slot);
          throw new Error(`Nenhum horário encontrado para ${name}!`);
        }

        timeGroups.forEach(group => {
          const classPrefix = slotPrefix.replace('planner-', '');
          const startInput = group.querySelector(`.${classPrefix}-time-start`);
          const endInput = group.querySelector(`.${classPrefix}-time-end`);

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
      }

      items.push({ name, times });
    });

    return items;
  };

  global.collectJobsData = function (containerName, itemPrefix) {
    return global.collectCategoryData(`${containerName}-container`, itemPrefix || 'job');
  };

  test('✅ PLANEJADOR: Deve encontrar input com ID (planner-job-name-1)', () => {
    addPlannerJobSlot();

    // Verificar que o input foi criado com ID
    const nameInput = document.getElementById('planner-job-name-1');
    expect(nameInput).not.toBeNull();
    expect(nameInput.tagName).toBe('INPUT');

    // Preencher
    nameInput.value = 'Desenvolvedor Full Stack';

    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    expect(startInput).not.toBeNull();
    expect(endInput).not.toBeNull();

    startInput.value = '08:00';
    endInput.value = '17:00';

    // Coletar dados usando o prefix correto do planejador
    const jobs = collectJobsData('planner-jobs', 'planner-job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Desenvolvedor Full Stack');
    expect(jobs[0].times[0].start).toBe('08:00');
    expect(jobs[0].times[0].end).toBe('17:00');
  });

  test('✅ PLANEJADOR: Estrutura HTML exata do usuário', () => {
    // Simular EXATAMENTE a estrutura que o usuário mostrou
    document.getElementById('planner-jobs-container').innerHTML = `
    <div class="item-card" id="planner-job-slot-1">
        <div class="item-header">
            <h4>Trabalho</h4>
        </div>
        
        <div class="form-group">
            <label>Nome do trabalho:</label>
            <input type="text" id="planner-job-name-1" value="" placeholder="Ex: Desenvolvedor, Garçom...">
        </div>
        
        <div id="planner-job-times-1">
            <div class="time-slot" id="planner-job-time-1-0">
                <div class="time-slot-header">
                    <strong>Horário 1</strong>
                </div>
                <div class="time-inputs">
                    <div class="form-group">
                        <label>Início:</label>
                        <input type="time" id="planner-job-start-1-0" value="">
                    </div>
                    <div class="form-group">
                        <label>Fim:</label>
                        <input type="time" id="planner-job-end-1-0" value="">
                    </div>
                </div>
            </div>
        </div>
        
        <button onclick="addGenericTime('planner-job', 1)" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">
            + Adicionar outro horário
        </button>
    </div>
    `;

    // Preencher os campos
    const nameInput = document.getElementById('planner-job-name-1');
    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    nameInput.value = 'Designer Gráfico';
    startInput.value = '09:00';
    endInput.value = '18:00';

    // Tentar coletar
    const jobs = collectJobsData('planner-jobs', 'planner-job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Designer Gráfico');
    expect(jobs[0].times).toHaveLength(1);
    expect(jobs[0].times[0].start).toBe('09:00');
    expect(jobs[0].times[0].end).toBe('18:00');
  });

  test('✅ PLANEJADOR: Múltiplos horários', () => {
    addPlannerJobSlot({
      name: 'Freelancer',
      times: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' }
      ]
    });

    const jobs = collectJobsData('planner-jobs', 'planner-job');

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Freelancer');
    expect(jobs[0].times).toHaveLength(2);
    expect(jobs[0].times[0].start).toBe('09:00');
    expect(jobs[0].times[1].end).toBe('18:00');
  });

  test('✅ PLANEJADOR: Validar nome vazio', () => {
    addPlannerJobSlot();

    const startInput = document.getElementById('planner-job-start-1-0');
    const endInput = document.getElementById('planner-job-end-1-0');

    startInput.value = '08:00';
    endInput.value = '17:00';
    // nome fica vazio

    expect(() => {
      collectJobsData('planner-jobs', 'planner-job');
    }).toThrow('Por favor, preencha o nome de todos os itens!');
  });

  test('✅ PLANEJADOR: Validar horários vazios', () => {
    addPlannerJobSlot();

    const nameInput = document.getElementById('planner-job-name-1');
    nameInput.value = 'Desenvolvedor';
    // horários ficam vazios

    expect(() => {
      collectJobsData('planner-jobs', 'planner-job');
    }).toThrow('Preencha todos os horários de Desenvolvedor!');
  });

  test('✅ PLANEJADOR vs SETUP: Ambas estruturas devem funcionar', () => {
    // Adicionar um job do planejador
    addPlannerJobSlot({
      name: 'Job Planejador',
      times: [{ start: '08:00', end: '12:00' }]
    });

    const plannerJobs = collectJobsData('planner-jobs', 'planner-job');
    expect(plannerJobs[0].name).toBe('Job Planejador');

    // Simular estrutura do setup com classes
    document.body.innerHTML += `
      <div id="jobs-container">
        <div class="item-card" id="job-slot-1">
          <div class="item-header">
            <input type="text" class="job-name" value="Job Setup" />
          </div>
          <div class="times-container">
            <div class="time-input-group">
              <input type="time" class="job-time-start" value="14:00" />
              <input type="time" class="job-time-end" value="18:00" />
            </div>
          </div>
        </div>
      </div>
    `;

    const setupJobs = collectJobsData('jobs', 'job');
    expect(setupJobs[0].name).toBe('Job Setup');
  });
});
