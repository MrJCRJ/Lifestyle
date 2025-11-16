// Gerenciamento de Hidratação

/**
 * NOTA: A partir da Fase 1, altura e peso são gerenciados no módulo settings/user-profile.js
 * - Altura: configurada uma vez em Settings
 * - Peso: histórico gerenciado em health/weight-tracker.js
 * - Meta de água: calculada automaticamente com base em altura, peso e nível de atividade
 */

// Calcular necessidade de água (DEPRECATED - usar calculateWaterNeeds de user-profile.js)
function calculateWaterNeeds(weight, height) {
    // Manter por compatibilidade, mas usar a função de user-profile se disponível
    if (typeof window.calculateWaterNeeds === 'function' && window.calculateWaterNeeds !== calculateWaterNeeds) {
        return window.calculateWaterNeeds(weight, height);
    }

    // Fallback (fórmula básica)
    const baseWater = weight * 35;
    const heightFactor = height > 170 ? 1.1 : 1.0;
    return Math.round(baseWater * heightFactor);
}

// Atualizar recomendação de água (DEPRECATED)
function updateWaterRecommendation() {
    console.warn('updateWaterRecommendation() está deprecated. Use updateWaterGoal() de user-profile.js');

    // Redirecionar para nova função se disponível
    if (typeof updateWaterGoal === 'function') {
        updateWaterGoal();
    }
}

// Carregar perfil do usuário (DEPRECATED)
function loadUserProfile() {
    console.warn('loadUserProfile() está deprecated. Use loadUserProfileData() de user-profile.js');

    // Redirecionar para nova função se disponível
    if (typeof loadUserProfileData === 'function') {
        loadUserProfileData();
    }
}

// Salvar hidratação do dia atual (DEPRECATED - agora hidratação não precisa salvar peso/altura)
function saveHydration() {
    console.warn('saveHydration() está deprecated. Configure altura e peso em Settings');

    // Verificar se altura está configurada
    const height = appState.userData.userProfile?.height;
    const currentWeight = getCurrentWeight ? getCurrentWeight() : null;

    if (!height || !currentWeight) {
        alert('⚠️ Por favor, configure sua altura e registre seu peso nas Configurações primeiro!');
        openSettings();
        return;
    }

    // Ir para exercícios
    showScreen('exercise');
}

// === Funções para o Planejador ===

// Atualizar recomendação de água no planejador (DEPRECATED)
function updatePlannerWaterRecommendation() {
    console.warn('updatePlannerWaterRecommendation() está deprecated');

    // Usar função nova se disponível
    if (typeof updateWaterGoal === 'function') {
        const waterNeeds = updateWaterGoal();

        const recDiv = document.getElementById('planner-water-recommendation');
        if (recDiv && waterNeeds) {
            const liters = (waterNeeds / 1000).toFixed(1);
            recDiv.innerHTML = `
                <div class="recommendation-box">
                    <strong>💧 Recomendação Diária:</strong>
                    <p>${waterNeeds}ml (${liters} litros) de água por dia</p>
                    <small>Calculada automaticamente com base no seu perfil</small>
                </div>
            `;
        }
    }
}

// Carregar perfil do usuário no planejador (DEPRECATED)
function loadPlannerUserProfile() {
    console.warn('loadPlannerUserProfile() está deprecated');

    // Apenas mostrar informações se disponíveis
    const height = appState.userData.userProfile?.height;
    const currentWeight = getCurrentWeight ? getCurrentWeight() : null;

    const recDiv = document.getElementById('planner-water-recommendation');
    if (recDiv) {
        if (height && currentWeight) {
            const waterNeeds = appState.userData.userProfile?.dailyWaterGoal;
            if (waterNeeds) {
                const liters = (waterNeeds / 1000).toFixed(1);
                recDiv.innerHTML = `
                    <div class="recommendation-box">
                        <strong>💧 Meta de Água:</strong>
                        <p>${waterNeeds}ml (${liters} litros) por dia</p>
                        <small>Altura: ${height}cm • Peso: ${currentWeight}kg</small>
                    </div>
                `;
            }
        } else {
            recDiv.innerHTML = `
                <div class="recommendation-box warning">
                    <strong>⚠️ Configuração Necessária</strong>
                    <p>Configure sua altura e registre seu peso nas Configurações para calcular a meta de água.</p>
                    <button onclick="openSettings()" class="btn btn-small">⚙️ Abrir Configurações</button>
                </div>
            `;
        }
    }
}

// Salvar hidratação no planejador
function savePlannerHydration() {
    // Verificar se altura está configurada
    const height = appState.userData.userProfile?.height;
    const currentWeight = getCurrentWeight ? getCurrentWeight() : null;

    if (!height) {
        alert('⚠️ Por favor, configure sua altura nas Configurações primeiro!');
        openSettings();
        return;
    }

    if (!currentWeight) {
        alert('⚠️ Por favor, registre seu peso nas Configurações primeiro!');
        openWeightRegistration();
        return;
    }

    // Meta de água já está calculada automaticamente
    const waterNeeds = appState.userData.userProfile?.dailyWaterGoal;

    if (!waterNeeds) {
        // Calcular se ainda não foi calculada
        if (typeof updateWaterGoal === 'function') {
            updateWaterGoal();
        }
    }

    if (!appState.tempPlanData) {
        appState.tempPlanData = {};
    }

    appState.tempPlanData.hydration = {
        weight: currentWeight,
        height: height,
        waterNeeds: appState.userData.userProfile?.dailyWaterGoal || calculateWaterNeeds(currentWeight, height)
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
