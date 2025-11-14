// Gerenciamento de Alimentação

// Toggle formulário de alimentação
function toggleMealsForm(show) {
    const mealsDetails = document.getElementById('meals-details');
    if (mealsDetails) {
        mealsDetails.style.display = show ? 'block' : 'none';
    }
}

// Salvar refeições do dia atual
function saveMeals() {
    const hasMeals = document.querySelector('input[name="hasMeals"]:checked');

    if (!hasMeals) {
        alert('Por favor, selecione se você faz refeições regulares!');
        return;
    }

    if (hasMeals.value === 'yes') {
        // Salvar configuração de refeições
        saveMealsConfig();
    } else {
        if (!appState.userData.userProfile) {
            appState.userData.userProfile = {};
        }
        appState.userData.userProfile.mealsCount = 0;
        appState.userData.userProfile.mealsConfig = [];
    }

    saveToStorage();

    // Ir para hidratação
    showScreen('hydration');
}

// Carregar dados de refeições
function loadMealsData() {
    const mealsCount = appState.userData.userProfile?.mealsCount;
    if (mealsCount && mealsCount > 0) {
        document.getElementById('mealsCount').value = mealsCount;
        updateMealsList();
    }
}

// Atualizar lista de refeições configuráveis
function updateMealsList() {
    const container = document.getElementById('meals-list-container');
    if (!container) return;

    const count = parseInt(document.getElementById('mealsCount').value) || 3;

    // Obter refeições salvas
    const savedMeals = appState.userData.userProfile?.mealsConfig || [];

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const meal = savedMeals[i] || { name: '', description: '' };

        const mealCard = document.createElement('div');
        mealCard.className = 'meal-config-card';
        mealCard.innerHTML = `
            <div class="meal-config-header">
                <span class="meal-number">🍽️ Refeição ${i + 1}</span>
            </div>
            <div class="meal-config-inputs">
                <div class="input-group-inline">
                    <input 
                        type="text" 
                        class="meal-name-input" 
                        data-index="${i}"
                        placeholder="Ex: Café da Manhã, Almoço..." 
                        value="${meal.name || ''}"
                        maxlength="50"
                    />
                </div>
                <div class="input-group-inline">
                    <textarea 
                        class="meal-description-input" 
                        data-index="${i}"
                        placeholder="Ex: Aveia com frutas, Frango..." 
                        rows="2"
                        maxlength="150"
                    >${meal.description || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(mealCard);
    }
}

// Salvar configuração de refeições
function saveMealsConfig() {
    const mealsCount = parseInt(document.getElementById('mealsCount').value) || 3;
    const mealsConfig = [];

    for (let i = 0; i < mealsCount; i++) {
        const nameInput = document.querySelector(`.meal-name-input[data-index="${i}"]`);
        const descInput = document.querySelector(`.meal-description-input[data-index="${i}"]`);

        mealsConfig.push({
            name: nameInput?.value.trim() || '',
            description: descInput?.value.trim() || ''
        });
    }

    if (!appState.userData.userProfile) {
        appState.userData.userProfile = {};
    }

    appState.userData.userProfile.mealsConfig = mealsConfig;
    appState.userData.userProfile.mealsCount = mealsCount;
}

// === Funções para o Planejador ===

// Toggle formulário de refeições do planejador
function togglePlannerMealsForm(show) {
    const mealsDetails = document.getElementById('planner-meals-details');
    if (mealsDetails) {
        mealsDetails.style.display = show ? 'block' : 'none';
    }
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

    if (hasMeals.value === 'yes') {
        // Salvar configuração de refeições
        savePlannerMealsConfig();
    } else {
        appState.tempPlanData.mealsCount = 0;
        appState.tempPlanData.mealsConfig = [];
    }

    // Salvar automaticamente
    saveToStorage();

    alert('✅ Refeições salvas!');

    // Voltar para tela de edição e atualizar status
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
        updateEditPlannerStatus();
    }
}

// Carregar dados de refeições no planejador
function loadPlannerMealsData() {
    const mealsCount = appState.tempPlanData?.mealsCount || appState.userData.userProfile?.mealsCount;
    if (mealsCount && mealsCount > 0) {
        document.getElementById('plannerMealsCount').value = mealsCount;
        updatePlannerMealsList();
    }
}

// Atualizar lista de refeições no planejador
function updatePlannerMealsList() {
    const container = document.getElementById('planner-meals-list-container');
    if (!container) return;

    const count = parseInt(document.getElementById('plannerMealsCount').value) || 3;

    // Obter refeições salvas (do tempPlanData ou do perfil)
    const savedMeals = appState.tempPlanData?.mealsConfig || appState.userData.userProfile?.mealsConfig || [];

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const meal = savedMeals[i] || { name: '', description: '' };

        const mealCard = document.createElement('div');
        mealCard.className = 'meal-config-card';
        mealCard.innerHTML = `
            <div class="meal-config-header">
                <span class="meal-number">🍽️ Refeição ${i + 1}</span>
            </div>
            <div class="meal-config-inputs">
                <div class="input-group-inline">
                    <input 
                        type="text" 
                        class="planner-meal-name-input" 
                        data-index="${i}"
                        placeholder="Ex: Café da Manhã, Almoço..." 
                        value="${meal.name || ''}"
                        maxlength="50"
                    />
                </div>
                <div class="input-group-inline">
                    <textarea 
                        class="planner-meal-description-input" 
                        data-index="${i}"
                        placeholder="Ex: Aveia com frutas, Frango..." 
                        rows="2"
                        maxlength="150"
                    >${meal.description || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(mealCard);
    }
}

// Salvar configuração de refeições no planejador
function savePlannerMealsConfig() {
    const mealsCount = parseInt(document.getElementById('plannerMealsCount').value) || 3;
    const mealsConfig = [];

    for (let i = 0; i < mealsCount; i++) {
        const nameInput = document.querySelector(`.planner-meal-name-input[data-index="${i}"]`);
        const descInput = document.querySelector(`.planner-meal-description-input[data-index="${i}"]`);

        mealsConfig.push({
            name: nameInput?.value.trim() || '',
            description: descInput?.value.trim() || ''
        });
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }

    appState.tempPlanData.mealsConfig = mealsConfig;
    appState.tempPlanData.mealsCount = mealsCount;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        savePlannerMeals
    };
}
