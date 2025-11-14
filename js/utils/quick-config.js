// Configurações Rápidas - Reutilizar dados de dias anteriores

/**
 * Buscar configurações anteriores de uma categoria
 * @param {string} category - Categoria (jobs, studies, projects, sleep, cleaning, exercise, meals, hydration)
 * @param {number} limit - Número máximo de resultados (padrão: 2)
 * @returns {Array} Array com configurações anteriores únicas
 */
function getPreviousConfigs(category, limit = 2) {
  const schedules = appState.userData.dailySchedules || {};
  const configs = [];
  const seenConfigs = new Set(); // Para evitar duplicatas

  console.log('[Quick Config] Buscando configurações para:', category);
  console.log('[Quick Config] Schedules disponíveis:', Object.keys(schedules).length);

  // Ordenar datas em ordem decrescente (mais recentes primeiro)
  const sortedDates = Object.keys(schedules).sort((a, b) => b.localeCompare(a));

  // Categorias que são arrays vs objetos únicos
  const arrayCategories = ['jobs', 'studies', 'projects', 'hobbies'];
  const isArrayCategory = arrayCategories.includes(category);

  for (const dateKey of sortedDates) {
    const schedule = schedules[dateKey];
    const planData = schedule.planData;

    if (!planData) continue;

    // Para categorias que são arrays (jobs, studies, projects)
    if (isArrayCategory) {
      if (!planData[category]) continue;
      const items = planData[category];
      if (!Array.isArray(items) || items.length === 0) continue;

      console.log(`[Quick Config] Encontrados ${items.length} itens em ${dateKey}`);

      // Processar cada item da categoria
      items.forEach(item => {
        // Criar identificador único baseado no nome e horários
        const configId = JSON.stringify({
          name: item.name,
          times: item.times
        });

        // Se já vimos essa configuração, pular
        if (seenConfigs.has(configId)) return;

        seenConfigs.add(configId);
        configs.push({
          date: dateKey,
          dayName: schedule.dayName || getDayName(parseDateKey(dateKey)),
          config: { ...item }
        });
      });
    } else {
      // Para categorias simples (sleep, cleaning, exercise, hydration, meals)
      let configData = null;

      if (category === 'sleep' && planData.sleep && planData.wake) {
        configData = { sleep: planData.sleep, wake: planData.wake };
      } else if (category === 'cleaning' && planData.cleaning) {
        configData = planData.cleaning;
      } else if (category === 'exercise' && planData.exercise) {
        configData = planData.exercise;
      } else if (category === 'hydration' && planData.hydration) {
        configData = planData.hydration;
      } else if (category === 'meals' && planData.mealsCount) {
        configData = { mealsCount: planData.mealsCount };
      }

      if (configData) {
        const configId = JSON.stringify(configData);

        if (!seenConfigs.has(configId)) {
          seenConfigs.add(configId);
          configs.push({
            date: dateKey,
            dayName: schedule.dayName || getDayName(parseDateKey(dateKey)),
            config: configData
          });

          console.log(`[Quick Config] Configuração encontrada em ${dateKey}`);
        }
      }
    }

    // Parar se já temos o limite de configurações únicas
    if (configs.length >= limit) break;
  }

  console.log(`[Quick Config] Total de configs únicas encontradas: ${configs.length}`);
  return configs.slice(0, limit);
}

/**
 * Aplicar configuração rápida ao formulário
 * @param {string} category - Categoria (jobs, studies, projects)
 * @param {Object} config - Configuração a ser aplicada
 * @param {Function} addSlotFunction - Função para adicionar slot
 */
function applyQuickConfig(category, config, addSlotFunction) {
  if (typeof addSlotFunction !== 'function') {
    console.error('Função de adicionar slot não encontrada');
    return;
  }

  // Adicionar o slot com os dados da configuração
  addSlotFunction(config);
}

/**
 * Wrapper para aplicar configuração rápida a partir do botão HTML
 * @param {string} category - Categoria
 * @param {string} configStr - String JSON da configuração
 * @param {string} functionName - Nome da função para adicionar slot ou aplicar config
 */
function applyQuickConfigFromButton(category, configStr, functionName) {
  try {
    // Decodificar HTML entities e fazer parse do JSON
    const config = JSON.parse(configStr.replace(/&quot;/g, '"'));
    const applyFunction = window[functionName];

    if (typeof applyFunction === 'function') {
      // Para categorias array, usa a função de adicionar slot
      // Para outras categorias, passa o config completo
      applyFunction(config);
    } else {
      console.error('Função não encontrada:', functionName);
    }
  } catch (error) {
    console.error('Erro ao aplicar configuração:', error);
    alert('Erro ao aplicar configuração rápida');
  }
}

