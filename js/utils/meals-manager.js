// Gerenciador genérico de horários de refeições

/**
 * Adiciona um horário de refeição
 * @param {string} containerId - ID do container de refeições
 * @param {string} inputClass - Classe dos inputs de tempo
 * @param {string} removeCallback - Nome da função de callback para remover
 */
function addMealTimeSlot(containerId, inputClass, removeCallback) {
  const container = document.getElementById(containerId);
  const mealCount = container.children.length + 1;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'time-slot';
  timeDiv.innerHTML = `
        <label>Refeição ${mealCount}:</label>
        <input type="time" class="${inputClass}" required />
        ${mealCount > 1 ? `<button type="button" onclick="${removeCallback}(this)" class="btn-remove">×</button>` : ''}
    `;

  container.appendChild(timeDiv);
}

/**
 * Remove um horário de refeição
 * @param {HTMLElement} button - Botão que disparou a remoção
 * @param {string} containerId - ID do container
 * @param {Function} updateLabelsCallback - Callback para atualizar labels
 */
function removeMealTimeSlot(button, containerId, updateLabelsCallback) {
  const container = document.getElementById(containerId);
  if (container.children.length > 1) {
    button.parentElement.remove();
    updateLabelsCallback(containerId);
  }
}

/**
 * Atualiza a numeração das refeições
 * @param {string} containerId - ID do container
 */
function updateMealLabelsGeneric(containerId) {
  const container = document.getElementById(containerId);
  const slots = container.querySelectorAll('.time-slot');
  slots.forEach((slot, index) => {
    const label = slot.querySelector('label');
    if (label) {
      label.textContent = `Refeição ${index + 1}:`;
    }
  });
}

/**
 * Coleta dados de refeições
 * @param {string} containerId - ID do container
 * @param {string} inputClass - Classe dos inputs
 * @returns {Array} Array de horários
 */
function collectMealTimesGeneric(containerId, inputClass) {
  const container = document.getElementById(containerId);
  const times = Array.from(container.querySelectorAll(`.${inputClass}`))
    .map(input => input.value)
    .filter(time => time);

  if (times.length === 0) {
    throw new Error('Por favor, adicione pelo menos um horário de refeição!');
  }

  return times;
}

/**
 * Carrega dados de refeições
 * @param {string} containerId - ID do container
 * @param {Function} addCallback - Callback para adicionar slot
 */
function loadMealDataGeneric(containerId, addCallback) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  // Iniciar com pelo menos uma refeição
  addCallback();
}

/**
 * Toggle formulário de refeições
 * @param {string} detailsId - ID do elemento de detalhes
 * @param {string} containerId - ID do container
 * @param {boolean} show - Se deve mostrar ou não
 * @param {Function} addCallback - Callback para adicionar primeiro slot
 */
function toggleMealsFormGeneric(detailsId, containerId, show, addCallback) {
  const detailsElement = document.getElementById(detailsId);
  if (detailsElement) {
    detailsElement.style.display = show ? 'block' : 'none';

    if (show) {
      const container = document.getElementById(containerId);
      if (container && container.children.length === 0) {
        addCallback();
      }
    }
  }
}
