// Gerenciamento do Modal de Registro de Peso

// Abrir modal de registro de peso
function openWeightRegistration() {
  const modal = document.getElementById('weight-registration-modal');
  if (!modal) {
    console.error('Modal de registro de peso não encontrado');
    return;
  }

  // Definir data de hoje como padrão
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('weight-date');
  if (dateInput) {
    dateInput.value = today;
  }

  // Limpar campos
  const weightInput = document.getElementById('weight-value');
  const noteInput = document.getElementById('weight-note');
  if (weightInput) weightInput.value = '';
  if (noteInput) noteInput.value = '';

  // Esconder info de IMC calculado
  const bmiInfo = document.getElementById('calculated-bmi-info');
  if (bmiInfo) {
    bmiInfo.style.display = 'none';
  }

  // Mostrar informação do último peso
  updateLastWeightInfo();

  // Adicionar listener para calcular IMC em tempo real
  if (weightInput) {
    weightInput.addEventListener('input', updateCalculatedBMI);
  }

  modal.classList.add('active');
}

// Fechar modal de registro de peso
function closeWeightRegistration() {
  const modal = document.getElementById('weight-registration-modal');
  if (modal) {
    modal.classList.remove('active');
  }

  // Remover listener
  const weightInput = document.getElementById('weight-value');
  if (weightInput) {
    weightInput.removeEventListener('input', updateCalculatedBMI);
  }
}

// Atualizar informação do último peso
function updateLastWeightInfo() {
  const infoDiv = document.getElementById('last-weight-info');
  if (!infoDiv) return;

  const latest = getLatestWeight();
  const height = appState.userData.userProfile?.height;

  if (!latest) {
    infoDiv.innerHTML = `
            <div class="info-box warning">
                <strong>📝 Primeiro Registro</strong><br>
                Este será seu primeiro registro de peso!
            </div>
        `;
    return;
  }

  const daysSince = calculateDaysSince(latest.date);
  const daysText = daysSince === 0 ? 'Hoje'
    : daysSince === 1 ? 'Ontem'
      : `Há ${daysSince} dias`;

  infoDiv.innerHTML = `
        <strong>⚖️ Último Peso Registrado:</strong><br>
        <span style="font-size: 1.2em;">${latest.weight} kg</span><br>
        <small>IMC: ${latest.bmi} • ${daysText}</small>
        ${latest.note ? `<br><small><em>"${latest.note}"</em></small>` : ''}
    `;
}

// Calcular dias desde uma data
function calculateDaysSince(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Atualizar IMC calculado em tempo real
function updateCalculatedBMI() {
  const weightInput = document.getElementById('weight-value');
  const bmiInfo = document.getElementById('calculated-bmi-info');

  if (!weightInput || !bmiInfo) return;

  const weight = parseFloat(weightInput.value);
  const height = appState.userData.userProfile?.height;

  if (!weight || weight <= 0 || !height) {
    bmiInfo.style.display = 'none';
    return;
  }

  const bmi = calculateBMI(weight, height);
  const classification = getBMIClassification(bmi);

  bmiInfo.style.display = 'block';
  bmiInfo.innerHTML = `
        <strong>📊 IMC Calculado:</strong> ${bmi} (${classification})<br>
        <small>Baseado na altura de ${height}cm</small>
    `;
}

// Processar submissão do formulário
function handleWeightRegistration(event) {
  event.preventDefault();

  const dateInput = document.getElementById('weight-date');
  const weightInput = document.getElementById('weight-value');
  const noteInput = document.getElementById('weight-note');

  if (!dateInput || !weightInput) {
    alert('❌ Erro: campos obrigatórios não encontrados');
    return;
  }

  const date = dateInput.value;
  const weight = parseFloat(weightInput.value);
  const note = noteInput?.value || '';

  // Validações
  if (!date) {
    alert('❌ Por favor, selecione uma data');
    return;
  }

  if (!weight || weight <= 0) {
    alert('❌ Por favor, insira um peso válido');
    return;
  }

  if (weight < 30 || weight > 300) {
    alert('❌ Peso deve estar entre 30kg e 300kg');
    return;
  }

  // Verificar se altura está configurada
  const height = appState.userData.userProfile?.height;
  if (!height) {
    alert('⚠️ Por favor, configure sua altura nas configurações primeiro!');
    closeWeightRegistration();
    openSettings();
    return;
  }

  // Verificar se já existe registro para esta data
  const existing = getWeightByDate(date);
  if (existing) {
    const confirm = window.confirm(
      `⚠️ Já existe um registro de peso para ${new Date(date).toLocaleDateString('pt-BR')}.\n\n` +
      `Peso atual: ${existing.weight} kg\n` +
      `Novo peso: ${weight} kg\n\n` +
      `Deseja substituir?`
    );

    if (!confirm) {
      return;
    }
  }

  // Adicionar registro
  const success = addWeightRecord({ date, weight, note });

  if (success) {
    alert('✅ Peso registrado com sucesso!');

    // Atualizar informações de perfil se estiverem visíveis
    if (typeof updateProfileInfo === 'function') {
      updateProfileInfo();
    }

    // Fechar modal
    closeWeightRegistration();

    // Se dashboard de peso estiver aberto, atualizar
    if (typeof refreshWeightDashboard === 'function') {
      refreshWeightDashboard();
    }
  } else {
    alert('❌ Erro ao salvar peso. Tente novamente.');
  }
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openWeightRegistration,
    closeWeightRegistration,
    handleWeightRegistration
  };
}
