// Gerenciamento de Objetivos

// Contador para medidas corporais
let measurementCounter = 0;

// Opções de medidas corporais
const bodyMeasurements = [
  { value: 'bicep', label: '💪 Bíceps', unit: 'cm' },
  { value: 'chest', label: '🫁 Peito', unit: 'cm' },
  { value: 'waist', label: '⭕ Cintura', unit: 'cm' },
  { value: 'hip', label: '🍑 Quadril', unit: 'cm' },
  { value: 'thigh', label: '🦵 Coxa', unit: 'cm' },
  { value: 'calf', label: '🦿 Panturrilha', unit: 'cm' },
  { value: 'forearm', label: '💪 Antebraço', unit: 'cm' },
  { value: 'neck', label: '🦒 Pescoço', unit: 'cm' },
  { value: 'shoulder', label: '👐 Ombros', unit: 'cm' },
  { value: 'bodyFat', label: '📊 Gordura Corporal', unit: '%' }
];

/**
 * Abrir modal de objetivos
 */
function openGoalsModal() {
  const modal = document.getElementById('goals-modal');
  if (modal) {
    modal.style.display = 'flex';
    loadGoalsData();
  }
}

/**
 * Fechar modal de objetivos
 */
function closeGoalsModal() {
  const modal = document.getElementById('goals-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Alternar entre tabs
 */
function switchGoalsTab(tabName) {
  // Atualizar tabs
  const tabs = document.querySelectorAll('.goals-tab');
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Atualizar painéis
  const panels = document.querySelectorAll('.goals-panel');
  panels.forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(`${tabName}-goals-panel`);
  if (activePanel) {
    activePanel.classList.add('active');
  }
}

/**
 * Adicionar medida corporal
 */
function addBodyMeasurement() {
  const container = document.getElementById('body-measurements-container');
  const id = `measurement-${measurementCounter++}`;

  const measurementOptions = bodyMeasurements.map(m =>
    `<option value="${m.value}">${m.label}</option>`
  ).join('');

  const html = `
    <div class="measurement-item" id="${id}">
      <div class="input-group">
        <label>Medida</label>
        <select class="measurement-type" onchange="updateMeasurementUnit('${id}')">
          <option value="">Selecione...</option>
          ${measurementOptions}
        </select>
      </div>
      <div class="input-group">
        <label>Atual <span class="measurement-unit">(cm)</span></label>
        <input type="number" class="current-measurement" step="0.1" placeholder="0.0">
      </div>
      <div class="input-group">
        <label>Alvo <span class="measurement-unit">(cm)</span></label>
        <input type="number" class="target-measurement" step="0.1" placeholder="0.0">
      </div>
      <button class="btn-icon btn-danger" onclick="removeMeasurement('${id}')" title="Remover">
        ✕
      </button>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
}

/**
 * Atualizar unidade da medida
 */
function updateMeasurementUnit(measurementId) {
  const item = document.getElementById(measurementId);
  if (!item) return;

  const select = item.querySelector('.measurement-type');
  const selectedValue = select.value;

  const measurement = bodyMeasurements.find(m => m.value === selectedValue);
  const unit = measurement ? measurement.unit : 'cm';

  const unitLabels = item.querySelectorAll('.measurement-unit');
  unitLabels.forEach(label => {
    label.textContent = `(${unit})`;
  });
}

/**
 * Remover medida
 */
function removeMeasurement(measurementId) {
  const item = document.getElementById(measurementId);
  if (item) {
    item.remove();
  }
}

/**
 * Alternar ativação de objetivo
 */
function toggleGoalActive(goalType) {
  const icon = document.getElementById(`${goalType}-toggle-icon`);
  const inputs = document.getElementById(`${goalType}-inputs`);
  const card = inputs?.closest('.goal-card');

  if (icon && card) {
    if (card.classList.contains('active')) {
      card.classList.remove('active');
      icon.textContent = '☐';
      if (inputs) {
        inputs.style.display = 'none';
      }
    } else {
      card.classList.add('active');
      icon.textContent = '☑';
      if (inputs) {
        inputs.style.display = 'block';
      }
    }
  }
}

/**
 * Carregar objetivo pré-programado
 */
function loadPresetGoal(presetType) {
  const presets = {
    'muscle-gain': {
      name: 'Ganho de Massa Muscular',
      measurements: [
        { type: 'bicep', current: '', target: '', label: 'Bíceps' },
        { type: 'chest', current: '', target: '', label: 'Peito' },
        { type: 'thigh', current: '', target: '', label: 'Coxa' }
      ]
    },
    'weight-loss': {
      name: 'Perda de Peso',
      measurements: [
        { type: 'waist', current: '', target: '', label: 'Cintura' },
        { type: 'hip', current: '', target: '', label: 'Quadril' },
        { type: 'bodyFat', current: '', target: '', label: 'Gordura Corporal' }
      ]
    },
    'definition': {
      name: 'Definição Muscular',
      measurements: [
        { type: 'waist', current: '', target: '', label: 'Cintura' },
        { type: 'bodyFat', current: '', target: '', label: 'Gordura Corporal' },
        { type: 'bicep', current: '', target: '', label: 'Bíceps' }
      ]
    },
    'endurance': {
      name: 'Resistência',
      measurements: [
        { type: 'bodyFat', current: '', target: '', label: 'Gordura Corporal' },
        { type: 'waist', current: '', target: '', label: 'Cintura' }
      ]
    }
  };

  const preset = presets[presetType];
  if (!preset) return;

  // Limpar medidas existentes
  const container = document.getElementById('body-measurements-container');
  container.innerHTML = '';

  // Adicionar medidas do preset
  preset.measurements.forEach(m => {
    addBodyMeasurement();

    // Preencher com o tipo de medida
    const lastItem = container.lastElementChild;
    const select = lastItem.querySelector('.measurement-type');
    if (select) {
      select.value = m.type;
      updateMeasurementUnit(lastItem.id);
    }
  });

  alert(`✅ Template "${preset.name}" carregado! Preencha os valores atuais e alvos.`);
}

/**
 * Carregar dados salvos
 */
function loadGoalsData() {
  if (!appState.userData.goals) {
    appState.userData.goals = {
      weight: { active: false, current: '', target: '', deadline: '' },
      measurements: []
    };
  }

  const goals = appState.userData.goals;

  // Carregar dados de peso
  if (goals.weight?.active) {
    const card = document.querySelector('.goal-card');
    if (card) {
      card.classList.add('active');
      document.getElementById('weight-toggle-icon').textContent = '☑';
      document.getElementById('weight-inputs').style.display = 'block';
    }
  }

  if (goals.weight?.current) {
    document.getElementById('current-weight').value = goals.weight.current;
  }
  if (goals.weight?.target) {
    document.getElementById('target-weight').value = goals.weight.target;
  }
  if (goals.weight?.deadline) {
    document.getElementById('weight-deadline').value = goals.weight.deadline;
  }

  // Carregar medidas corporais
  const container = document.getElementById('body-measurements-container');
  container.innerHTML = '';

  if (goals.measurements && goals.measurements.length > 0) {
    goals.measurements.forEach(m => {
      addBodyMeasurement();
      const lastItem = container.lastElementChild;

      const select = lastItem.querySelector('.measurement-type');
      const currentInput = lastItem.querySelector('.current-measurement');
      const targetInput = lastItem.querySelector('.target-measurement');

      if (select) select.value = m.type;
      if (currentInput) currentInput.value = m.current;
      if (targetInput) targetInput.value = m.target;

      updateMeasurementUnit(lastItem.id);
    });
  }

  // Atualizar resumo
  updateGoalsSummary();
}

/**
 * Salvar objetivos
 */
function saveGoals() {
  if (!appState.userData.goals) {
    appState.userData.goals = {};
  }

  // Salvar peso
  const weightCard = document.querySelector('.goal-card');
  const weightActive = weightCard?.classList.contains('active') || false;

  appState.userData.goals.weight = {
    active: weightActive,
    current: document.getElementById('current-weight')?.value || '',
    target: document.getElementById('target-weight')?.value || '',
    deadline: document.getElementById('weight-deadline')?.value || ''
  };

  // Salvar medidas corporais
  const measurements = [];
  const container = document.getElementById('body-measurements-container');
  const items = container.querySelectorAll('.measurement-item');

  items.forEach(item => {
    const type = item.querySelector('.measurement-type')?.value;
    const current = item.querySelector('.current-measurement')?.value;
    const target = item.querySelector('.target-measurement')?.value;

    if (type && (current || target)) {
      measurements.push({ type, current, target });
    }
  });

  appState.userData.goals.measurements = measurements;

  // Salvar no storage
  saveToStorage();

  // Atualizar resumo
  updateGoalsSummary();

  alert('✅ Objetivos salvos com sucesso!');
}

/**
 * Atualizar resumo de objetivos ativos
 */
function updateGoalsSummary() {
  const container = document.getElementById('active-goals-list');
  if (!container) return;

  const goals = appState.userData.goals;
  if (!goals) {
    container.innerHTML = '<p class="no-goals">Nenhum objetivo ativo. Configure seus objetivos acima!</p>';
    return;
  }

  let html = '';

  // Objetivo de peso
  if (goals.weight?.active && goals.weight.current && goals.weight.target) {
    const current = parseFloat(goals.weight.current);
    const target = parseFloat(goals.weight.target);
    const progress = Math.max(0, Math.min(100, 100 - (Math.abs(target - current) / Math.abs(target - current) * 100)));
    const diff = (current - target).toFixed(1);
    const sign = diff > 0 ? '+' : '';

    html += `
      <div class="active-goal-item">
        <div class="goal-info">
          <div class="goal-info-title">⚖️ Peso Alvo: ${target} kg</div>
          <div class="goal-info-details">Atual: ${current} kg (${sign}${diff} kg) ${goals.weight.deadline ? `• Prazo: ${new Date(goals.weight.deadline).toLocaleDateString('pt-BR')}` : ''}</div>
        </div>
        <div class="goal-progress">
          <div class="progress-bar-mini">
            <div class="progress-fill-mini" style="width: ${progress}%"></div>
          </div>
          <span class="progress-text">${Math.round(progress)}%</span>
        </div>
      </div>
    `;
  }

  // Medidas corporais
  if (goals.measurements && goals.measurements.length > 0) {
    goals.measurements.forEach(m => {
      if (!m.current || !m.target) return;

      const measurement = bodyMeasurements.find(bm => bm.value === m.type);
      if (!measurement) return;

      const current = parseFloat(m.current);
      const target = parseFloat(m.target);
      const progress = Math.max(0, Math.min(100, 100 - (Math.abs(target - current) / Math.abs(target - current) * 100)));
      const diff = (current - target).toFixed(1);
      const sign = diff > 0 ? '+' : '';

      html += `
        <div class="active-goal-item">
          <div class="goal-info">
            <div class="goal-info-title">${measurement.label}: ${target} ${measurement.unit}</div>
            <div class="goal-info-details">Atual: ${current} ${measurement.unit} (${sign}${diff} ${measurement.unit})</div>
          </div>
          <div class="goal-progress">
            <div class="progress-bar-mini">
              <div class="progress-fill-mini" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${Math.round(progress)}%</span>
          </div>
        </div>
      `;
    });
  }

  if (html === '') {
    container.innerHTML = '<p class="no-goals">Nenhum objetivo ativo. Configure seus objetivos acima!</p>';
  } else {
    container.innerHTML = html;
  }
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
  const modal = document.getElementById('goals-modal');
  if (e.target === modal) {
    closeGoalsModal();
  }
});
