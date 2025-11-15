// Exibir status das configurações na tela de edição

/**
 * Atualizar resumo das configurações na tela de edição
 */
function updateEditPlannerStatus() {
  const planData = appState.tempPlanData || {};

  // Atualizar cada categoria
  updateCategoryStatus('sleep', planData);
  updateCategoryStatus('meals', planData);
  updateCategoryStatus('hydration', planData);
  updateCategoryStatus('work', planData);
  updateCategoryStatus('study', planData);
  updateCategoryStatus('exercise', planData);
  updateCategoryStatus('hobbies', planData);
  updateCategoryStatus('projects', planData);
  updateCategoryStatus('cleaning', planData);
  updateCategoryStatus('hygiene', planData);
}

/**
 * Atualizar status visual de uma categoria
 */
function updateCategoryStatus(category, planData) {
  const card = document.querySelector(`.edit-category-card[data-category="${category}"]`);
  if (!card) return;

  // Remover preview anterior se existir
  const oldPreview = card.querySelector('.category-status-preview');
  if (oldPreview) oldPreview.remove();

  // Criar elemento de preview
  const preview = document.createElement('div');
  preview.className = 'category-status-preview';

  const status = getCategoryStatusText(category, planData);

  if (status.configured) {
    preview.innerHTML = `
      <div class="status-configured">
        <span class="status-icon">✅</span>
        <span class="status-text">${status.text}</span>
      </div>
    `;
    card.classList.add('configured');
  } else {
    preview.innerHTML = `
      <div class="status-pending">
        <span class="status-icon">⚪</span>
        <span class="status-text">Não configurado</span>
      </div>
    `;
    card.classList.remove('configured');
  }

  // Inserir antes do botão
  const button = card.querySelector('button');
  if (button) {
    button.parentNode.insertBefore(preview, button);
  }
}

/**
 * Obter texto de status para cada categoria
 */
function getCategoryStatusText(category, planData) {
  switch (category) {
    case 'sleep':
      if (planData.sleep && planData.wake) {
        return {
          configured: true,
          text: `${planData.sleep} - ${planData.wake}`
        };
      }
      return { configured: false };

    case 'meals':
      if (planData.mealsCount) {
        const count = planData.mealsCount;
        return {
          configured: true,
          text: `${count} refeição${count > 1 ? 'ões' : ''}`
        };
      }
      return { configured: false };

    case 'hydration':
      if (planData.hydration && planData.hydration.waterNeeds) {
        return {
          configured: true,
          text: `${planData.hydration.waterNeeds}ml/dia`
        };
      }
      return { configured: false };

    case 'work':
      if (planData.jobs && planData.jobs.length > 0) {
        const count = planData.jobs.length;
        return {
          configured: true,
          text: `${count} trabalho${count > 1 ? 's' : ''}`
        };
      }
      return { configured: false };

    case 'study':
      if (planData.studies && planData.studies.length > 0) {
        const count = planData.studies.length;
        return {
          configured: true,
          text: `${count} estudo${count > 1 ? 's' : ''}`
        };
      }
      return { configured: false };

    case 'exercise':
      if (planData.exercise) {
        return {
          configured: true,
          text: `${planData.exercise.start} - ${planData.exercise.end}`
        };
      }
      return { configured: false };

    case 'hobbies':
      if (planData.hobbies && planData.hobbies.length > 0) {
        const count = planData.hobbies.length;
        return {
          configured: true,
          text: `${count} hobby${count > 1 ? 's' : ''}`
        };
      }
      return { configured: false };

    case 'projects':
      if (planData.projects && planData.projects.length > 0) {
        const count = planData.projects.length;
        return {
          configured: true,
          text: `${count} projeto${count > 1 ? 's' : ''}`
        };
      }
      return { configured: false };

    case 'cleaning':
      if (planData.cleaning) {
        return {
          configured: true,
          text: `${planData.cleaning.start} - ${planData.cleaning.end}`
        };
      }
      return { configured: false };

    case 'hygiene':
      if (planData.hygiene) {
        const activities = planData.hygiene.activityNames || [];
        if (activities.length > 0) {
          return {
            configured: true,
            text: `${activities.length} atividade${activities.length > 1 ? 's' : ''}`
          };
        }
        return {
          configured: true,
          text: `${planData.hygiene.start} - ${planData.hygiene.end}`
        };
      }
      return { configured: false };

    default:
      return { configured: false };
  }
}

// Chamar updateEditPlannerStatus quando a tela de edição for mostrada
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateEditPlannerStatus,
    updateCategoryStatus,
    getCategoryStatusText
  };
}
