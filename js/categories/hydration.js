// Gerenciamento de Hidratação

// Calcular necessidade de água baseado em peso e altura
function calculateWaterNeeds(weight, height) {
    // Fórmula básica: 35ml por kg de peso corporal
    const baseWater = weight * 35;

    // Ajuste por altura (pessoas mais altas tendem a precisar um pouco mais)
    const heightFactor = height > 170 ? 1.1 : 1.0;

    return Math.round(baseWater * heightFactor);
}

// Atualizar recomendação de água
function updateWaterRecommendation() {
    const weight = parseFloat(document.getElementById('userWeight').value);
    const height = parseFloat(document.getElementById('userHeight').value);

    if (weight && height && weight > 0 && height > 0) {
        const waterNeeded = calculateWaterNeeds(weight, height);
        const liters = (waterNeeded / 1000).toFixed(1);

        document.getElementById('water-recommendation').innerHTML = `
            <div class="recommendation-box">
                <strong>💧 Recomendação Diária:</strong>
                <p>${waterNeeded}ml (${liters} litros) de água por dia</p>
                <small>Baseado em 35ml por kg de peso corporal</small>
            </div>
        `;

        // Salvar dados do usuário
        if (!appState.userData.userProfile) {
            appState.userData.userProfile = {};
        }
        appState.userData.userProfile.weight = weight;
        appState.userData.userProfile.height = height;
        appState.userData.userProfile.waterNeeds = waterNeeded;
        saveToStorage();
    }
}

// Carregar perfil do usuário
function loadUserProfile() {
    const profile = appState.userData.userProfile;

    if (profile) {
        const weightInput = document.getElementById('userWeight');
        const heightInput = document.getElementById('userHeight');

        if (weightInput && profile.weight) weightInput.value = profile.weight;
        if (heightInput && profile.height) heightInput.value = profile.height;

        if (profile.weight && profile.height) {
            updateWaterRecommendation();
        }
    }
}

// Salvar hidratação do dia atual
function saveHydration() {
    const weight = parseFloat(document.getElementById('userWeight').value);
    const height = parseFloat(document.getElementById('userHeight').value);

    if (!weight || !height || weight <= 0 || height <= 0) {
        alert('Por favor, preencha seu peso e altura corretamente!');
        return;
    }

    // Calcular e salvar necessidade de água
    const waterNeeds = calculateWaterNeeds(weight, height);

    if (!appState.userData.userProfile) {
        appState.userData.userProfile = {};
    }
    appState.userData.userProfile.weight = weight;
    appState.userData.userProfile.height = height;
    appState.userData.userProfile.waterNeeds = waterNeeds;

    saveToStorage();

    // Ir para exercícios
    showScreen('exercise');
}

// === Funções para o Planejador ===

// Atualizar recomendação de água no planejador
function updatePlannerWaterRecommendation() {
    const weight = parseFloat(document.getElementById('plannerUserWeight').value);
    const height = parseFloat(document.getElementById('plannerUserHeight').value);

    if (weight && height && weight > 0 && height > 0) {
        const waterNeeded = calculateWaterNeeds(weight, height);
        const liters = (waterNeeded / 1000).toFixed(1);

        document.getElementById('planner-water-recommendation').innerHTML = `
            <div class="recommendation-box">
                <strong>💧 Recomendação Diária:</strong>
                <p>${waterNeeded}ml (${liters} litros) de água por dia</p>
                <small>Baseado em 35ml por kg de peso corporal</small>
            </div>
        `;

        // Salvar dados do usuário
        if (!appState.userData.userProfile) {
            appState.userData.userProfile = {};
        }
        appState.userData.userProfile.weight = weight;
        appState.userData.userProfile.height = height;
        appState.userData.userProfile.waterNeeds = waterNeeded;
        saveToStorage();
    }
}

// Carregar perfil do usuário no planejador
function loadPlannerUserProfile() {
    const profile = appState.userData.userProfile;

    if (profile) {
        const weightInput = document.getElementById('plannerUserWeight');
        const heightInput = document.getElementById('plannerUserHeight');

        if (weightInput && profile.weight) weightInput.value = profile.weight;
        if (heightInput && profile.height) heightInput.value = profile.height;

        if (profile.weight && profile.height) {
            updatePlannerWaterRecommendation();
        }
    }
}

// Salvar hidratação no planejador
function savePlannerHydration() {
    const weight = parseFloat(document.getElementById('plannerUserWeight').value);
    const height = parseFloat(document.getElementById('plannerUserHeight').value);

    if (!weight || !height || weight <= 0 || height <= 0) {
        alert('Por favor, preencha seu peso e altura corretamente!');
        return;
    }

    // Calcular e salvar necessidade de água
    const waterNeeds = calculateWaterNeeds(weight, height);

    if (!appState.userData.userProfile) {
        appState.userData.userProfile = {};
    }
    appState.userData.userProfile.weight = weight;
    appState.userData.userProfile.height = height;
    appState.userData.userProfile.waterNeeds = waterNeeds;

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }
    appState.tempPlanData.hydration = {
        weight: weight,
        height: height,
        waterNeeds: waterNeeds
    };

    saveToStorage();

    alert('✅ Hidratação salva!');

    // Voltar para tela de edição e atualizar status
    showScreen('planner-edit');
    if (typeof updateEditPlannerStatus === 'function') {
        updateEditPlannerStatus();
    }
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        savePlannerHydration
    };
}