/**
 * Renderizar HTML das configurações rápidas
 * @param {string} category - Categoria (jobs, studies, projects)
 * @param {string} containerId - ID do container onde renderizar
 * @param {Function} addSlotFunction - Função para adicionar slot
 */
/**
 * Renderizar HTML das configurações rápidas
 * @param {string} category - Categoria (jobs, studies, projects, sleep, cleaning, exercise, meals, hydration)
 * @param {string} containerId - ID do container onde renderizar
 * @param {Function} applyCallback - Função callback para aplicar a configuração
 */
function renderQuickConfigs(category, containerId, applyCallback) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('[Quick Config] Container não encontrado:', containerId);
    return;
  }

  console.log('[Quick Config] Renderizando para categoria:', category);

  const configs = getPreviousConfigs(category, 2);

  if (configs.length === 0) {
    container.innerHTML = '<p class="quick-config-empty">💡 Nenhuma configuração anterior</p>';
    container.style.display = 'block';
    return;
  }

  const categoryInfo = {
    jobs: { label: 'Trabalho', icon: '💼' },
    studies: { label: 'Estudo', icon: '📚' },
    projects: { label: 'Projeto', icon: '🎯' },
    hobbies: { label: 'Hobby & Lazer', icon: '🎨' },
    sleep: { label: 'Sono', icon: '😴' },
    cleaning: { label: 'Limpeza', icon: '🧹' },
    exercise: { label: 'Exercício', icon: '💪' },
    meals: { label: 'Refeições', icon: '🍽️' },
    hydration: { label: 'Hidratação', icon: '💧' }
  };

  const info = categoryInfo[category] || { label: 'Item', icon: '⚙️' };

  // Armazenar callback globalmente para cada categoria
  const callbackKey = `__quickConfigCallback_${category}_${containerId}`;
  window[callbackKey] = applyCallback;

  const html = configs.map((item, index) => {
    let displayText = '';

    // Formatar texto de acordo com o tipo de categoria
    if (category === 'sleep') {
      displayText = `<strong>😴 ${item.config.sleep}</strong> → <strong>⏰ ${item.config.wake}</strong>`;
    } else if (category === 'cleaning') {
      displayText = `<strong>🕐 ${item.config.start}</strong> → <strong>${item.config.end}</strong>`;
    } else if (category === 'exercise') {
      displayText = `<strong>${item.config.type || 'Exercício'}</strong><br><small>${item.config.start} → ${item.config.end}</small>`;
    } else if (category === 'meals') {
      const count = item.config.mealsCount;
      displayText = `<strong>${count} ${count === 1 ? 'refeição' : 'refeições'}</strong> por dia`;
    } else if (category === 'hydration') {
      displayText = `<strong>${item.config.waterNeeds}ml</strong> por dia`;
    } else {
      // Para jobs, studies, projects
      const timesText = item.config.times.map(t => `${t.start}→${t.end}`).join(', ');
      displayText = `<strong>${item.config.name}</strong><br><small>${timesText}</small>`;
    }

    const configDataStr = JSON.stringify(item.config);
    const configDataEscaped = configDataStr.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <div class="quick-config-card">
        <div class="quick-config-info">
          <div class="quick-config-text">${displayText}</div>
          <span class="quick-config-date">📅 ${item.dayName}</span>
        </div>
        <button 
          type="button"
          onclick="applyQuickConfigFromButton('${category}', '${configDataEscaped}', '${callbackKey}')"
          class="btn btn-primary btn-small quick-config-btn"
          title="Usar esta configuração"
        >
          ⚡ Usar
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="quick-config-container">
      <div class="quick-config-header">
        <span class="quick-config-icon">${info.icon}</span>
        <div class="quick-config-title">
          <h4>Configurações Anteriores</h4>
          <p>Clique para reutilizar</p>
        </div>
      </div>
      <div class="quick-config-list">
        ${html}
      </div>
    </div>
  `;

  container.style.display = 'block';
}

/**
 * Mostrar/ocultar seção de configurações rápidas
 * @param {string} containerId - ID do container
 * @param {boolean} show - Se deve mostrar ou ocultar
 */
function toggleQuickConfigSection(containerId, show) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = show ? 'block' : 'none';
  }
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPreviousConfigs,
    applyQuickConfig,
    applyQuickConfigFromButton,
    renderQuickConfigs,
    toggleQuickConfigSection
  };
}
