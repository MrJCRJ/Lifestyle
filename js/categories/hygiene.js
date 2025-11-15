// Gerenciamento de Higiene com Sistema Inteligente
// Sugere atividades de higiene baseado em frequência configurada

let hygieneSlotCounter = 0;

// Toggle formulário de higiene
function toggleHygieneForm(show) {
  toggleCategoryForm('hygiene', show);
}

// Carregar dados de higiene
function loadHygieneData() {
  const container = document.getElementById('hygiene-container');
  if (!container) return;

  hygieneSlotCounter = 0;
  container.innerHTML = '';

  // Adicionar pelo menos um slot
  addHygieneSlot();
}

// Adicionar slot de higiene
function addHygieneSlot(hygieneData = null) {
  hygieneSlotCounter++;
  const container = document.getElementById('hygiene-container');

  const slotDiv = document.createElement('div');
  slotDiv.className = 'category-slot';
  slotDiv.id = `hygiene-slot-${hygieneSlotCounter}`;

  const isFirstItem = hygieneSlotCounter === 1;
  slotDiv.innerHTML = createCategoryCardHTML('hygiene', hygieneSlotCounter, hygieneData, isFirstItem);

  container.appendChild(slotDiv);

  // Inicializar atividades de higiene sugeridas
  if (!hygieneData) {
    initializeHygieneSuggestions(hygieneSlotCounter);
  }
}

// Inicializar sugestões inteligentes de higiene
function initializeHygieneSuggestions(hygieneId) {
  const activitiesContainer = document.getElementById(`hygiene-activities-${hygieneId}`);
  if (!activitiesContainer) return;

  // Obter sugestões baseadas no histórico
  const suggestions = getHygieneSuggestions();

  let html = '<div class="hygiene-suggestions">';
  html += '<h4>💡 Sugestões para hoje:</h4>';
  html += '<div class="hygiene-activities-list">';

  suggestions.forEach((activity, index) => {
    const checked = activity.suggested ? 'checked' : '';
    const urgentClass = activity.urgent ? 'urgent' : '';

    html += `
            <div class="hygiene-activity-item ${urgentClass}">
                <label>
                    <input type="checkbox" 
                           name="hygiene-${hygieneId}-activity-${index}" 
                           value="${activity.type}"
                           ${checked}
                           onchange="updateHygieneEstimate(${hygieneId})">
                    <span class="activity-icon">${activity.icon}</span>
                    <span class="activity-name">${activity.name}</span>
                    ${activity.urgent ? '<span class="urgent-badge">!</span>' : ''}
                    ${activity.lastDone ? `<span class="last-done">Há ${activity.daysSince} dias</span>` : ''}
                </label>
                <span class="activity-duration">${activity.duration} min</span>
            </div>
        `;
  });

  html += '</div>';
  html += '<p class="hygiene-estimate">Tempo estimado: <strong id="hygiene-time-estimate-' + hygieneId + '">0 min</strong></p>';
  html += '</div>';

  activitiesContainer.innerHTML = html;

  // Atualizar estimativa inicial
  updateHygieneEstimate(hygieneId);
}

