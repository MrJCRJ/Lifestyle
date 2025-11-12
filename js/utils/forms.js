// Funções genéricas reutilizáveis para formulários
let genericJobCounter = 0;
let genericStudyCounter = 0;

// Criar HTML de slot de tempo genérico
function createGenericTimeSlotHTML(prefix, itemId, timeIndex, timeData = { start: '', end: '' }) {
    return `
        <div class="time-slot" id="${prefix}-time-${itemId}-${timeIndex}">
            <div class="time-slot-header">
                <strong>Horário ${timeIndex + 1}</strong>
                ${timeIndex > 0 ? `<button class="remove-btn" onclick="removeGenericTime('${prefix}', ${itemId}, ${timeIndex})">Remover</button>` : ''}
            </div>
            <div class="time-inputs">
                <div class="form-group">
                    <label>Início:</label>
                    <input type="time" id="${prefix}-start-${itemId}-${timeIndex}" value="${timeData.start}">
                </div>
                <div class="form-group">
                    <label>Fim:</label>
                    <input type="time" id="${prefix}-end-${itemId}-${timeIndex}" value="${timeData.end}">
                </div>
            </div>
        </div>
    `;
}

// Remover horário genérico
function removeGenericTime(prefix, itemId, timeIndex) {
    const timeSlot = document.getElementById(`${prefix}-time-${itemId}-${timeIndex}`);
    if (timeSlot) {
        timeSlot.remove();
    }
}

// Criar HTML de trabalho genérico
function createJobCardHTML(prefix, slotId, jobData = null, isFirstItem = true) {
    const name = jobData?.name || '';
    const times = jobData?.times || [{ start: '', end: '' }];

    return `
        <div class="item-header">
            <h4>Trabalho</h4>
            ${!isFirstItem ? `<button class="remove-btn" onclick="removeItemSlot('${prefix}', ${slotId})">Remover</button>` : ''}
        </div>
        
        <div class="form-group">
            <label>Nome do trabalho:</label>
            <input type="text" id="${prefix}-name-${slotId}" value="${name}" placeholder="Ex: Desenvolvedor, Garçom...">
        </div>
        
        <div id="${prefix}-times-${slotId}">
            ${times.map((time, index) => createGenericTimeSlotHTML(prefix, slotId, index, time)).join('')}
        </div>
        
        <button onclick="addGenericTime('${prefix}', ${slotId})" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">
            + Adicionar outro horário
        </button>
    `;
}

// Criar HTML de estudo genérico
function createStudyCardHTML(prefix, slotId, studyData = null, isFirstItem = true) {
    const name = studyData?.name || '';
    const times = studyData?.times || [{ start: '', end: '' }];

    return `
        <div class="item-header">
            <h4>Estudo</h4>
            ${!isFirstItem ? `<button class="remove-btn" onclick="removeItemSlot('${prefix}', ${slotId})">Remover</button>` : ''}
        </div>
        
        <div class="form-group">
            <label>Nome do curso/estudo:</label>
            <input type="text" id="${prefix}-name-${slotId}" value="${name}" placeholder="Ex: Engenharia, Inglês, Programação...">
        </div>
        
        <div id="${prefix}-times-${slotId}">
            ${times.map((time, index) => createGenericTimeSlotHTML(prefix, slotId, index, time)).join('')}
        </div>
        
        <button onclick="addGenericTime('${prefix}', ${slotId})" class="btn btn-secondary" style="margin-top: 10px; width: 100%;">
            + Adicionar outro horário
        </button>
    `;
}

// Adicionar horário genérico
function addGenericTime(prefix, itemId) {
    const container = document.getElementById(`${prefix}-times-${itemId}`);
    const timeIndex = container.children.length;

    const timeSlot = document.createElement('div');
    timeSlot.innerHTML = createGenericTimeSlotHTML(prefix, itemId, timeIndex);
    container.appendChild(timeSlot.firstElementChild);
}

// Remover item genérico (trabalho ou estudo)
function removeItemSlot(prefix, slotId) {
    const itemSlot = document.getElementById(`${prefix}-slot-${slotId}`);
    if (itemSlot) {
        itemSlot.remove();
    }
}

// NOTA: As funções collectJobsData e collectStudiesData foram movidas para
// category-manager.js para evitar duplicação e conflitos de sobrescrita
