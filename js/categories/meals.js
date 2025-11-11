// Gerenciamento de Alimentação

// Toggle formulário de alimentação
function toggleMealsForm(show) {
    const detailsElement = document.getElementById('meals-details');
    if (detailsElement) {
        detailsElement.style.display = show ? 'block' : 'none';

        // Inicializar com pelo menos uma refeição se estiver mostrando e container vazio
        if (show) {
            const container = document.getElementById('meals-times-container');
            if (container && container.children.length === 0) {
                addMealTime();
            }
        }
    }
}

// Adicionar horário de refeição
function addMealTime() {
    const container = document.getElementById('meals-times-container');
    const mealCount = container.children.length + 1;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-slot';
    timeDiv.innerHTML = `
        <label>Refeição ${mealCount}:</label>
        <input type="time" class="meal-time" required />
        ${mealCount > 1 ? '<button type="button" onclick="removeMealTime(this)" class="btn-remove">×</button>' : ''}
    `;

    container.appendChild(timeDiv);
}

// Remover horário de refeição
function removeMealTime(button) {
    const container = document.getElementById('meals-times-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
        updateMealLabels();
    }
}

// Atualizar numeração das refeições
function updateMealLabels() {
    const container = document.getElementById('meals-times-container');
    const slots = container.querySelectorAll('.time-slot');
    slots.forEach((slot, index) => {
        const label = slot.querySelector('label');
        if (label) {
            label.textContent = `Refeição ${index + 1}:`;
        }
    });
}

// Coletar dados de refeições
function collectMealsData(containerId) {
    const container = document.getElementById(containerId);
    const times = Array.from(container.querySelectorAll('.meal-time'))
        .map(input => input.value)
        .filter(time => time);

    if (times.length === 0) {
        throw new Error('Por favor, adicione pelo menos um horário de refeição!');
    }

    return times;
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
    const container = document.getElementById('meals-times-container');
    container.innerHTML = '';

    // Iniciar com pelo menos uma refeição
    addMealTime();
}

// === Funções para o Planejador ===

// Toggle formulário de refeições do planejador
function togglePlannerMealsForm(show) {
    const detailsElement = document.getElementById('planner-meals-details');
    if (detailsElement) {
        detailsElement.style.display = show ? 'block' : 'none';

        // Inicializar com pelo menos uma refeição se estiver mostrando e container vazio
        if (show) {
            const container = document.getElementById('planner-meals-times-container');
            if (container && container.children.length === 0) {
                addPlannerMealTime();
            }
        }
    }
}

// Adicionar horário de refeição no planejador
function addPlannerMealTime() {
    const container = document.getElementById('planner-meals-times-container');
    const mealCount = container.children.length + 1;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-slot';
    timeDiv.innerHTML = `
        <label>Refeição ${mealCount}:</label>
        <input type="time" class="planner-meal-time" required />
        ${mealCount > 1 ? '<button type="button" onclick="removePlannerMealTime(this)" class="btn-remove">×</button>' : ''}
    `;

    container.appendChild(timeDiv);
}

// Remover horário de refeição no planejador
function removePlannerMealTime(button) {
    const container = document.getElementById('planner-meals-times-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
        updatePlannerMealLabels();
    }
}

// Atualizar numeração das refeições no planejador
function updatePlannerMealLabels() {
    const container = document.getElementById('planner-meals-times-container');
    const slots = container.querySelectorAll('.time-slot');
    slots.forEach((slot, index) => {
        const label = slot.querySelector('label');
        if (label) {
            label.textContent = `Refeição ${index + 1}:`;
        }
    });
}

// Coletar dados de refeições do planejador
function collectPlannerMealsData(containerId) {
    const container = document.getElementById(containerId);
    const times = Array.from(container.querySelectorAll('.planner-meal-time'))
        .map(input => input.value)
        .filter(time => time);

    if (times.length === 0) {
        throw new Error('Por favor, adicione pelo menos um horário de refeição!');
    }

    return times;
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
    const container = document.getElementById('planner-meals-times-container');
    container.innerHTML = '';

    // Iniciar com pelo menos uma refeição
    addPlannerMealTime();
}
