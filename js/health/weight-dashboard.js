// Dashboard de Evolução de Peso

// Abrir dashboard de peso
function openWeightDashboard() {
  const modal = document.getElementById('weight-dashboard-modal');
  if (!modal) {
    console.error('Modal de dashboard de peso não encontrado');
    return;
  }

  modal.classList.add('active');

  // Carregar dados do dashboard
  loadWeightDashboard();
}

// Fechar dashboard de peso
function closeWeightDashboard() {
  const modal = document.getElementById('weight-dashboard-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Recarregar dashboard (chamado após registrar novo peso)
function refreshWeightDashboard() {
  const modal = document.getElementById('weight-dashboard-modal');
  if (modal && modal.classList.contains('active')) {
    loadWeightDashboard();
  }
}

// Carregar dados do dashboard
function loadWeightDashboard() {
  const history = getWeightHistory ? getWeightHistory('desc') : [];

  const loadingDiv = document.getElementById('weight-dashboard-loading');
  const emptyDiv = document.getElementById('weight-dashboard-empty');
  const contentDiv = document.getElementById('weight-dashboard-content');

  // Mostrar loading
  if (loadingDiv) loadingDiv.style.display = 'block';
  if (emptyDiv) emptyDiv.style.display = 'none';
  if (contentDiv) contentDiv.style.display = 'none';

  // Simular carregamento
  setTimeout(() => {
    if (loadingDiv) loadingDiv.style.display = 'none';

    if (!history || history.length === 0) {
      // Estado vazio
      if (emptyDiv) emptyDiv.style.display = 'block';
    } else {
      // Renderizar dashboard
      if (contentDiv) contentDiv.style.display = 'block';
      renderWeightDashboard();
    }
  }, 300);
}

// Renderizar dashboard completo
function renderWeightDashboard() {
  const stats = getWeightStatistics ? getWeightStatistics() : null;

  if (!stats) {
    console.error('Erro ao obter estatísticas de peso');
    return;
  }

  // Renderizar cada seção
  renderDashboardSummary(stats);
  renderWeightChart(stats);
  renderDashboardStats(stats);
  renderWeightHistory(stats);
}

// Renderizar resumo geral (cards do topo)
function renderDashboardSummary(stats) {
  const { latest, totalChange, goalProgress, currentBMI, bmiClassification } = stats;

  // Peso atual
  const currentWeightValue = document.getElementById('current-weight-value');
  const currentWeightDate = document.getElementById('current-weight-date');
  if (currentWeightValue && latest) {
    currentWeightValue.textContent = `${latest.weight} kg`;
  }
  if (currentWeightDate && latest) {
    const date = new Date(latest.date);
    currentWeightDate.textContent = date.toLocaleDateString('pt-BR');
  }

  // IMC atual
  const currentBMIValue = document.getElementById('current-bmi-value');
  const currentBMIClass = document.getElementById('current-bmi-class');
  if (currentBMIValue && currentBMI) {
    currentBMIValue.textContent = currentBMI;
  }
  if (currentBMIClass && bmiClassification) {
    currentBMIClass.textContent = bmiClassification;

    // Adicionar cor baseada na classificação
    currentBMIClass.className = 'summary-classification';
    if (bmiClassification === 'Peso normal') {
      currentBMIClass.classList.add('status-success');
    } else if (bmiClassification.includes('Abaixo') || bmiClassification.includes('Obesidade')) {
      currentBMIClass.classList.add('status-danger');
    } else {
      currentBMIClass.classList.add('status-warning');
    }
  }

  // Variação total
  const totalChangeValue = document.getElementById('total-change-value');
  const totalChangePercent = document.getElementById('total-change-percent');
  if (totalChange && totalChangeValue) {
    const sign = totalChange.absolute > 0 ? '+' : '';
    totalChangeValue.textContent = `${sign}${totalChange.absolute.toFixed(1)} kg`;

    // Adicionar classe de cor
    totalChangeValue.className = 'summary-value';
    if (totalChange.direction === 'loss') {
      totalChangeValue.classList.add('status-success');
    } else if (totalChange.direction === 'gain') {
      totalChangeValue.classList.add('status-warning');
    }
  }
  if (totalChange && totalChangePercent) {
    const sign = totalChange.percent > 0 ? '+' : '';
    totalChangePercent.textContent = `(${sign}${totalChange.percent.toFixed(1)}%)`;
  }

  // Meta de peso
  const goalWeightValue = document.getElementById('goal-weight-value');
  const goalRemaining = document.getElementById('goal-remaining');
  if (goalProgress) {
    if (goalWeightValue) {
      goalWeightValue.textContent = `${goalProgress.goal} kg`;
    }
    if (goalRemaining) {
      if (goalProgress.achieved) {
        goalRemaining.textContent = '🎉 Meta alcançada!';
        goalRemaining.className = 'summary-remaining status-success';
      } else {
        const verb = goalProgress.direction === 'lose' ? 'perder' : 'ganhar';
        goalRemaining.textContent = `Faltam ${goalProgress.remaining.toFixed(1)}kg para ${verb}`;
      }
    }
  } else {
    if (goalWeightValue) {
      goalWeightValue.textContent = 'Não definida';
    }
    if (goalRemaining) {
      goalRemaining.textContent = 'Configure nas configurações';
    }
  }
}

// Renderizar gráfico de evolução
function renderWeightChart(stats) {
  const container = document.getElementById('weight-chart-container');
  if (!container) return;

  const history = getWeightHistory ? getWeightHistory('asc') : [];

  if (history.length === 0) {
    container.innerHTML = '<p class="empty-message">Sem dados para exibir</p>';
    return;
  }

  // Limitar aos últimos 3 meses (90 dias)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

  const recentHistory = history.filter(record => {
    return new Date(record.date) >= threeMonthsAgo;
  });

  if (recentHistory.length === 0) {
    container.innerHTML = '<p class="empty-message">Sem dados nos últimos 3 meses</p>';
    return;
  }

  // Encontrar valores min e max para escala
  const weights = recentHistory.map(r => r.weight);
  const goal = stats.goalProgress?.goal;

  let minWeight = Math.min(...weights);
  let maxWeight = Math.max(...weights);

  // Incluir meta no cálculo se existir
  if (goal) {
    minWeight = Math.min(minWeight, goal);
    maxWeight = Math.max(maxWeight, goal);
  }

  // Adicionar margem de 2kg
  const range = maxWeight - minWeight;
  const margin = Math.max(2, range * 0.1);
  minWeight -= margin;
  maxWeight += margin;

  // Renderizar gráfico ASCII-art style
  const chartHTML = renderASCIIChart(recentHistory, minWeight, maxWeight, goal);
  container.innerHTML = chartHTML;

  // Mostrar legenda da meta se existir
  if (goal) {
    const goalLegend = document.getElementById('goal-legend');
    if (goalLegend) {
      goalLegend.style.display = 'inline-flex';
    }
  }
}

// Renderizar gráfico estilo ASCII
function renderASCIIChart(history, minWeight, maxWeight, goal) {
  const chartHeight = 200; // pixels
  const range = maxWeight - minWeight;

  // Criar pontos do gráfico
  const points = history.map((record, index) => {
    const x = (index / (history.length - 1)) * 100; // Porcentagem
    const y = ((record.weight - minWeight) / range) * 100; // Porcentagem invertida

    return {
      x: x,
      y: 100 - y, // Inverter para que maior peso fique no topo
      weight: record.weight,
      date: record.date,
      note: record.note
    };
  });

  // Linha da meta se existir
  let goalLineY = null;
  if (goal) {
    goalLineY = 100 - (((goal - minWeight) / range) * 100);
  }

  // Gerar SVG
  let svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="weight-chart-svg">`;

  // Linha da meta (dashed)
  if (goalLineY !== null) {
    svg += `<line x1="0" y1="${goalLineY}" x2="100" y2="${goalLineY}" class="chart-goal-line" stroke-dasharray="2,2" />`;
  }

  // Linha do gráfico
  if (points.length > 1) {
    const pathData = points.map((p, i) => {
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }).join(' ');

    svg += `<path d="${pathData}" class="chart-line" />`;

    // Área preenchida
    const areaData = `${pathData} L ${points[points.length - 1].x} 100 L 0 100 Z`;
    svg += `<path d="${areaData}" class="chart-area" />`;
  }

  // Pontos
  points.forEach(point => {
    svg += `<circle cx="${point.x}" cy="${point.y}" r="1.5" class="chart-point" />`;
  });

  svg += `</svg>`;

  // Eixo Y (escala de peso)
  const ySteps = 5;
  let yAxisHTML = '<div class="chart-y-axis">';
  for (let i = 0; i <= ySteps; i++) {
    const weight = maxWeight - (i / ySteps) * range;
    yAxisHTML += `<span class="y-label">${weight.toFixed(1)}</span>`;
  }
  yAxisHTML += '</div>';

  // Eixo X (datas)
  let xAxisHTML = '<div class="chart-x-axis">';
  const maxLabels = 4;
  const step = Math.max(1, Math.floor(history.length / maxLabels));

  history.forEach((record, index) => {
    if (index % step === 0 || index === history.length - 1) {
      const date = new Date(record.date);
      const label = `${date.getDate()}/${date.getMonth() + 1}`;
      const position = (index / (history.length - 1)) * 100;
      xAxisHTML += `<span class="x-label" style="left: ${position}%">${label}</span>`;
    }
  });
  xAxisHTML += '</div>';

  return `
        <div class="chart-wrapper">
            ${yAxisHTML}
            <div class="chart-content">
                ${svg}
                ${xAxisHTML}
            </div>
        </div>
    `;
}

// Renderizar estatísticas
function renderDashboardStats(stats) {
  const { initial, totalRecords, averages, trend } = stats;

  // Peso inicial
  const initialWeightStat = document.getElementById('initial-weight-stat');
  if (initialWeightStat && initial) {
    const date = new Date(initial.date);
    initialWeightStat.textContent = `${initial.weight} kg (${date.toLocaleDateString('pt-BR')})`;
  }

  // Total de registros
  const totalRecordsStat = document.getElementById('total-records-stat');
  if (totalRecordsStat) {
    totalRecordsStat.textContent = `${totalRecords} ${totalRecords === 1 ? 'registro' : 'registros'}`;
  }

  // Média 7 dias
  const avg7Stat = document.getElementById('avg-7days-stat');
  if (avg7Stat) {
    avg7Stat.textContent = averages.week ? `${averages.week} kg` : 'Sem dados';
  }

  // Média 30 dias
  const avg30Stat = document.getElementById('avg-30days-stat');
  if (avg30Stat) {
    avg30Stat.textContent = averages.month ? `${averages.month} kg` : 'Sem dados';
  }

  // Tendência
  const trendStat = document.getElementById('trend-stat');
  if (trendStat && trend) {
    trendStat.textContent = trend.description;

    // Adicionar cor baseada na direção
    trendStat.className = 'stat-value';
    if (trend.direction === 'losing') {
      trendStat.classList.add('status-success');
    } else if (trend.direction === 'gaining') {
      trendStat.classList.add('status-warning');
    }
  } else if (trendStat) {
    trendStat.textContent = 'Peso estável';
  }
}

// Renderizar histórico detalhado
function renderWeightHistory(stats) {
  const container = document.getElementById('weight-history-list');
  if (!container) return;

  const history = getWeightHistory ? getWeightHistory('desc') : [];

  if (history.length === 0) {
    container.innerHTML = '<p class="empty-message">Nenhum registro ainda</p>';
    return;
  }

  let html = '';

  history.forEach((record, index) => {
    const date = new Date(record.date);
    const isLatest = index === 0;

    // Calcular variação em relação ao anterior
    let changeHTML = '';
    if (index < history.length - 1) {
      const previous = history[index + 1];
      const change = record.weight - previous.weight;
      const changePercent = (change / previous.weight) * 100;

      if (Math.abs(change) >= 0.1) {
        const sign = change > 0 ? '+' : '';
        const arrow = change > 0 ? '↑' : '↓';
        const className = change > 0 ? 'status-warning' : 'status-success';

        changeHTML = `
                    <span class="weight-change ${className}">
                        ${arrow} ${sign}${change.toFixed(1)}kg (${sign}${changePercent.toFixed(1)}%)
                    </span>
                `;
      }
    }

    html += `
            <div class="history-item ${isLatest ? 'latest' : ''}">
                <div class="history-date">
                    <strong>${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    ${isLatest ? '<span class="badge-latest">Atual</span>' : ''}
                </div>
                <div class="history-details">
                    <div class="history-weight">
                        <span class="weight-label">Peso:</span>
                        <span class="weight-value">${record.weight} kg</span>
                        ${changeHTML}
                    </div>
                    <div class="history-bmi">
                        <span class="bmi-label">IMC:</span>
                        <span class="bmi-value">${record.bmi}</span>
                        <span class="bmi-class">(${getBMIClassification(record.bmi)})</span>
                    </div>
                    ${record.note ? `<div class="history-note">📝 ${record.note}</div>` : ''}
                </div>
                <button onclick="confirmDeleteWeight('${record.id}')" class="btn-delete-weight" title="Remover registro">
                    🗑️
                </button>
            </div>
        `;
  });

  container.innerHTML = html;
}

// Confirmar e deletar peso
function confirmDeleteWeight(recordId) {
  const record = (getWeightHistory ? getWeightHistory() : []).find(r => r.id === recordId);

  if (!record) {
    alert('❌ Registro não encontrado');
    return;
  }

  const date = new Date(record.date);
  const confirm = window.confirm(
    `⚠️ Tem certeza que deseja remover este registro?\n\n` +
    `Data: ${date.toLocaleDateString('pt-BR')}\n` +
    `Peso: ${record.weight} kg\n\n` +
    `Esta ação não pode ser desfeita.`
  );

  if (!confirm) return;

  const success = deleteWeightRecord ? deleteWeightRecord(recordId) : false;

  if (success) {
    alert('✅ Registro removido com sucesso!');

    // Atualizar dashboard
    refreshWeightDashboard();

    // Atualizar perfil se estiver aberto
    if (typeof updateProfileInfo === 'function') {
      updateProfileInfo();
    }
  } else {
    alert('❌ Erro ao remover registro');
  }
}

// Exports para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openWeightDashboard,
    closeWeightDashboard,
    refreshWeightDashboard
  };
}
