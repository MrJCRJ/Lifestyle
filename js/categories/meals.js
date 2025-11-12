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

    // Salvar quantidade de refeições no userData
    if (!appState.userData.userProfile) {
        appState.userData.userProfile = {};
    }

    if (hasMeals.value === 'yes') {
        const mealsCount = parseInt(document.getElementById('mealsCount').value) || 3;
        appState.userData.userProfile.mealsCount = mealsCount;
    } else {
        appState.userData.userProfile.mealsCount = 0;
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
    }
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
        const mealsCount = parseInt(document.getElementById('plannerMealsCount').value) || 3;
        appState.tempPlanData.mealsCount = mealsCount;
    } else {
        appState.tempPlanData.mealsCount = 0;
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
    }
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        savePlannerMeals
    };
}
