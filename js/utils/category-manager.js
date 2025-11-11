// Gerenciamento unificado de categorias (trabalho, estudo, etc)

/**
 * Cria HTML para um card de categoria com times
 * @param {string} type - Tipo da categoria ('job' ou 'study')
 * @param {number} id - ID do slot
 * @param {Object} data - Dados opcionais para preencher o card
 * @param {boolean} isFirst - Se é o primeiro item (não pode ser removido)
 * @returns {string} HTML do card
 */
function createCategoryCardHTML(type, id, data = null, isFirst = false) {
  const typeConfig = {
    job: { label: 'Trabalho', namePlaceholder: 'Nome do trabalho' },
    study: { label: 'Estudo', namePlaceholder: 'Disciplina/Curso' }
  };

  const config = typeConfig[type];
  const itemName = data?.name || '';
  const times = data?.times || [{ start: '', end: '' }];

  let timesHTML = times.map((time, index) => `
        <div class="time-input-group">
            <input type="time" 
                   class="${type}-time-start" 
                   value="${time.start}" 
                   required />
            <span>até</span>
            <input type="time" 
                   class="${type}-time-end" 
                   value="${time.end}" 
                   required />
            ${index > 0 ? `<button type="button" onclick="remove${capitalize(type)}Time(${id}, ${index})" class="btn-remove">×</button>` : ''}
        </div>
    `).join('');

  return `
        <div class="item-header">
            <input type="text" 
                   class="${type}-name" 
                   placeholder="${config.namePlaceholder}" 
                   value="${itemName}" 
                   required />
            ${!isFirst ? `<button type="button" onclick="remove${capitalize(type)}Slot(${id})" class="btn-remove">×</button>` : ''}
        </div>
        <div class="times-container" id="${type}-times-${id}">
            ${timesHTML}
        </div>
        <button type="button" onclick="add${capitalize(type)}Time(${id})" class="btn-secondary btn-small">
            + Adicionar Horário
        </button>
    `;
}

/**
 * Adiciona um novo horário a uma categoria
 * @param {string} type - Tipo da categoria
 * @param {number} id - ID do slot
 */
function addCategoryTime(type, id) {
  const container = document.getElementById(`${type}-times-${id}`);
  if (!container) return;

  const timeIndex = container.children.length;
  const timeDiv = document.createElement('div');
  timeDiv.className = 'time-input-group';
  timeDiv.innerHTML = `
        <input type="time" class="${type}-time-start" required />
        <span>até</span>
        <input type="time" class="${type}-time-end" required />
        <button type="button" onclick="remove${capitalize(type)}Time(${id}, ${timeIndex})" class="btn-remove">×</button>
    `;

  container.appendChild(timeDiv);
}

/**
 * Remove um horário de uma categoria
 * @param {string} type - Tipo da categoria
 * @param {number} id - ID do slot
 * @param {number} timeIndex - Índice do horário a remover
 */
function removeCategoryTime(type, id, timeIndex) {
  const container = document.getElementById(`${type}-times-${id}`);
  if (!container || container.children.length <= 1) return;

  const timeGroups = container.querySelectorAll('.time-input-group');
  if (timeGroups[timeIndex]) {
    timeGroups[timeIndex].remove();
  }
}

/**
 * Remove um slot completo de categoria
 * @param {string} type - Tipo da categoria
 * @param {number} id - ID do slot a remover
 */
function removeCategorySlot(type, id) {
  const slot = document.getElementById(`${type}-slot-${id}`);
  if (slot) {
    const container = slot.parentElement;
    slot.remove();

    // Se não sobrou nenhum slot, adicionar um novo vazio
    if (container.children.length === 0) {
      if (type === 'job') {
        addJobSlot();
      } else if (type === 'study') {
        addStudySlot();
      }
    }
  }
}

/**
 * Coleta dados de categorias do DOM
 * @param {string} containerId - ID do container
 * @param {string} slotPrefix - Prefixo dos slots (ex: 'job', 'study')
 * @returns {Array} Array com os dados coletados
 */
function collectCategoryData(containerId, slotPrefix) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} não encontrado!`);
  }

  const items = [];
  const slots = container.querySelectorAll('.item-card');

  slots.forEach(slot => {
    const nameInput = slot.querySelector(`.${slotPrefix}-name`);
    const name = nameInput?.value.trim();

    if (!name) {
      throw new Error('Por favor, preencha o nome de todos os itens!');
    }

    const timeGroups = slot.querySelectorAll('.time-input-group');
    const times = [];

    timeGroups.forEach(group => {
      const startInput = group.querySelector(`.${slotPrefix}-time-start`);
      const endInput = group.querySelector(`.${slotPrefix}-time-end`);

      const start = startInput?.value;
      const end = endInput?.value;

      if (!start || !end) {
        throw new Error(`Preencha todos os horários de ${name}!`);
      }

      times.push({ start, end });
    });

    if (times.length === 0) {
      throw new Error(`Adicione pelo menos um horário para ${name}!`);
    }

    items.push({ name, times });
  });

  return items;
}

/**
 * Wrappers para compatibilidade com código existente
 */
function collectJobsData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, 'job');
}

function collectStudiesData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, 'study');
}

/**
 * Capitaliza primeira letra
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizada
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Toggle exibição de formulário de categoria
 * @param {string} type - Tipo da categoria
 * @param {boolean} show - Se deve mostrar ou ocultar
 */
function toggleCategoryForm(type, show) {
  const detailsId = `${type}-details`;
  const containerId = `${type}s-container`;

  const detailsElement = document.getElementById(detailsId);
  if (detailsElement) {
    detailsElement.style.display = show ? 'block' : 'none';
  }

  if (show) {
    const container = document.getElementById(containerId);
    if (container && container.children.length === 0) {
      // Adicionar primeiro slot
      if (type === 'job') {
        addJobSlot();
      } else if (type === 'study') {
        addStudySlot();
      }
    }
  }
}
