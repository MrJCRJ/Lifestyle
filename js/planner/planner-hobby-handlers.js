// Gerenciamento de hobbies no planejador

let plannerHobbyCounter = 0;

function togglePlannerHobbyForm(show) {
  const detailsDiv = document.getElementById('planner-hobby-details');
  if (!detailsDiv) return;

  detailsDiv.style.display = show ? 'block' : 'none';

  if (show) {
    setTimeout(() => {
      if (typeof renderQuickConfigs === 'function') {
        renderQuickConfigs('hobbies', 'planner-hobby-quick-configs', addPlannerHobbySlot);
      }

      if (document.querySelectorAll('#planner-hobbies-container .item-card').length === 0) {
        addPlannerHobbySlot();
      }
    }, 50);
  }
}

function addPlannerHobbySlot(hobbyData = null) {
  const container = document.getElementById('planner-hobbies-container');
  if (!container) return;

  if (hobbyData) {
    const existingSlots = container.querySelectorAll('.item-card');
    for (let slot of existingSlots) {
      const slotId = slot.id.split('-').pop();
      const nameInput = document.getElementById(`planner-hobby-name-${slotId}`);
      if (nameInput && !nameInput.value.trim()) {
        fillPlannerHobbySlot(slotId, hobbyData);
        return;
      }
    }
  }

  plannerHobbyCounter++;
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `planner-hobby-slot-${plannerHobbyCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createHobbyCardHTML('planner-hobby', plannerHobbyCounter, hobbyData, isFirstItem);

  container.appendChild(slotDiv);
}

function fillPlannerHobbySlot(slotId, hobbyData) {
  if (!hobbyData) return;

  const nameInput = document.getElementById(`planner-hobby-name-${slotId}`);
  if (nameInput) {
    nameInput.value = hobbyData.name || '';
  }

  const timesContainer = document.getElementById(`planner-hobby-times-${slotId}`);
  if (timesContainer && hobbyData.times) {
    timesContainer.innerHTML = '';
    hobbyData.times.forEach((time, index) => {
      const timeSlot = document.createElement('div');
      timeSlot.className = 'time-slot';
      timeSlot.id = `planner-hobby-time-${slotId}-${index}`;
      timeSlot.innerHTML = `
        <input type="time"
               id="planner-hobby-start-${slotId}-${index}"
               value="${time.start}"
               required />
        <span>até</span>
        <input type="time"
               id="planner-hobby-end-${slotId}-${index}"
               value="${time.end}"
               required />
        ${index > 0 ? `<button type="button" onclick="removePlannerHobbyTime(${slotId}, ${index})" class="btn-remove">×</button>` : ''}
      `;
      timesContainer.appendChild(timeSlot);
    });
  }
}

function addPlannerHobbyTime(hobbyId) {
  addGenericTime('planner-hobby', hobbyId);
}

function removePlannerHobbyTime(hobbyId, timeIndex) {
  removeGenericTime('planner-hobby', hobbyId, timeIndex);
}

function removePlannerHobbySlot(id) {
  removeItemSlot('planner-hobby', id);
}

function savePlannerHobbies() {
  const hasHobby = document.querySelector('input[name="plannerHasHobby"]:checked');

  if (!hasHobby) {
    alert('Por favor, selecione se você reservou tempo para hobbies!');
    return;
  }

  if (!appState.tempPlanData) {
    appState.tempPlanData = {};
  }

  appState.tempPlanData.hobbies = [];

  if (hasHobby.value === 'yes') {
    try {
      appState.tempPlanData.hobbies = collectHobbiesData('planner-hobbies', 'planner-hobby');
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  saveToStorage();
  alert('✅ Hobbies salvos!');
  showScreen('planner-edit');
  if (typeof updateEditPlannerStatus === 'function') {
    updateEditPlannerStatus();
  }
}

function createHobbyCardHTML(prefix, id, data = null, isFirst = false) {
  const itemName = data?.name || '';
  const times = data?.times || [{ start: '', end: '' }];

  const timesHTML = times.map((time, index) => `
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
      ${index > 0 ? `<button type="button" onclick="removePlannerHobbyTime(${id}, ${index})" class="btn-remove">×</button>` : ''}
    </div>
  `).join('');

  return `
    <div class="item-header">
      <input type="text"
             id="${prefix}-name-${id}"
             placeholder="Nome do hobby ou lazer"
             value="${itemName}"
             required />
      ${!isFirst ? `<button type="button" onclick="removePlannerHobbySlot(${id})" class="btn-remove">×</button>` : ''}
    </div>
    <div class="times-container" id="${prefix}-times-${id}">
      ${timesHTML}
    </div>
    <button type="button" onclick="addPlannerHobbyTime(${id})" class="btn-secondary btn-small">
      + Adicionar Horário
    </button>
  `;
}

function resetPlannerHobbyCounter() {
  plannerHobbyCounter = 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    togglePlannerHobbyForm,
    addPlannerHobbySlot,
    addPlannerHobbyTime,
    removePlannerHobbyTime,
    removePlannerHobbySlot,
    savePlannerHobbies,
    createHobbyCardHTML,
    resetPlannerHobbyCounter
  };
}