// Obter sugestões inteligentes baseadas em histórico
function getHygieneSuggestions() {
  const today = new Date();
  const hygieneHistory = appState.userData.hygieneHistory || {};

  const activities = [
    {
      type: 'shower',
      name: 'Tomar banho',
      icon: '🚿',
      duration: 15,
      frequency: 1, // dias
      suggested: true,
      urgent: false
    },
    {
      type: 'teeth',
      name: 'Escovar dentes',
      icon: '🪥',
      duration: 5,
      frequency: 1,
      suggested: true,
      urgent: false
    },
    {
      type: 'nails',
      name: 'Cortar unhas',
      icon: '💅',
      duration: 10,
      frequency: 7, // semanal
      suggested: false,
      urgent: false
    },
    {
      type: 'hair',
      name: 'Lavar cabelo',
      icon: '💆',
      duration: 20,
      frequency: 2, // a cada 2 dias
      suggested: false,
      urgent: false
    },
    {
      type: 'shave',
      name: 'Fazer barba/Depilar',
      icon: '🪒',
      duration: 15,
      frequency: 3, // a cada 3 dias
      suggested: false,
      urgent: false
    },
    {
      type: 'skincare',
      name: 'Cuidados com a pele',
      icon: '🧴',
      duration: 10,
      frequency: 1,
      suggested: false,
      urgent: false
    },
    {
      type: 'floss',
      name: 'Passar fio dental',
      icon: '🦷',
      duration: 3,
      frequency: 1,
      suggested: true,
      urgent: false
    }
  ];

  // Verificar histórico e calcular sugestões
  activities.forEach(activity => {
    const lastDone = hygieneHistory[activity.type];

    if (lastDone) {
      const lastDate = new Date(lastDone);
      const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      activity.daysSince = daysSince;
      activity.lastDone = true;

      // Sugerir se passou o tempo recomendado
      if (daysSince >= activity.frequency) {
        activity.suggested = true;
      }

      // Marcar como urgente se passou muito tempo
      if (daysSince >= activity.frequency * 2) {
        activity.urgent = true;
      }
    } else {
      // Primeira vez - sugerir baseado em frequência
      activity.suggested = activity.frequency === 1;
    }
  });

  // Ordenar: urgentes primeiro, depois sugeridos, depois por duração
  activities.sort((a, b) => {
    if (a.urgent !== b.urgent) return b.urgent - a.urgent;
    if (a.suggested !== b.suggested) return b.suggested - a.suggested;
    return a.duration - b.duration;
  });

  return activities;
}

// Atualizar estimativa de tempo
function updateHygieneEstimate(hygieneId) {
  const checkboxes = document.querySelectorAll(`[name^="hygiene-${hygieneId}-activity-"]`);
  let totalTime = 0;

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const activityItem = checkbox.closest('.hygiene-activity-item');
      const duration = parseInt(activityItem.querySelector('.activity-duration').textContent);
      totalTime += duration;
    }
  });

  const estimateEl = document.getElementById(`hygiene-time-estimate-${hygieneId}`);
  if (estimateEl) {
    estimateEl.textContent = `${totalTime} min`;
  }

  // Atualizar duração nos inputs de tempo
  const startTimeInput = document.getElementById(`hygiene-${hygieneId}-start`);
  const endTimeInput = document.getElementById(`hygiene-${hygieneId}-end`);

  if (startTimeInput && startTimeInput.value && totalTime > 0) {
    const [hours, minutes] = startTimeInput.value.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + totalTime;

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    if (endTimeInput) {
      endTimeInput.value = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }
  }
}

// Adicionar horário de higiene
function addHygieneTime(hygieneId) {
  addCategoryTime('hygiene', hygieneId);
}

// Salvar higiene e atualizar histórico
function saveHygiene() {
  // Coletar atividades selecionadas
  const selectedActivities = [];
  const checkboxes = document.querySelectorAll('[name^="hygiene-"][name$="-activity-"]');

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedActivities.push(checkbox.value);
    }
  });

  // Atualizar histórico de higiene
  if (!appState.userData.hygieneHistory) {
    appState.userData.hygieneHistory = {};
  }

  const today = new Date().toISOString();
  selectedActivities.forEach(activityType => {
    appState.userData.hygieneHistory[activityType] = today;
  });

  // Salvar dados gerais
  collectCategoryData('hygiene');
  saveToStorage();

  // Ir para próxima tela
  showScreen('exercise');
}

// Versão do planner
function togglePlannerHygieneForm(show) {
  const detailsDiv = document.getElementById('planner-hygiene-details');
  if (detailsDiv) {
    detailsDiv.style.display = show ? 'block' : 'none';

    if (show) {
      initializePlannerHygieneSuggestions();
    }
  }
}

