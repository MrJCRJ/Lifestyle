// Card de Atividades

/**
 * Renderiza card de atividades
 * @param {Object} data - Dados do dashboard
 * @returns {string} HTML do card
 */
function renderActivitiesCard(data) {
  const activities = [
    { key: 'work', icon: '💼', label: 'Trabalho' },
    { key: 'study', icon: '📚', label: 'Estudo' },
    { key: 'exercise', icon: '🏃', label: 'Exercícios' },
    { key: 'sleep', icon: '😴', label: 'Sono' },
    { key: 'cleaning', icon: '🧹', label: 'Limpeza' },
    { key: 'hobby', icon: '🎨', label: 'Hobby' },
    { key: 'projects', icon: '🚀', label: 'Projetos' }
  ];

  const activitiesHTML = activities
    .filter(act => data.activities[act.key].count > 0)
    .map(act => createActivityRow(act, data.activities[act.key], data.totalDays))
    .join('');

  const content = activitiesHTML || '<p class="no-data">Nenhuma atividade registrada</p>';

  return '<div class="dashboard-card activities-card">' +
    '<h3>📊 Atividades</h3>' +
    '<div class="activities-list">' + content + '</div>' +
    '</div>';
}

/**
 * Cria linha de atividade
 */
function createActivityRow(activity, actData, totalDays) {
  const hours = (actData.totalMinutes / 60).toFixed(1);
  const avgPerDay = (actData.totalMinutes / totalDays / 60).toFixed(1);

  return '<div class="activity-row">' +
    '<div class="activity-info">' +
    '<span class="activity-icon">' + activity.icon + '</span>' +
    '<span class="activity-label">' + activity.label + '</span>' +
    '</div>' +
    '<div class="activity-stats">' +
    '<div class="activity-count">' + actData.count + 'x</div>' +
    '<div class="activity-time">' + hours + 'h</div>' +
    '<div class="activity-avg">' + avgPerDay + 'h/dia</div>' +
    '</div>' +
    '</div>';
}
