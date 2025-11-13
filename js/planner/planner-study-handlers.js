// Gerenciamento de estudo no planejador

// Contador global para estudo
let plannerStudyCounter = 0;

// Toggle estudo no planejador
function togglePlannerStudyForm(show) {
  const detailsDiv = document.getElementById('planner-study-details');
  if (!detailsDiv) return;

  detailsDiv.style.display = show ? 'block' : 'none';

  if (show) {
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      // Renderizar configurações rápidas
      if (typeof renderQuickConfigs === 'function') {
        renderQuickConfigs('studies', 'planner-study-quick-configs', addPlannerStudySlot);
      } else {
        console.warn('[Planner Study] renderQuickConfigs não disponível');
      }

      // Adicionar primeiro slot se não houver nenhum
      if (document.querySelectorAll('#planner-studies-container .item-card').length === 0) {
        addPlannerStudySlot();
      }
    }, 50);
  }
}

// Adicionar estudo no planejador
function addPlannerStudySlot(studyData = null) {
  const container = document.getElementById('planner-studies-container');

  // Se studyData foi fornecido (configuração rápida), verificar se há slot vazio
  if (studyData) {
    const existingSlots = container.querySelectorAll('.item-card');

    // Verificar se existe um slot vazio (sem nome preenchido)
    for (let slot of existingSlots) {
      const slotId = slot.id.split('-').pop();
      const nameInput = document.getElementById(`planner-study-name-${slotId}`);

      if (nameInput && !nameInput.value.trim()) {
        // Encontrou slot vazio, preencher com os dados
        fillPlannerStudySlot(slotId, studyData);
        return; // Não criar novo slot
      }
    }
  }

  // Se não há studyData ou não há slots vazios, criar novo
  plannerStudyCounter++;
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `planner-study-slot-${plannerStudyCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createStudyCardHTML('planner-study', plannerStudyCounter, studyData, isFirstItem);

  container.appendChild(slotDiv);
}

// Preencher slot existente com dados
function fillPlannerStudySlot(slotId, studyData) {
  if (!studyData) return;

  // Preencher nome
  const nameInput = document.getElementById(`planner-study-name-${slotId}`);
  if (nameInput) {
    nameInput.value = studyData.name || '';
  }

  // Remover horários existentes e adicionar os novos
  const timesContainer = document.getElementById(`planner-study-times-${slotId}`);
  if (timesContainer && studyData.times) {
    timesContainer.innerHTML = '';

    studyData.times.forEach((time, index) => {
      const timeSlot = document.createElement('div');
      timeSlot.innerHTML = createGenericTimeSlotHTML('planner-study', slotId, index, time);
      timesContainer.appendChild(timeSlot.firstElementChild);
    });
  }
}

// Adicionar horário de estudo no planejador
function addPlannerStudyTime(studyId) {
  addGenericTime('planner-study', studyId);
}

// Remover horário de estudo no planejador
function removePlannerStudyTime(studyId, timeIndex) {
  removeGenericTime('planner-study', studyId, timeIndex);
}

// Remover estudo no planejador
function removePlannerStudySlot(id) {
  removeItemSlot('planner-study', id);
}

// Salvar estudo
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

  // Salvar automaticamente
  saveToStorage();

  alert('✅ Estudo salvo!');

  // Voltar para tela de edição e atualizar status
  showScreen('planner-edit');
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}

// Resetar contador (útil para testes e limpeza)
function resetPlannerStudyCounter() {
  plannerStudyCounter = 0;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    togglePlannerStudyForm,
    addPlannerStudySlot,
    addPlannerStudyTime,
    removePlannerStudyTime,
    removePlannerStudySlot,
    savePlannerStudy,
    resetPlannerStudyCounter
  };
}
