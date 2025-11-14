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
    study: { label: 'Estudo', namePlaceholder: 'Disciplina/Curso' },
    project: { label: 'Projeto', namePlaceholder: 'Nome do projeto' },
    hobby: { label: 'Hobby & Lazer', namePlaceholder: 'Atividade de lazer' }
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
      } else if (type === 'project') {
        addProjectSlot();
      } else if (type === 'hobby') {
        addHobbySlot();
      }
    }
  }
}

/**
 * Coleta dados de categorias do DOM
 * @param {string} containerId - ID do container
 * @param {string} slotPrefix - Prefixo dos slots (ex: 'job', 'study', 'planner-job', 'planner-study')
 * @returns {Array} Array com os dados coletados
 */
function collectCategoryData(containerId, slotPrefix) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} não encontrado!`);
  }

  const items = [];
  const slots = container.querySelectorAll('.item-card');

  if (slots.length === 0) {
    throw new Error(`Nenhum item encontrado em ${containerId}!`);
  }

  slots.forEach(slot => {
    const slotId = slot.id.split('-').pop();
    let nameInput = null;
    let name = '';

    // Tentar buscar por ID primeiro (usado no planejador: planner-job-name-1)
    if (slotPrefix.includes('planner-')) {
      nameInput = document.getElementById(`${slotPrefix}-name-${slotId}`);
    }

    // Se não encontrou por ID, buscar por classe (usado no setup: .job-name)
    if (!nameInput) {
      const classPrefix = slotPrefix.replace('planner-', '');
      nameInput = slot.querySelector(`.${classPrefix}-name`);
    }

    if (!nameInput) {
      console.error(`Slot problemático:`, slot);
      console.error(`Tentou buscar por ID: ${slotPrefix}-name-${slotId}`);
      console.error(`Tentou buscar por classe: .${slotPrefix.replace('planner-', '')}-name`);
      throw new Error(`Input de nome não encontrado no slot!`);
    }

    name = nameInput.value.trim();

    if (!name) {
      throw new Error('Por favor, preencha o nome de todos os itens!');
    }

    // Buscar horários - tentar ambas as estruturas
    const times = [];

    // Estrutura do planejador: .time-slot com IDs
    const timeSlots = slot.querySelectorAll('.time-slot');
    if (timeSlots.length > 0) {
      timeSlots.forEach(timeSlot => {
        const timeIndex = timeSlot.id ? timeSlot.id.split('-').pop() : null;

        let startInput, endInput;

        if (timeIndex !== null) {
          // Buscar por ID (planejador)
          startInput = document.getElementById(`${slotPrefix}-start-${slotId}-${timeIndex}`);
          endInput = document.getElementById(`${slotPrefix}-end-${slotId}-${timeIndex}`);
        }

        // Se não encontrou por ID, buscar dentro do timeSlot
        if (!startInput) {
          startInput = timeSlot.querySelector('input[type="time"]');
          endInput = timeSlot.querySelectorAll('input[type="time"]')[1];
        }

        if (!startInput || !endInput) {
          console.error(`TimeSlot problemático:`, timeSlot);
          throw new Error(`Inputs de horário não encontrados para ${name}!`);
        }

        const start = startInput.value;
        const end = endInput.value;

        if (!start || !end) {
          throw new Error(`Preencha todos os horários de ${name}!`);
        }

        times.push({ start, end });
      });
    } else {
      // Estrutura do setup: .time-input-group com classes
      const timeGroups = slot.querySelectorAll('.time-input-group');

      if (timeGroups.length === 0) {
        console.error(`Slot sem horários:`, slot);
        throw new Error(`Nenhum horário encontrado para ${name}!`);
      }

      timeGroups.forEach(group => {
        const classPrefix = slotPrefix.replace('planner-', '');
        const startInput = group.querySelector(`.${classPrefix}-time-start`);
        const endInput = group.querySelector(`.${classPrefix}-time-end`);

        if (!startInput || !endInput) {
          console.error(`TimeGroup problemático:`, group);
          throw new Error(`Inputs de horário não encontrados para ${name}!`);
        }

        const start = startInput.value;
        const end = endInput.value;

        if (!start || !end) {
          throw new Error(`Preencha todos os horários de ${name}!`);
        }

        times.push({ start, end });
      });
    }

    items.push({ name, times });
  });

  return items;
}

/**
 * Wrappers para compatibilidade com código existente
 */
function collectJobsData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, itemPrefix || 'job');
}

function collectStudiesData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, itemPrefix || 'study');
}

function collectProjectsData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, itemPrefix || 'project');
}

function collectHobbiesData(containerName, itemPrefix) {
  return collectCategoryData(`${containerName}-container`, itemPrefix || 'hobby');
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
      } else if (type === 'project') {
        addProjectSlot();
      } else if (type === 'hobby') {
        addHobbySlot();
      }
    }
  }
}
