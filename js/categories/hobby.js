let hobbySlotCounter = 0;

// Toggle formulário de hobby
function toggleHobbyForm(show) {
  toggleCategoryForm('hobby', show);
}

// Carregar dados de hobby
function loadHobbyData() {
  const container = document.getElementById('hobbies-container');
  container.innerHTML = '';
  hobbySlotCounter = 0;
  addHobbySlot();
}

// Adicionar slot de hobby
function addHobbySlot(hobbyData = null) {
  hobbySlotCounter++;
  const container = document.getElementById('hobbies-container');
  const slotDiv = document.createElement('div');
  slotDiv.className = 'item-card';
  slotDiv.id = `hobby-slot-${hobbySlotCounter}`;

  const isFirstItem = container.children.length === 0;
  slotDiv.innerHTML = createCategoryCardHTML('hobby', hobbySlotCounter, hobbyData, isFirstItem);

  container.appendChild(slotDiv);
}

function addHobbyTime(hobbyId) {
  addCategoryTime('hobby', hobbyId);
}

function removeHobbyTime(hobbyId, timeIndex) {
  removeCategoryTime('hobby', hobbyId, timeIndex);
}

function removeHobbySlot(id) {
  removeCategorySlot('hobby', id);
}

function saveHobbies() {
  const hasHobby = document.querySelector('input[name="hasHobby"]:checked');

  if (!hasHobby) {
    alert('Por favor, selecione se você pratica hobbies ou não!');
    return;
  }

  saveToStorage();
  showScreen('projects');
}
