/**
 * Carregar dados de higiene no planner
 */
function loadPlannerHygieneData(planData) {
  if (!planData.hygiene) {
    const noRadio = document.querySelector('input[name="plannerHasHygiene"][value="no"]');
    if (noRadio) noRadio.checked = true;
    if (typeof togglePlannerHygieneForm === 'function') togglePlannerHygieneForm(false);
    return;
  }

  const yesRadio = document.querySelector('input[name="plannerHasHygiene"][value="yes"]');
  if (yesRadio) yesRadio.checked = true;
  if (typeof togglePlannerHygieneForm === 'function') togglePlannerHygieneForm(true);

  const hygieneData = planData.hygiene;
  const startTime = document.getElementById('plannerHygieneStartTime');
  const endTime = document.getElementById('plannerHygieneEndTime');
  const notes = document.getElementById('plannerHygieneNotes');

  if (startTime) startTime.value = hygieneData.start || '';
  if (endTime) endTime.value = hygieneData.end || '';
  if (notes) notes.value = hygieneData.notes || '';

  // Recarregar atividades (as checkboxes serão marcadas baseado no histórico)
  if (typeof initializePlannerHygieneSuggestions === 'function') {
    setTimeout(() => initializePlannerHygieneSuggestions(), 100);
  }
}
