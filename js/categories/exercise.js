// Gerenciamento de Exercícios

// Toggle formulário de exercício
function toggleExerciseForm(show) {
    const detailsElement = document.getElementById('exercise-details');
    if (detailsElement) {
        detailsElement.style.display = show ? 'block' : 'none';
    }
}

// Salvar exercício do dia atual
function saveExercise() {
    const hasExercise = document.querySelector('input[name="hasExercise"]:checked');

    if (!hasExercise) {
        alert('Por favor, selecione se você faz exercícios!');
        return;
    }

    let exercise = null;

    if (hasExercise.value === 'yes') {
        const exerciseStart = document.getElementById('exerciseStartTime').value;
        const exerciseEnd = document.getElementById('exerciseEndTime').value;
        const exerciseType = document.getElementById('exerciseType').value;

        if (!exerciseStart || !exerciseEnd) {
            alert('Por favor, preencha os horários de exercício!');
            return;
        }

        exercise = {
            start: exerciseStart,
            end: exerciseEnd,
            type: exerciseType || 'Exercício'
        };
    }

    // Dados de exercício serão salvos no planData ao gerar o cronograma
    saveToStorage();

    // Gerar cronograma e ir para tela de cronogramas
    generateTodaySchedule();
    goToSchedules();
}

// Carregar dados de exercício
function loadExerciseData() {
    // Inicializar campos vazios
    const exerciseStart = document.getElementById('exerciseStartTime');
    const exerciseEnd = document.getElementById('exerciseEndTime');
    const exerciseType = document.getElementById('exerciseType');

    if (exerciseStart) exerciseStart.value = '';
    if (exerciseEnd) exerciseEnd.value = '';
    if (exerciseType) exerciseType.value = '';
}

// === Funções para o Planejador ===

// Toggle formulário de exercício do planejador
function togglePlannerExerciseForm(show) {
    const detailsElement = document.getElementById('planner-exercise-details');
    if (detailsElement) {
        detailsElement.style.display = show ? 'block' : 'none';
    }
}

// Salvar exercício no planejador
function savePlannerExercise() {
    const hasExercise = document.querySelector('input[name="plannerHasExercise"]:checked');

    if (!hasExercise) {
        alert('Por favor, selecione se você faz exercícios!');
        return;
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.exercise = null;

    if (hasExercise.value === 'yes') {
        const exerciseStart = document.getElementById('plannerExerciseStartTime').value;
        const exerciseEnd = document.getElementById('plannerExerciseEndTime').value;
        const exerciseType = document.getElementById('plannerExerciseType').value;

        if (!exerciseStart || !exerciseEnd) {
            alert('Por favor, preencha os horários de exercício!');
            return;
        }

        appState.tempPlanData.exercise = {
            start: exerciseStart,
            end: exerciseEnd,
            type: exerciseType || 'Exercício'
        };
    }

    // Salvar automaticamente
    saveToStorage();

    alert('✅ Exercício salvo!');

    // Voltar para tela de edição e atualizar status
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
        updateEditPlannerStatus();
    }
}

// Voltar no wizard do planejador (de exercício para hidratação)
function prevPlannerExerciseStep() {
    showScreen('planner-hydration');
}

// Carregar dados de exercício no planejador
function loadPlannerExerciseData() {
    // Inicializar campos vazios
    const exerciseStart = document.getElementById('plannerExerciseStartTime');
    const exerciseEnd = document.getElementById('plannerExerciseEndTime');
    const exerciseType = document.getElementById('plannerExerciseType');

    if (exerciseStart) exerciseStart.value = '';
    if (exerciseEnd) exerciseEnd.value = '';
    if (exerciseType) exerciseType.value = '';
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        savePlannerExercise
    };
}
