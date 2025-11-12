// Gerenciamento de trabalho no planejador

// Contador global para trabalho
let plannerJobCounter = 0;

// Toggle trabalho no planejador
function togglePlannerWorkForm(show) {
  document.getElementById('planner-work-details').style.display = show ? 'block' : 'none';
  if (show && document.querySelectorAll('#planner-jobs-container .item-card').length === 0) {
    addPlannerJobSlot();
  }
}

// Adicionar trabalho no planejador
function addPlannerJobSlot(jobData = null) {
  plannerJobCounter++;
  const container = document.getElementById('planner-jobs-container');
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `planner-job-slot-${plannerJobCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createJobCardHTML('planner-job', plannerJobCounter, jobData, isFirstItem);

  container.appendChild(slotDiv);
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