// Inicializar sugestões no planner
function initializePlannerHygieneSuggestions() {
  const activitiesContainer = document.getElementById('planner-hygiene-activities');
  if (!activitiesContainer) return;

  const suggestions = getHygieneSuggestions();

  let html = '<div class="hygiene-suggestions">';
  html += '<h4>💡 Sugestões para hoje:</h4>';
  html += '<div class="hygiene-activities-list">';

  suggestions.forEach((activity, index) => {
    const checked = activity.suggested ? 'checked' : '';
    const urgentClass = activity.urgent ? 'urgent' : '';

    html += `
            <div class="hygiene-activity-item ${urgentClass}">
                <label>
                    <input type="checkbox" 
                           name="planner-hygiene-activity-${index}" 
                           value="${activity.type}"
                           ${checked}
                           onchange="updatePlannerHygieneEstimate()">
                    <span class="activity-icon">${activity.icon}</span>
                    <span class="activity-name">${activity.name}</span>
                    ${activity.urgent ? '<span class="urgent-badge">!</span>' : ''}
                    ${activity.lastDone ? `<span class="last-done">Há ${activity.daysSince} dias</span>` : ''}
                </label>
                <span class="activity-duration">${activity.duration} min</span>
            </div>
        `;
  });

  html += '</div>';
  html += '<p class="hygiene-estimate">Tempo estimado: <strong id="planner-hygiene-time-estimate">0 min</strong></p>';
  html += '</div>';

  activitiesContainer.innerHTML = html;
  updatePlannerHygieneEstimate();
}

// Atualizar estimativa no planner
function updatePlannerHygieneEstimate() {
  const checkboxes = document.querySelectorAll('[name^="planner-hygiene-activity-"]');
  let totalTime = 0;

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const activityItem = checkbox.closest('.hygiene-activity-item');
      const duration = parseInt(activityItem.querySelector('.activity-duration').textContent);
      totalTime += duration;
    }
  });

  const estimateEl = document.getElementById('planner-hygiene-time-estimate');
  if (estimateEl) {
    estimateEl.textContent = `${totalTime} min`;
  }

  // Atualizar duração nos inputs
  const startTimeInput = document.getElementById('plannerHygieneStartTime');
  const endTimeInput = document.getElementById('plannerHygieneEndTime');

  if (startTimeInput && startTimeInput.value && totalTime > 0) {
    const [hours, minutes] = startTimeInput.value.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + totalTime;

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    if (endTimeInput) {
      endTimeInput.value = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }
  }
}

// Salvar higiene do planner
function savePlannerHygiene() {
  const hasHygiene = document.querySelector('input[name="plannerHasHygiene"]:checked');

  if (!hasHygiene) {
    alert('Por favor, selecione se você vai fazer higiene ou não!');
    return;
  }

  if (!appState.tempPlanData) {
    appState.tempPlanData = {};
  }

  if (hasHygiene.value === 'no') {
    appState.tempPlanData.hygiene = null;
    saveToStorage();
    alert('✅ Higiene salva!');
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
      updateEditPlannerStatus();
    }
    return;
  }

  const startTime = document.getElementById('plannerHygieneStartTime').value;
  const endTime = document.getElementById('plannerHygieneEndTime').value;

  if (!startTime || !endTime) {
    alert('Por favor, preencha os horários!');
    return;
  }

  // Coletar atividades selecionadas
  const selectedActivities = [];
  const activityNames = [];
  const checkboxes = document.querySelectorAll('[name^="planner-hygiene-activity-"]');

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedActivities.push(checkbox.value);
      const label = checkbox.closest('label');
      const name = label.querySelector('.activity-name').textContent;
      activityNames.push(name);
    }
  });

  const notes = document.getElementById('plannerHygieneNotes').value;

  appState.tempPlanData.hygiene = {
    start: startTime,
    end: endTime,
    activities: selectedActivities,
    activityNames: activityNames,
    notes: notes
  };

  // Atualizar histórico
  if (!appState.userData.hygieneHistory) {
    appState.userData.hygieneHistory = {};
  }

  const planDate = appState.planningDate;
  selectedActivities.forEach(activityType => {
    appState.userData.hygieneHistory[activityType] = planDate;
  });

  saveToStorage();
  alert('✅ Higiene salva!');

  // Voltar para tela de edição e atualizar status
  showScreen('planner-edit');
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}
