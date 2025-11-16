// Gerenciamento de Perfil do Usuário e Configurações Gerais

/**
 * Estrutura do perfil:
 * {
 *   height: 175,              // cm - configurado uma vez
 *   gender: 'male',           // 'male', 'female', 'other'
 *   birthDate: '1990-01-15',  // para cálculos por idade
 *   activityLevel: 'moderate',// 'sedentary', 'light', 'moderate', 'active', 'very_active'
 *   dailyWaterGoal: 2450,     // ml - calculado automaticamente
 *   weightGoal: 70            // kg - meta de peso
 * }
 */

// Inicializar perfil se não existir
function initializeUserProfile() {
  if (!appState.userData.userProfile) {
    appState.userData.userProfile = {
      height: null,
      gender: null,
      birthDate: null,
      activityLevel: 'moderate',
      dailyWaterGoal: null,
      weightGoal: null
    };
  }

  // Migrar dados antigos se existirem
  if (appState.userData.userProfile.weight) {
    // Peso agora vai para o histórico
    migrateWeightToHistory();
  }
}

// Migrar peso antigo para o novo sistema de histórico
function migrateWeightToHistory() {
  const oldWeight = appState.userData.userProfile.weight;

  if (oldWeight && (!appState.userData.weightHistory || appState.userData.weightHistory.length === 0)) {
    if (!appState.userData.weightHistory) {
      appState.userData.weightHistory = [];
    }

    const today = new Date().toISOString().split('T')[0];
    const height = appState.userData.userProfile.height || 170;
    const bmi = calculateBMI(oldWeight, height);

    appState.userData.weightHistory.push({
      id: `weight_${Date.now()}`,
      date: today,
      weight: oldWeight,
      bmi: bmi,
      registeredAt: new Date().toISOString(),
      note: 'Migrado do sistema antigo'
    });

    // Remover peso antigo do perfil
    delete appState.userData.userProfile.weight;

    saveToStorage();
    console.log('✅ Peso migrado para o histórico');
  }
}

// Calcular necessidade de água baseado em peso e altura
function calculateWaterNeeds(weight, height) {
  if (!weight || !height) return null;

  // Fórmula básica: 35ml por kg de peso corporal
  const baseWater = weight * 35;

  // Ajuste por altura (pessoas mais altas tendem a precisar um pouco mais)
  const heightFactor = height > 170 ? 1.1 : 1.0;

  // Ajuste por nível de atividade
  const activityLevel = appState.userData.userProfile?.activityLevel || 'moderate';
  const activityFactors = {
    'sedentary': 1.0,
    'light': 1.1,
    'moderate': 1.2,
    'active': 1.3,
    'very_active': 1.4
  };
  const activityFactor = activityFactors[activityLevel] || 1.0;

  return Math.round(baseWater * heightFactor * activityFactor);
}

// Atualizar meta de água automaticamente
function updateWaterGoal() {
  const height = appState.userData.userProfile?.height;
  const currentWeight = getCurrentWeight();

  if (height && currentWeight) {
    const waterNeeds = calculateWaterNeeds(currentWeight, height);
    appState.userData.userProfile.dailyWaterGoal = waterNeeds;
    saveToStorage();
    return waterNeeds;
  }

  return null;
}

// Obter peso mais recente do histórico
function getCurrentWeight() {
  const history = appState.userData.weightHistory;

  if (!history || history.length === 0) {
    return null;
  }

  // Ordenar por data decrescente e pegar o mais recente
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted[0].weight;
}

// Calcular IMC
function calculateBMI(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // Uma casa decimal
}

