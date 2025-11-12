/**
 * Teste do fluxo completo do Wizard do Planejador
 * Simula o fluxo: sono → trabalho → estudo → limpeza → refeições → hidratação → exercício
 */

describe('WIZARD DO PLANEJADOR: Fluxo Completo', () => {
  let currentScreen = '';

  beforeEach(() => {
    // Usar fake timers para controlar setTimeout
    jest.useFakeTimers();

    // Setup inicial
    global.appState = {
      tempPlanData: {},
      planningDate: '2025-11-13',
      isPlanningMode: true,
      userData: {
        userProfile: {},
        dailySchedules: {}
      }
    };

    currentScreen = '';

    // Mock saveToStorage
    global.saveToStorage = jest.fn(() => {
      console.log('💾 Dados salvos no localStorage');
    });

    // Mock showScreen
    global.showScreen = jest.fn((screenId) => {
      currentScreen = screenId;
      console.log(`📺 Tela atual: ${screenId}`);
    });

    // Mock alert
    global.alert = jest.fn((msg) => {
      console.error(`⚠️ ALERT: ${msg}`);
    });

    // Mock goToSchedules
    global.goToSchedules = jest.fn(() => {
      console.log('📅 Voltou para tela de cronogramas');
    });

    // Mock clearPlannerForms
    global.clearPlannerForms = jest.fn();

    // Mock loadPlanDataToWizard
    global.loadPlanDataToWizard = jest.fn((data) => {
      console.log('📥 Carregando dados no wizard:', data);
      // Simula o carregamento dos dados nos campos
      if (data.sleep) {
        document.getElementById('plannerSleepTime').value = data.sleep;
      }
      if (data.wake) {
        document.getElementById('plannerWakeTime').value = data.wake;
      }
    });

    // Mock DOM
    document.body.innerHTML = `
      <!-- Sono -->
      <input id="plannerSleepTime" type="time" value="" />
      <input id="plannerWakeTime" type="time" value="" />
      
      <!-- Trabalho -->
      <input type="radio" name="plannerHasWork" value="yes" />
      <input type="radio" name="plannerHasWork" value="no" />
      <div id="planner-jobs-container"></div>
      
      <!-- Estudo -->
      <input type="radio" name="plannerHasStudy" value="yes" />
      <input type="radio" name="plannerHasStudy" value="no" />
      <div id="planner-studies-container"></div>
      
      <!-- Limpeza -->
      <input type="radio" name="plannerHasCleaning" value="yes" />
      <input type="radio" name="plannerHasCleaning" value="no" />
      <input id="plannerCleaningStartTime" type="time" value="" />
      <input id="plannerCleaningEndTime" type="time" value="" />
      <input id="plannerCleaningNotes" type="text" value="" />
    `;

    // collectJobsData
    global.collectJobsData = function (containerName, itemPrefix) {
      const container = document.getElementById(`${containerName}-container`);
      if (!container) throw new Error(`Container ${containerName}-container não encontrado!`);

      const slots = container.querySelectorAll('.item-card');
      if (slots.length === 0) throw new Error('Por favor, adicione pelo menos um trabalho!');

      const jobs = [];
      slots.forEach(slot => {
        const slotId = slot.id.split('-').pop();
        const nameInput = document.getElementById(`${itemPrefix}-name-${slotId}`);

        if (!nameInput) {
          throw new Error(`Input de nome (${itemPrefix}-name-${slotId}) não encontrado no slot!`);
        }

        const name = nameInput.value.trim();
        if (!name) throw new Error('Por favor, preencha o nome de todos os trabalhos!');

        const times = [];
        const timeSlots = slot.querySelectorAll('.time-slot');

        timeSlots.forEach(timeSlot => {
          const timeIndex = timeSlot.id.split('-').pop();
          const startInput = document.getElementById(`${itemPrefix}-start-${slotId}-${timeIndex}`);
          const endInput = document.getElementById(`${itemPrefix}-end-${slotId}-${timeIndex}`);

          if (!startInput || !endInput) {
            throw new Error(`Inputs de horário não encontrados!`);
          }

          const start = startInput.value;
          const end = endInput.value;

          if (!start || !end) {
            throw new Error(`Preencha todos os horários de ${name}!`);
          }

          times.push({ start, end });
        });

        jobs.push({ name, times });
      });

      return jobs;
    };

    // collectStudiesData
    global.collectStudiesData = function (containerName, itemPrefix) {
      const container = document.getElementById(`${containerName}-container`);
      if (!container) throw new Error(`Container ${containerName}-container não encontrado!`);

      const slots = container.querySelectorAll('.item-card');
      if (slots.length === 0) throw new Error('Por favor, adicione pelo menos um estudo!');

      const studies = [];
      slots.forEach(slot => {
        const slotId = slot.id.split('-').pop();
        const nameInput = document.getElementById(`${itemPrefix}-name-${slotId}`);

        if (!nameInput) {
          throw new Error(`Input de nome (${itemPrefix}-name-${slotId}) não encontrado no slot!`);
        }

        const name = nameInput.value.trim();
        if (!name) throw new Error('Por favor, preencha o nome de todos os estudos!');

        const times = [];
        const timeSlots = slot.querySelectorAll('.time-slot');

        timeSlots.forEach(timeSlot => {
          const timeIndex = timeSlot.id.split('-').pop();
          const startInput = document.getElementById(`${itemPrefix}-start-${slotId}-${timeIndex}`);
          const endInput = document.getElementById(`${itemPrefix}-end-${slotId}-${timeIndex}`);

          if (!startInput || !endInput) {
            throw new Error(`Inputs de horário não encontrados!`);
          }

          const start = startInput.value;
          const end = endInput.value;

          if (!start || !end) {
            throw new Error(`Preencha todos os horários de ${name}!`);
          }

          times.push({ start, end });
        });

        studies.push({ name, times });
      });

      return studies;
    };
  });

  afterEach(() => {
    // Limpar timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ========== FUNÇÕES DO WIZARD ==========

  function cancelPlanner() {
    appState.isPlanningMode = false;
    appState.planningDate = null;
    goToSchedules();
  }

  function planSpecificDay(dateKey) {
    appState.planningDate = dateKey;
    appState.isPlanningMode = true;

    // Verificar se já existe um cronograma salvo ou rascunho para esta data
    const existingSchedule = appState.userData.dailySchedules?.[dateKey];
    const isDraft = existingSchedule?.isDraft === true;

    // Se existe um rascunho, carregar dados em tempPlanData
    if (isDraft && existingSchedule?.planData) {
      appState.tempPlanData = { ...existingSchedule.planData };
      loadPlanDataToWizard(existingSchedule.planData);

      // Mostrar mensagem de continuação
      setTimeout(() => {
        alert('📝 Continuando planejamento pausado...');
      }, 200);
    } else {
      // Iniciar planejamento novo
      appState.tempPlanData = {};
      clearPlannerForms();
    }

    showScreen('planner-sleep');
    saveToStorage();
  }

  function pausePlanner() {
    // Os dados já foram salvos automaticamente em cada etapa
    // Salvar informação de que há um planejamento pausado
    if (appState.planningDate && appState.tempPlanData) {
      // Salvar dados temporários no dailySchedule como rascunho
      if (!appState.userData.dailySchedules) {
        appState.userData.dailySchedules = {};
      }

      if (!appState.userData.dailySchedules[appState.planningDate]) {
        appState.userData.dailySchedules[appState.planningDate] = {};
      }

      // Salvar como planData parcial (draft)
      appState.userData.dailySchedules[appState.planningDate].planData = appState.tempPlanData;
      appState.userData.dailySchedules[appState.planningDate].isDraft = true;
      appState.userData.dailySchedules[appState.planningDate].lastSaved = new Date().toISOString();

      saveToStorage();
    }

    // Limpar estado temporário mas manter planningDate para restaurar depois
    appState.isPlanningMode = false;

    alert('✅ Progresso salvo! Você pode continuar depois.');
    goToSchedules();
  }

  function savePlannerSleep() {
    const sleepTime = document.getElementById('plannerSleepTime').value;
    const wakeTime = document.getElementById('plannerWakeTime').value;

    if (!sleepTime || !wakeTime) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    if (!appState.tempPlanData) {
      appState.tempPlanData = {};
    }
    appState.tempPlanData.sleep = sleepTime;
    appState.tempPlanData.wake = wakeTime;

    // Salvar automaticamente após cada etapa
    saveToStorage();

    showScreen('planner-work');
  }

  function savePlannerWork() {
    const hasWork = document.querySelector('input[name="plannerHasWork"]:checked');

    if (!hasWork) {
      alert('Por favor, selecione se você trabalha ou não!');
      return;
    }

    if (!appState.tempPlanData) {
      appState.tempPlanData = {};
    }

    appState.tempPlanData.jobs = [];

    if (hasWork.value === 'yes') {
      try {
        appState.tempPlanData.jobs = collectJobsData('planner-jobs', 'planner-job');
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    // Salvar automaticamente após cada etapa
    saveToStorage();

    showScreen('planner-study');
  }

  function savePlannerStudy() {
    const hasStudy = document.querySelector('input[name="plannerHasStudy"]:checked');

    if (!hasStudy) {
      alert('Por favor, selecione se você estuda ou não!');
      return;
    }

    if (!appState.tempPlanData) {
      appState.tempPlanData = {};
    }
    appState.tempPlanData.studies = [];

    if (hasStudy.value === 'yes') {
      try {
        appState.tempPlanData.studies = collectStudiesData('planner-studies', 'planner-study');
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    // Salvar automaticamente após cada etapa
    saveToStorage();

    showScreen('planner-cleaning');
  }

  function savePlannerCleaning() {
    const hasCleaning = document.querySelector('input[name="plannerHasCleaning"]:checked');

    if (!hasCleaning) {
      alert('Por favor, selecione se você faz limpeza ou não!');
      return;
    }

    if (!appState.tempPlanData) {
      appState.tempPlanData = {};
    }
    appState.tempPlanData.cleaning = null;

    if (hasCleaning.value === 'yes') {
      const cleaningStart = document.getElementById('plannerCleaningStartTime').value;
      const cleaningEnd = document.getElementById('plannerCleaningEndTime').value;
      const cleaningNotes = document.getElementById('plannerCleaningNotes').value;

      if (!cleaningStart || !cleaningEnd) {
        alert('Por favor, preencha os horários de limpeza!');
        return;
      }

      appState.tempPlanData.cleaning = {
        start: cleaningStart,
        end: cleaningEnd,
        notes: cleaningNotes
      };
    }

    // Salvar automaticamente após cada etapa
    saveToStorage();

    showScreen('planner-meals');
  }

  // ========== TESTES ==========

  test('✅ ETAPA 1: savePlannerSleep() sem preencher deve alertar', () => {
    savePlannerSleep();

    expect(alert).toHaveBeenCalledWith('Por favor, preencha todos os campos!');
    expect(showScreen).not.toHaveBeenCalled();
    expect(currentScreen).toBe('');
  });

  test('✅ ETAPA 1: savePlannerSleep() preenchido deve ir para trabalho', () => {
    document.getElementById('plannerSleepTime').value = '22:00';
    document.getElementById('plannerWakeTime').value = '06:00';

    savePlannerSleep();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-work');
    expect(currentScreen).toBe('planner-work');
    expect(appState.tempPlanData.sleep).toBe('22:00');
    expect(appState.tempPlanData.wake).toBe('06:00');
    expect(saveToStorage).toHaveBeenCalled(); // Deve salvar automaticamente
  });

  test('✅ SALVAMENTO AUTOMÁTICO: Dados devem persistir após cada etapa', () => {
    console.log('\n💾 TESTE DE PERSISTÊNCIA...\n');

    // Etapa 1: Sono
    document.getElementById('plannerSleepTime').value = '23:00';
    document.getElementById('plannerWakeTime').value = '07:00';
    savePlannerSleep();
    expect(saveToStorage).toHaveBeenCalledTimes(1);
    expect(appState.tempPlanData.sleep).toBe('23:00');
    console.log('✅ Sono salvo e persistido\n');

    // Etapa 2: Trabalho (não)
    document.querySelector('input[name="plannerHasWork"][value="no"]').checked = true;
    savePlannerWork();
    expect(saveToStorage).toHaveBeenCalledTimes(2);
    expect(appState.tempPlanData.jobs).toEqual([]);
    console.log('✅ Trabalho salvo e persistido\n');

    // Etapa 3: Estudo (não)
    document.querySelector('input[name="plannerHasStudy"][value="no"]').checked = true;
    savePlannerStudy();
    expect(saveToStorage).toHaveBeenCalledTimes(3);
    expect(appState.tempPlanData.studies).toEqual([]);
    console.log('✅ Estudo salvo e persistido\n');

    // Etapa 4: Limpeza (não)
    document.querySelector('input[name="plannerHasCleaning"][value="no"]').checked = true;
    savePlannerCleaning();
    expect(saveToStorage).toHaveBeenCalledTimes(4);
    expect(appState.tempPlanData.cleaning).toBeNull();
    console.log('✅ Limpeza salva e persistida\n');

    console.log('✅ TODOS OS DADOS FORAM PERSISTIDOS!\n');
  });

  test('✅ ETAPA 2: savePlannerWork() sem selecionar deve alertar', () => {
    savePlannerWork();

    expect(alert).toHaveBeenCalledWith('Por favor, selecione se você trabalha ou não!');
    expect(showScreen).not.toHaveBeenCalled();
  });

  test('✅ ETAPA 2: savePlannerWork() com "não" deve ir para estudo', () => {
    document.querySelector('input[name="plannerHasWork"][value="no"]').checked = true;

    savePlannerWork();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-study');
    expect(currentScreen).toBe('planner-study');
    expect(appState.tempPlanData.jobs).toEqual([]);
  });

  test('✅ ETAPA 2: savePlannerWork() com "sim" mas sem preencher deve alertar', () => {
    document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;

    savePlannerWork();

    expect(alert).toHaveBeenCalled();
    expect(showScreen).not.toHaveBeenCalled();
  });

  test('✅ ETAPA 2: savePlannerWork() com trabalho preenchido deve ir para estudo', () => {
    // Marcar "sim"
    document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;

    // Adicionar trabalho
    const container = document.getElementById('planner-jobs-container');
    container.innerHTML = `
      <div class="item-card" id="planner-job-slot-1">
        <input type="text" id="planner-job-name-1" value="Desenvolvedor" />
        <div class="time-slot" id="planner-job-time-1-0">
          <input type="time" id="planner-job-start-1-0" value="08:00" />
          <input type="time" id="planner-job-end-1-0" value="17:00" />
        </div>
      </div>
    `;

    savePlannerWork();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-study');
    expect(currentScreen).toBe('planner-study');
    expect(appState.tempPlanData.jobs).toHaveLength(1);
    expect(appState.tempPlanData.jobs[0].name).toBe('Desenvolvedor');
  });

  test('✅ ETAPA 3: savePlannerStudy() sem selecionar deve alertar', () => {
    savePlannerStudy();

    expect(alert).toHaveBeenCalledWith('Por favor, selecione se você estuda ou não!');
    expect(showScreen).not.toHaveBeenCalled();
  });

  test('✅ ETAPA 3: savePlannerStudy() com "não" deve ir para limpeza', () => {
    document.querySelector('input[name="plannerHasStudy"][value="no"]').checked = true;

    savePlannerStudy();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-cleaning');
    expect(currentScreen).toBe('planner-cleaning');
    expect(appState.tempPlanData.studies).toEqual([]);
  });

  test('✅ ETAPA 3: savePlannerStudy() com estudo preenchido deve ir para limpeza', () => {
    // Marcar "sim"
    document.querySelector('input[name="plannerHasStudy"][value="yes"]').checked = true;

    // Adicionar estudo
    const container = document.getElementById('planner-studies-container');
    container.innerHTML = `
      <div class="item-card" id="planner-study-slot-1">
        <input type="text" id="planner-study-name-1" value="Inglês" />
        <div class="time-slot" id="planner-study-time-1-0">
          <input type="time" id="planner-study-start-1-0" value="19:00" />
          <input type="time" id="planner-study-end-1-0" value="20:00" />
        </div>
      </div>
    `;

    savePlannerStudy();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-cleaning');
    expect(currentScreen).toBe('planner-cleaning');
    expect(appState.tempPlanData.studies).toHaveLength(1);
    expect(appState.tempPlanData.studies[0].name).toBe('Inglês');
  });

  test('✅ ETAPA 4: savePlannerCleaning() com "não" deve ir para refeições', () => {
    document.querySelector('input[name="plannerHasCleaning"][value="no"]').checked = true;

    savePlannerCleaning();

    expect(alert).not.toHaveBeenCalled();
    expect(showScreen).toHaveBeenCalledWith('planner-meals');
    expect(currentScreen).toBe('planner-meals');
    expect(appState.tempPlanData.cleaning).toBeNull();
  });

  test('✅ FLUXO COMPLETO: Sono → Trabalho (não) → Estudo (não) → Limpeza (não)', () => {
    console.log('\n🚀 INICIANDO FLUXO COMPLETO...\n');

    // 1. Sono
    console.log('1️⃣ Preenchendo sono...');
    document.getElementById('plannerSleepTime').value = '23:00';
    document.getElementById('plannerWakeTime').value = '07:00';
    savePlannerSleep();
    expect(currentScreen).toBe('planner-work');
    console.log('✅ Sono salvo, navegou para trabalho\n');

    // 2. Trabalho (não)
    console.log('2️⃣ Selecionando "não trabalha"...');
    document.querySelector('input[name="plannerHasWork"][value="no"]').checked = true;
    savePlannerWork();
    expect(currentScreen).toBe('planner-study');
    console.log('✅ Trabalho salvo, navegou para estudo\n');

    // 3. Estudo (não)
    console.log('3️⃣ Selecionando "não estuda"...');
    document.querySelector('input[name="plannerHasStudy"][value="no"]').checked = true;
    savePlannerStudy();
    expect(currentScreen).toBe('planner-cleaning');
    console.log('✅ Estudo salvo, navegou para limpeza\n');

    // 4. Limpeza (não)
    console.log('4️⃣ Selecionando "não faz limpeza"...');
    document.querySelector('input[name="plannerHasCleaning"][value="no"]').checked = true;
    savePlannerCleaning();
    expect(currentScreen).toBe('planner-meals');
    console.log('✅ Limpeza salva, navegou para refeições\n');

    // Verificar dados salvos
    expect(appState.tempPlanData).toEqual({
      sleep: '23:00',
      wake: '07:00',
      jobs: [],
      studies: [],
      cleaning: null
    });

    console.log('✅ FLUXO COMPLETO EXECUTADO COM SUCESSO!\n');
  });

  test('✅ FLUXO COMPLETO: Com trabalho E estudo', () => {
    console.log('\n🚀 FLUXO COM TRABALHO E ESTUDO...\n');

    // 1. Sono
    document.getElementById('plannerSleepTime').value = '22:30';
    document.getElementById('plannerWakeTime').value = '06:30';
    savePlannerSleep();
    expect(currentScreen).toBe('planner-work');

    // 2. Trabalho (sim)
    document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;
    const jobContainer = document.getElementById('planner-jobs-container');
    jobContainer.innerHTML = `
      <div class="item-card" id="planner-job-slot-1">
        <input type="text" id="planner-job-name-1" value="Analista" />
        <div class="time-slot" id="planner-job-time-1-0">
          <input type="time" id="planner-job-start-1-0" value="09:00" />
          <input type="time" id="planner-job-end-1-0" value="18:00" />
        </div>
      </div>
    `;
    savePlannerWork();
    expect(currentScreen).toBe('planner-study');
    expect(appState.tempPlanData.jobs[0].name).toBe('Analista');

    // 3. Estudo (sim)
    document.querySelector('input[name="plannerHasStudy"][value="yes"]').checked = true;
    const studyContainer = document.getElementById('planner-studies-container');
    studyContainer.innerHTML = `
      <div class="item-card" id="planner-study-slot-1">
        <input type="text" id="planner-study-name-1" value="Python" />
        <div class="time-slot" id="planner-study-time-1-0">
          <input type="time" id="planner-study-start-1-0" value="20:00" />
          <input type="time" id="planner-study-end-1-0" value="21:30" />
        </div>
      </div>
    `;
    savePlannerStudy();
    expect(currentScreen).toBe('planner-cleaning');
    expect(appState.tempPlanData.studies[0].name).toBe('Python');

    console.log('✅ Trabalho e estudo salvos corretamente!\n');
  });

  test('✅ PAUSAR: Deve salvar progresso e voltar para cronogramas', () => {
    console.log('\n⏸️ TESTE DE PAUSAR...\n');

    // Definir data de planejamento
    appState.planningDate = '2025-11-13';

    // Preencher sono
    document.getElementById('plannerSleepTime').value = '22:00';
    document.getElementById('plannerWakeTime').value = '06:00';
    savePlannerSleep();

    expect(appState.tempPlanData.sleep).toBe('22:00');
    expect(saveToStorage).toHaveBeenCalledTimes(1);
    console.log('✅ Sono preenchido\n');

    // Preencher trabalho
    document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;
    const jobContainer = document.getElementById('planner-jobs-container');
    jobContainer.innerHTML = `
      <div class="item-card" id="planner-job-slot-1">
        <input type="text" id="planner-job-name-1" value="Desenvolvedor" />
        <div class="time-slot" id="planner-job-time-1-0">
          <input type="time" id="planner-job-start-1-0" value="08:00" />
          <input type="time" id="planner-job-end-1-0" value="17:00" />
        </div>
      </div>
    `;
    savePlannerWork();

    expect(appState.tempPlanData.jobs[0].name).toBe('Desenvolvedor');
    expect(saveToStorage).toHaveBeenCalledTimes(2);
    console.log('✅ Trabalho preenchido\n');

    // Pausar no meio do wizard (na tela de estudo)
    console.log('⏸️ Pausando planejamento...\n');
    pausePlanner();

    // Verificar que os dados foram salvos no dailySchedules como rascunho
    expect(appState.userData.dailySchedules['2025-11-13']).toBeDefined();
    expect(appState.userData.dailySchedules['2025-11-13'].planData.sleep).toBe('22:00');
    expect(appState.userData.dailySchedules['2025-11-13'].planData.jobs[0].name).toBe('Desenvolvedor');
    expect(appState.userData.dailySchedules['2025-11-13'].isDraft).toBe(true);
    expect(appState.isPlanningMode).toBe(false);
    expect(alert).toHaveBeenCalledWith('✅ Progresso salvo! Você pode continuar depois.');
    expect(goToSchedules).toHaveBeenCalled();
    expect(saveToStorage).toHaveBeenCalledTimes(3); // Sono + Trabalho + Pausar

    console.log('✅ PROGRESSO SALVO! Dados persistidos em dailySchedules como rascunho.\n');
  });

  test('✅ CONTINUAR: Deve restaurar dados pausados ao retomar planejamento', () => {
    console.log('\n▶️ TESTE DE CONTINUAR RASCUNHO...\n');

    // Simular que existe um rascunho salvo
    appState.userData.dailySchedules['2025-11-14'] = {
      planData: {
        sleep: '23:00',
        wake: '07:00',
        jobs: [{
          name: 'Designer',
          times: [{ start: '09:00', end: '18:00' }]
        }],
        hasStudy: 'no',
        studies: []
      },
      isDraft: true,
      lastSaved: new Date().toISOString()
    };

    // Resetar mocks
    alert.mockClear();

    // Tentar continuar o planejamento da mesma data
    console.log('▶️ Continuando planejamento pausado da data 2025-11-14...\n');
    planSpecificDay('2025-11-14');

    // Verificar que tempPlanData foi restaurado
    expect(appState.tempPlanData).toBeDefined();
    expect(appState.tempPlanData.sleep).toBe('23:00');
    expect(appState.tempPlanData.wake).toBe('07:00');
    expect(appState.tempPlanData.jobs[0].name).toBe('Designer');
    expect(appState.isPlanningMode).toBe(true);
    expect(appState.planningDate).toBe('2025-11-14');

    // Verificar que o alerta de continuação foi exibido
    // (Note: devido ao setTimeout de 200ms, pode ser necessário usar fake timers)
    jest.runAllTimers();
    expect(alert).toHaveBeenCalledWith('📝 Continuando planejamento pausado...');

    console.log('✅ RASCUNHO RESTAURADO! Dados carregados em tempPlanData.\n');
  });

  test('✅ CANCELAR: Deve limpar dados e voltar', () => {
    // Preencher algo
    document.getElementById('plannerSleepTime').value = '23:00';
    document.getElementById('plannerWakeTime').value = '07:00';
    savePlannerSleep();

    expect(appState.tempPlanData.sleep).toBe('23:00');

    // Cancelar
    cancelPlanner();

    expect(appState.isPlanningMode).toBe(false);
    expect(appState.planningDate).toBeNull();
    expect(goToSchedules).toHaveBeenCalled();
  });
});
