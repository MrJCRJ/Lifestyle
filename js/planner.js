// Funções específicas do planejador diário
let plannerJobCounter = 0;
let plannerStudyCounter = 0;

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

// Toggle estudo no planejador
function togglePlannerStudyForm(show) {
    document.getElementById('planner-study-details').style.display = show ? 'block' : 'none';
    if (show && document.querySelectorAll('#planner-studies-container .item-card').length === 0) {
        addPlannerStudySlot();
    }
}

// Adicionar estudo no planejador
function addPlannerStudySlot(studyData = null) {
    plannerStudyCounter++;
    const container = document.getElementById('planner-studies-container');
    const slotDiv = document.createElement('div');
    slotDiv.className = 'item-card';
    slotDiv.id = `planner-study-slot-${plannerStudyCounter}`;

    const isFirstItem = container.children.length === 0;
    slotDiv.innerHTML = createStudyCardHTML('planner-study', plannerStudyCounter, studyData, isFirstItem);

    container.appendChild(slotDiv);
}

// Adicionar horário de estudo no planejador
function addPlannerStudyTime(studyId) {
    addGenericTime('planner-study', studyId);
}

// Remover horário de estudo no planejador
function removePlannerStudyTime(studyId, timeIndex) {
    removeGenericTime('planner-study', studyId, timeIndex);
}

// Remover estudo no planejador
function removePlannerStudySlot(id) {
    removeItemSlot('planner-study', id);
}
