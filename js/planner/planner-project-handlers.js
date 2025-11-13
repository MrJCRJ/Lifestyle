// Gerenciamento de projetos no planejador

// Contador global para projetos
let plannerProjectCounter = 0;

// Toggle projetos no planejador
function togglePlannerProjectForm(show) {
  const detailsDiv = document.getElementById('planner-project-details');
  if (!detailsDiv) return;

  detailsDiv.style.display = show ? 'block' : 'none';

  if (show) {
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
      // Renderizar configurações rápidas
      if (typeof renderQuickConfigs === 'function') {
        renderQuickConfigs('projects', 'planner-project-quick-configs', addPlannerProjectSlot);
      } else {
        console.warn('[Planner Project] renderQuickConfigs não disponível');
      }

      // Adicionar primeiro slot se não houver nenhum
      if (document.querySelectorAll('#planner-projects-container .item-card').length === 0) {
        addPlannerProjectSlot();
      }
    }, 50);
  }
}

// Adicionar projeto no planejador
function addPlannerProjectSlot(projectData = null) {
  plannerProjectCounter++;
  const container = document.getElementById('planner-projects-container');
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `planner-project-slot-${plannerProjectCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createProjectCardHTML('planner-project', plannerProjectCounter, projectData, isFirstItem);

  container.appendChild(slotDiv);
}

// Adicionar horário de projeto no planejador
function addPlannerProjectTime(projectId) {
  addGenericTime('planner-project', projectId);
}

// Remover horário de projeto no planejador
function removePlannerProjectTime(projectId, timeIndex) {
  removeGenericTime('planner-project', projectId, timeIndex);
}

// Remover projeto no planejador
function removePlannerProjectSlot(id) {
  removeItemSlot('planner-project', id);
}

// Salvar projetos
function savePlannerProjects() {
  const hasProject = document.querySelector('input[name="plannerHasProject"]:checked');

  if (!hasProject) {
    alert('Por favor, selecione se você trabalha em projetos ou não!');
    return;
  }

  if (!appState.tempPlanData) {
    appState.tempPlanData = {};
  }

  appState.tempPlanData.projects = [];

  if (hasProject.value === 'yes') {
    try {
      appState.tempPlanData.projects = collectProjectsData('planner-projects', 'planner-project');
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  // Salvar automaticamente
  saveToStorage();

  alert('✅ Projetos salvos!');

  // Voltar para tela de edição e atualizar status
  showScreen('planner-edit');
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}

// Criar HTML do card de projeto
function createProjectCardHTML(prefix, id, data = null, isFirst = false) {
  const itemName = data?.name || '';
  const times = data?.times || [{ start: '', end: '' }];

  let timesHTML = times.map((time, index) => `
    <div class="time-slot" id="${prefix}-time-${id}-${index}">
      <input type="time" 
             id="${prefix}-start-${id}-${index}"
             value="${time.start}" 
             required />
      <span>até</span>
      <input type="time" 
             id="${prefix}-end-${id}-${index}"
             value="${time.end}" 
             required />
      ${index > 0 ? `<button type="button" onclick="removePlannerProjectTime(${id}, ${index})" class="btn-remove">×</button>` : ''}
    </div>
  `).join('');

  return `
    <div class="item-header">
      <input type="text" 
             id="${prefix}-name-${id}"
             placeholder="Nome do projeto" 
             value="${itemName}" 
             required />
      ${!isFirst ? `<button type="button" onclick="removePlannerProjectSlot(${id})" class="btn-remove">×</button>` : ''}
    </div>
    <div class="times-container" id="${prefix}-times-${id}">
      ${timesHTML}
    </div>
    <button type="button" onclick="addPlannerProjectTime(${id})" class="btn-secondary btn-small">
      + Adicionar Horário
    </button>
  `;
}

// Resetar contador (útil para testes e limpeza)
function resetPlannerProjectCounter() {
  plannerProjectCounter = 0;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    togglePlannerProjectForm,
    addPlannerProjectSlot,
    addPlannerProjectTime,
    removePlannerProjectTime,
    removePlannerProjectSlot,
    savePlannerProjects,
    createProjectCardHTML,
    resetPlannerProjectCounter
  };
}
