// Gerenciamento de edição de refeições

// Estado temporário para edição
let currentEditingMeal = {
  dateKey: null,
  mealIndex: null
};

/**
 * Abrir modal de edição de refeição
 */
function openEditMealModal(dateKey, mealIndex) {
  const modal = document.getElementById('edit-meal-modal');
  if (!modal) return;

  // Armazenar informações da refeição sendo editada
  currentEditingMeal = { dateKey, mealIndex };

  // Carregar dados da refeição
  const schedule = appState.userData.dailySchedules?.[dateKey];
  if (!schedule || !schedule.activities || !schedule.activities[mealIndex]) {
    alert('Erro ao carregar refeição');
    return;
  }

  const meal = schedule.activities[mealIndex];

  // Preencher formulário
  document.getElementById('meal-custom-name').value = meal.customName || '';
  document.getElementById('meal-description').value = meal.description || '';

  // Abrir modal
  modal.style.display = 'flex';
}

/**
 * Fechar modal de edição de refeição
 */
function closeEditMealModal() {
  const modal = document.getElementById('edit-meal-modal');
  if (modal) {
    modal.style.display = 'none';
  }

  // Limpar estado
  currentEditingMeal = { dateKey: null, mealIndex: null };

  // Limpar formulário
  document.getElementById('meal-custom-name').value = '';
  document.getElementById('meal-description').value = '';
}

/**
 * Salvar refeição editada
 */
function saveEditedMeal() {
  const { dateKey, mealIndex } = currentEditingMeal;

  if (!dateKey || mealIndex === null) {
    alert('Erro: Nenhuma refeição selecionada');
    return;
  }

  // Obter valores do formulário
  const customName = document.getElementById('meal-custom-name').value.trim();
  const description = document.getElementById('meal-description').value.trim();

  // Validação opcional
  if (customName && customName.length > 50) {
    alert('O nome da refeição deve ter no máximo 50 caracteres');
    return;
  }

  if (description && description.length > 150) {
    alert('A descrição deve ter no máximo 150 caracteres');
    return;
  }

  // Atualizar refeição
  const schedule = appState.userData.dailySchedules?.[dateKey];
  if (!schedule || !schedule.activities || !schedule.activities[mealIndex]) {
    alert('Erro ao salvar refeição');
    return;
  }

  const meal = schedule.activities[mealIndex];

  // Atualizar campos
  if (customName) {
    meal.customName = customName;
  } else {
    delete meal.customName; // Remover se estiver vazio
  }

  if (description) {
    meal.description = description;
  } else {
    delete meal.description; // Remover se estiver vazio
  }

  // Salvar no storage
  saveToStorage();

  // Fechar modal
  closeEditMealModal();

  // Recarregar visualização
  showScheduleView(appState.activeFilter);

  // Feedback
  alert('✅ Refeição atualizada com sucesso!');
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
  const modal = document.getElementById('edit-meal-modal');
  if (e.target === modal) {
    closeEditMealModal();
  }
});

// Tecla ESC para fechar
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('edit-meal-modal');
    if (modal && modal.style.display === 'flex') {
      closeEditMealModal();
    }
  }
});