// Obter classificação do IMC
function getBMIClassification(bmi) {
  if (!bmi) return 'Não calculado';

  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

// Salvar configurações do perfil
function saveUserProfile(profileData) {
  if (!appState.userData.userProfile) {
    initializeUserProfile();
  }

  // Atualizar campos
  if (profileData.height !== undefined) {
    appState.userData.userProfile.height = parseFloat(profileData.height);
  }
  if (profileData.gender !== undefined) {
    appState.userData.userProfile.gender = profileData.gender;
  }
  if (profileData.birthDate !== undefined) {
    appState.userData.userProfile.birthDate = profileData.birthDate;
  }
  if (profileData.activityLevel !== undefined) {
    appState.userData.userProfile.activityLevel = profileData.activityLevel;
  }
  if (profileData.weightGoal !== undefined) {
    appState.userData.userProfile.weightGoal = parseFloat(profileData.weightGoal) || null;
  }

  // Recalcular meta de água se altura mudou
  if (profileData.height !== undefined || profileData.activityLevel !== undefined) {
    updateWaterGoal();
  }

  saveToStorage();
  return true;
}

// Carregar dados do perfil na interface
function loadUserProfileData() {
  initializeUserProfile();

  const profile = appState.userData.userProfile;

  // Preencher campos se existirem
  const heightInput = document.getElementById('profile-height');
  const genderInputs = document.querySelectorAll('input[name="profile-gender"]');
  const birthDateInput = document.getElementById('profile-birthdate');
  const activityLevelSelect = document.getElementById('profile-activity-level');
  const weightGoalInput = document.getElementById('profile-weight-goal');

  if (heightInput && profile.height) {
    heightInput.value = profile.height;
  }

  if (genderInputs && profile.gender) {
    genderInputs.forEach(input => {
      if (input.value === profile.gender) {
        input.checked = true;
      }
    });
  }

  if (birthDateInput && profile.birthDate) {
    birthDateInput.value = profile.birthDate;
  }

  if (activityLevelSelect && profile.activityLevel) {
    activityLevelSelect.value = profile.activityLevel;
  }

  if (weightGoalInput && profile.weightGoal) {
    weightGoalInput.value = profile.weightGoal;
  }

  // Atualizar informações calculadas
  updateProfileInfo();
}

// Atualizar informações calculadas (peso atual, IMC, meta de água)
function updateProfileInfo() {
  const profile = appState.userData.userProfile;
  const currentWeight = getCurrentWeight();

  // Peso atual e IMC
  const weightInfoDiv = document.getElementById('profile-current-weight-info');
  if (weightInfoDiv && currentWeight && profile.height) {
    const bmi = calculateBMI(currentWeight, profile.height);
    const classification = getBMIClassification(bmi);

    weightInfoDiv.innerHTML = `
            <div class="info-box">
                <strong>⚖️ Peso Atual:</strong> ${currentWeight} kg<br>
                <strong>📊 IMC:</strong> ${bmi} (${classification})<br>
                <small>Última atualização: ${getLastWeightDate()}</small>
            </div>
        `;
  } else if (weightInfoDiv) {
    weightInfoDiv.innerHTML = `
            <div class="info-box warning">
                <p>Nenhum peso registrado ainda.</p>
                <button onclick="openWeightRegistration()" class="btn btn-small">📝 Registrar Peso</button>
            </div>
        `;
  }

  // Meta de água
  const waterGoalDiv = document.getElementById('profile-water-goal-info');
  if (waterGoalDiv && profile.dailyWaterGoal) {
    const liters = (profile.dailyWaterGoal / 1000).toFixed(1);
    waterGoalDiv.innerHTML = `
            <div class="info-box">
                <strong>💧 Meta de Água:</strong> ${profile.dailyWaterGoal}ml (${liters}L)<br>
                <small>Calculada automaticamente com base no seu peso e altura</small>
            </div>
        `;
  } else if (waterGoalDiv) {
    waterGoalDiv.innerHTML = `
            <div class="info-box warning">
                <p>Configure altura e registre seu peso para calcular a meta.</p>
            </div>
        `;
  }

  // Meta de peso (objetivo)
  const weightGoalDiv = document.getElementById('profile-weight-goal-info');
  if (weightGoalDiv && profile.weightGoal && currentWeight) {
    const difference = currentWeight - profile.weightGoal;
    const direction = difference > 0 ? 'perder' : 'ganhar';
    const absDiff = Math.abs(difference);

    if (Math.abs(difference) < 0.5) {
      weightGoalDiv.innerHTML = `
                <div class="info-box success">
                    <strong>🎯 Meta Alcançada!</strong><br>
                    Você está no peso desejado de ${profile.weightGoal} kg
                </div>
            `;
    } else {
      weightGoalDiv.innerHTML = `
                <div class="info-box">
                    <strong>🎯 Meta de Peso:</strong> ${profile.weightGoal} kg<br>
                    <strong>Faltam:</strong> ${absDiff.toFixed(1)} kg para ${direction}<br>
                    <small>Continue acompanhando sua evolução!</small>
                </div>
            `;
    }
  } else if (weightGoalDiv && !profile.weightGoal) {
    weightGoalDiv.innerHTML = `
            <div class="info-box">
                <p>Defina uma meta de peso para acompanhar seu progresso.</p>
            </div>
        `;
  }
}

// Obter data do último peso registrado
function getLastWeightDate() {
  const history = appState.userData.weightHistory;

  if (!history || history.length === 0) {
    return 'Nunca';
  }

  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastDate = new Date(sorted[0].date);

  const today = new Date();
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 || diffDays === 1) {
    return 'Hoje';
  } else if (diffDays === 2) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return `Há ${diffDays} dias`;
  } else {
    return lastDate.toLocaleDateString('pt-BR');
  }
}

// Salvar perfil do formulário
function saveProfileFromForm() {
  const heightInput = document.getElementById('profile-height');
  const genderInputs = document.querySelectorAll('input[name="profile-gender"]:checked');
  const birthDateInput = document.getElementById('profile-birthdate');
  const activityLevelSelect = document.getElementById('profile-activity-level');
  const weightGoalInput = document.getElementById('profile-weight-goal');

  // Validações
  const height = parseFloat(heightInput?.value);
  if (!height || height <= 0 || height > 300) {
    alert('❌ Por favor, preencha uma altura válida (em cm)');
    return false;
  }

  const profileData = {
    height: height,
    gender: genderInputs[0]?.value || null,
    birthDate: birthDateInput?.value || null,
    activityLevel: activityLevelSelect?.value || 'moderate',
    weightGoal: weightGoalInput?.value ? parseFloat(weightGoalInput.value) : null
  };

  const success = saveUserProfile(profileData);

  if (success) {
    alert('✅ Perfil salvo com sucesso!');
    updateProfileInfo();
    return true;
  }

  return false;
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeUserProfile,
    calculateWaterNeeds,
    calculateBMI,
    getBMIClassification,
    saveUserProfile,
    getCurrentWeight,
    updateWaterGoal
  };
}
