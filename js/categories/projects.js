let projectSlotCounter = 0;

// Toggle formulário de projetos
function toggleProjectForm(show) {
  toggleCategoryForm('project', show);
}

// Carregar dados de projetos
function loadProjectData() {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';
  projectSlotCounter = 0;

  // Sempre iniciar com pelo menos um slot vazio
  addProjectSlot();
}

// Adicionar slot de projeto
function addProjectSlot(projectData = null) {
  projectSlotCounter++;
  const container = document.getElementById('projects-container');
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `project-slot-${projectSlotCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createCategoryCardHTML('project', projectSlotCounter, projectData, isFirstItem);

  container.appendChild(slotDiv);
}

// Adicionar horário ao projeto
function addProjectTime(projectId) {
  addCategoryTime('project', projectId);
}

// Remover horário do projeto
function removeProjectTime(projectId, timeIndex) {
  removeCategoryTime('project', projectId, timeIndex);
}

// Remover projeto
function removeProjectSlot(id) {
  removeCategorySlot('project', id);
}

// Salvar projetos do dia atual
function saveProjects() {
  const hasProject = document.querySelector('input[name="hasProject"]:checked');

  if (!hasProject) {
    alert('Por favor, selecione se você tem projetos ou não!');
    return;
  }

  // Dados de projetos serão salvos no planData ao gerar o cronograma
  saveToStorage();

  // Ir para refeições
  showScreen('meals');
}
