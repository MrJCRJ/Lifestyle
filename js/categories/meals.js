// Gerenciamento de Alimentação

// Toggle formulário de alimentação
function toggleMealsForm(show) {
    toggleMealsFormGeneric('meals-details', 'meals-times-container', show, addMealTime);
}

// Adicionar horário de refeição
function addMealTime() {
    addMealTimeSlot('meals-times-container', 'meal-time', 'removeMealTime');
}

// Remover horário de refeição
function removeMealTime(button) {
    removeMealTimeSlot(button, 'meals-times-container', updateMealLabels);
}

// Atualizar numeração das refeições
function updateMealLabels() {
    updateMealLabelsGeneric('meals-times-container');
}

// Coletar dados de refeições
function collectMealsData(containerId) {
    return collectMealTimesGeneric(containerId, 'meal-time');
}

// Salvar refeições do dia atual
function saveMeals() {
    const hasMeals = document.querySelector('input[name="hasMeals"]:checked');

    if (!hasMeals) {
        alert('Por favor, selecione se você faz refeições regulares!');
        return;
    }

    // Dados de refeições serão salvos no planData ao gerar o cronograma
    saveToStorage();

    // Ir para hidratação
    showScreen('hydration');
}

// Carregar dados de refeições
function loadMealsData() {
    loadMealDataGeneric('meals-times-container', addMealTime);
}

// === Funções para o Planejador ===

// Toggle formulário de refeições do planejador
function togglePlannerMealsForm(show) {
    toggleMealsFormGeneric('planner-meals-details', 'planner-meals-times-container', show, addPlannerMealTime);
}

// Adicionar horário de refeição no planejador
function addPlannerMealTime() {
    addMealTimeSlot('planner-meals-times-container', 'planner-meal-time', 'removePlannerMealTime');
}

// Remover horário de refeição no planejador
function removePlannerMealTime(button) {
    removeMealTimeSlot(button, 'planner-meals-times-container', updatePlannerMealLabels);
}

// Atualizar numeração das refeições no planejador
function updatePlannerMealLabels() {
    updateMealLabelsGeneric('planner-meals-times-container');
}

// Coletar dados de refeições do planejador
function collectPlannerMealsData(containerId) {
    return collectMealTimesGeneric(containerId, 'planner-meal-time');
}

// Salvar refeições no planejador
function savePlannerMeals() {
    const hasMeals = document.querySelector('input[name="plannerHasMeals"]:checked');

    if (!hasMeals) {
        alert('Por favor, selecione se você faz refeições regulares!');
        return;
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.meals = [];

    if (hasMeals.value === 'yes') {
        try {
            appState.tempPlanData.meals = collectPlannerMealsData('planner-meals-times-container');
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    // Ir para hidratação
    showScreen('planner-hydration');
}

// Carregar dados de refeições no planejador
function loadPlannerMealsData() {
    loadMealDataGeneric('planner-meals-times-container', addPlannerMealTime);
}
