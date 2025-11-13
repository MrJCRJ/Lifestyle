// Gerenciamento de trabalho no planejador

// Contador global para trabalho
let plannerJobCounter = 0;

// Toggle trabalho no planejador
function togglePlannerWorkForm(show) {
  const detailsDiv = document.getElementById('planner-work-details');
  if (!detailsDiv) return;

  detailsDiv.style.display = show ? 'block' : 'none';

  if (show) {
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      // Renderizar configurações rápidas
      if (typeof renderQuickConfigs === 'function') {
        renderQuickConfigs('jobs', 'planner-work-quick-configs', addPlannerJobSlot);
      } else {
        console.warn('[Planner Work] renderQuickConfigs não disponível');
      }

      // Adicionar primeiro slot se não houver nenhum
      if (document.querySelectorAll('#planner-jobs-container .item-card').length === 0) {
        addPlannerJobSlot();
      }
    }, 50);
  }
}

// Adicionar trabalho no planejador
function addPlannerJobSlot(jobData = null) {
  const container = document.getElementById('planner-jobs-container');

  // Se jobData foi fornecido (configuração rápida), verificar se há slot vazio
  if (jobData) {
    const existingSlots = container.querySelectorAll('.item-card');

    // Verificar se existe um slot vazio (sem nome preenchido)
    for (let slot of existingSlots) {
      const slotId = slot.id.split('-').pop();
      const nameInput = document.getElementById(`planner-job-name-${slotId}`);

      if (nameInput && !nameInput.value.trim()) {
        // Encontrou slot vazio, preencher com os dados
        fillPlannerJobSlot(slotId, jobData);
        return; // Não criar novo slot
      }
    }
  }

  // Se não há jobData ou não há slots vazios, criar novo
  plannerJobCounter++;
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `planner-job-slot-${plannerJobCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createJobCardHTML('planner-job', plannerJobCounter, jobData, isFirstItem);

  container.appendChild(slotDiv);
}

// Preencher slot existente com dados
function fillPlannerJobSlot(slotId, jobData) {
  if (!jobData) return;

  // Preencher nome
  const nameInput = document.getElementById(`planner-job-name-${slotId}`);
  if (nameInput) {
    nameInput.value = jobData.name || '';
  }

  // Remover horários existentes e adicionar os novos
  const timesContainer = document.getElementById(`planner-job-times-${slotId}`);
  if (timesContainer && jobData.times) {
    timesContainer.innerHTML = '';

    jobData.times.forEach((time, index) => {
      const timeSlot = document.createElement('div');
      timeSlot.innerHTML = createGenericTimeSlotHTML('planner-job', slotId, index, time);
      timesContainer.appendChild(timeSlot.firstElementChild);
    });
  }
}

// Adicionar horário de trabalho no planejador
function addPlannerJobTime(jobId) {
  addGenericTime('planner-job', jobId);
}

// Remover horário de trabalho no planejador
function removePlannerJobTime(jobId, timeIndex) {
  removeGenericTime('planner-job', jobId, timeIndex);
}

// Remover trabalho no planejador
function removePlannerJobSlot(id) {
  removeItemSlot('planner-job', id);
}

// Salvar trabalho
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

  // Salvar automaticamente
  saveToStorage();

  alert('✅ Trabalho salvo!');

  // Voltar para tela de edição e atualizar status
  showScreen('planner-edit');
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}

// Resetar contador (útil para testes e limpeza)
function resetPlannerJobCounter() {
  plannerJobCounter = 0;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    togglePlannerWorkForm,
    addPlannerJobSlot,
    addPlannerJobTime,
    removePlannerJobTime,
    removePlannerJobSlot,
    savePlannerWork,
    resetPlannerJobCounter
  };
}
