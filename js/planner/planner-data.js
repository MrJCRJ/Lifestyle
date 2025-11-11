// Gerenciamento de dados do planejador

// Limpar formulários do planejador
function clearPlannerForms() {
    document.getElementById('plannerSleepTime').value = '';
    document.getElementById('plannerWakeTime').value = '';

    document.querySelectorAll('input[name="plannerHasWork"]').forEach(radio => radio.checked = false);
    document.getElementById('planner-work-details').style.display = 'none';
    document.getElementById('planner-jobs-container').innerHTML = '';

    document.querySelectorAll('input[name="plannerHasStudy"]').forEach(radio => radio.checked = false);
    document.getElementById('planner-study-details').style.display = 'none';
    document.getElementById('planner-studies-container').innerHTML = '';

    document.querySelectorAll('input[name="plannerHasCleaning"]').forEach(radio => radio.checked = false);
    document.getElementById('planner-cleaning-details').style.display = 'none';
    document.getElementById('plannerCleaningStartTime').value = '';
    document.getElementById('plannerCleaningEndTime').value = '';
    document.getElementById('plannerCleaningNotes').value = '';
}

// Carregar dados do plano para o wizard de planejamento
function loadPlanDataToWizard(planData) {
    if (!planData) return;

    // Armazenar em tempPlanData para edição (fazer cópia profunda)
    appState.tempPlanData = JSON.parse(JSON.stringify(planData));

    // Carregar dados de sono
    const sleepInput = document.getElementById('plannerSleepTime');
    const wakeInput = document.getElementById('plannerWakeTime');

    if (sleepInput) sleepInput.value = planData.sleep || '';
    if (wakeInput) wakeInput.value = planData.wake || '';

    // Carregar trabalhos
    const plannerJobsContainer = document.getElementById('planner-jobs-container');
    if (plannerJobsContainer) {
        if (planData.jobs && planData.jobs.length > 0) {
            const yesRadio = document.querySelector('input[name="plannerHasWork"][value="yes"]');
            const noRadio = document.querySelector('input[name="plannerHasWork"][value="no"]');
            if (yesRadio) yesRadio.checked = true;
            togglePlannerWorkForm(true);
            plannerJobsContainer.innerHTML = '';
            plannerJobCounter = 0;
            planData.jobs.forEach(job => {
                addPlannerJobSlot(job);
            });
        } else {
            const noRadio = document.querySelector('input[name="plannerHasWork"][value="no"]');
            if (noRadio) noRadio.checked = true;
            togglePlannerWorkForm(false);
        }
    }

    // Carregar estudos
    const plannerStudiesContainer = document.getElementById('planner-studies-container');
    if (plannerStudiesContainer) {
        if (planData.studies && planData.studies.length > 0) {
            const yesRadio = document.querySelector('input[name="plannerHasStudy"][value="yes"]');
            if (yesRadio) yesRadio.checked = true;
            togglePlannerStudyForm(true);
            plannerStudiesContainer.innerHTML = '';
            plannerStudyCounter = 0;
            planData.studies.forEach(study => {
                addPlannerStudySlot(study);
            });
        } else {
            const noRadio = document.querySelector('input[name="plannerHasStudy"][value="no"]');
            if (noRadio) noRadio.checked = true;
            togglePlannerStudyForm(false);
        }
    }

    // Carregar limpeza
    if (planData.cleaning) {
        const yesRadio = document.querySelector('input[name="plannerHasCleaning"][value="yes"]');
        if (yesRadio) yesRadio.checked = true;
        togglePlannerCleaningForm(true);
        const startTime = document.getElementById('plannerCleaningStartTime');
        const endTime = document.getElementById('plannerCleaningEndTime');
        const notes = document.getElementById('plannerCleaningNotes');
        if (startTime) startTime.value = planData.cleaning.start || '';
        if (endTime) endTime.value = planData.cleaning.end || '';
        if (notes) notes.value = planData.cleaning.notes || '';
    } else {
        const noRadio = document.querySelector('input[name="plannerHasCleaning"][value="no"]');
        if (noRadio) noRadio.checked = true;
        togglePlannerCleaningForm(false);
    }

    // Carregar refeições
    const plannerMealsContainer = document.getElementById('planner-meals-times-container');
    if (plannerMealsContainer) {
        if (planData.meals && planData.meals.length > 0) {
            const yesRadio = document.querySelector('input[name="plannerHasMeals"][value="yes"]');
            if (yesRadio) yesRadio.checked = true;
            togglePlannerMealsForm(true);
            plannerMealsContainer.innerHTML = '';
            planData.meals.forEach(mealTime => {
                addPlannerMealTime();
                const inputs = plannerMealsContainer.querySelectorAll('.planner-meal-time');
                if (inputs.length > 0) {
                    inputs[inputs.length - 1].value = mealTime;
                }
            });
        } else {
            const noRadio = document.querySelector('input[name="plannerHasMeals"][value="no"]');
            if (noRadio) noRadio.checked = true;
            togglePlannerMealsForm(false);
        }
    }

    // Carregar hidratação (perfil do usuário)
    if (appState.userData.userProfile) {
        loadPlannerUserProfile();
    }

    // Carregar exercício
    if (planData.exercise) {
        const yesRadio = document.querySelector('input[name="plannerHasExercise"][value="yes"]');
        if (yesRadio) yesRadio.checked = true;
        togglePlannerExerciseForm(true);
        const startTime = document.getElementById('plannerExerciseStartTime');
        const endTime = document.getElementById('plannerExerciseEndTime');
        const type = document.getElementById('plannerExerciseType');
        if (startTime) startTime.value = planData.exercise.start || '';
        if (endTime) endTime.value = planData.exercise.end || '';
        if (type) type.value = planData.exercise.type || '';
    } else {
        const noRadio = document.querySelector('input[name="plannerHasExercise"][value="no"]');
        if (noRadio) noRadio.checked = true;
        togglePlannerExerciseForm(false);
    }
}

// Carregar configuração do dia anterior
function loadConfigFromPreviousDay() {
    const planningDate = parseDateKey(appState.planningDate);
    const previousDay = new Date(planningDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayKey = getDateKey(previousDay);

    const previousSchedule = appState.userData.dailySchedules?.[previousDayKey];

    if (previousSchedule && previousSchedule.planData) {
        loadPlanDataToWizard(previousSchedule.planData);
        alert('✅ Configuração do dia anterior carregada!');
    } else {
        alert('❌ Não há configuração no dia anterior para copiar.');
    }
}

// Carregar configuração da semana passada (mesmo dia da semana)
function loadConfigFromLastWeek() {
    const planningDate = parseDateKey(appState.planningDate);
    const lastWeek = new Date(planningDate);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekKey = getDateKey(lastWeek);

    const lastWeekSchedule = appState.userData.dailySchedules?.[lastWeekKey];

    if (lastWeekSchedule && lastWeekSchedule.planData) {
        loadPlanDataToWizard(lastWeekSchedule.planData);
        alert('✅ Configuração da semana passada carregada!');
    } else {
        alert('❌ Não há configuração na semana passada para copiar.');
    }
}

// Finalizar salvamento do planejamento
function finalizePlannerSave() {
    const planningDateKey = appState.planningDate;
    const planningDate = parseDateKey(planningDateKey);
    const dayName = getDayName(planningDate);
    const formattedDate = getFormattedDate(planningDate);
    const todayKey = getDateKey(new Date());
    const isToday = planningDateKey === todayKey;

    const planData = appState.tempPlanData;

    // Gerar cronograma do dia planejado
    const schedule = generateScheduleFromData(planData);

    // Validar conflitos incluindo sono do dia anterior
    const conflicts = validateScheduleConflicts(schedule, planningDateKey);
    if (conflicts.length > 0) {
        let message = '⚠️ Conflitos de horário detectados:\n\n';
        conflicts.forEach(conflict => {
            message += `• ${conflict.event1.name} (${conflict.event1.startTime}-${conflict.event1.endTime}) conflita com ${conflict.event2.name} (${conflict.event2.startTime}-${conflict.event2.endTime})\n`;
        });
        message += '\nPor favor, ajuste os horários para evitar sobreposições.';
        alert(message);
        return;
    }

    // Preservar status de atividades existentes
    const existingSchedule = appState.userData.dailySchedules[planningDateKey];
    if (existingSchedule && existingSchedule.activities) {
        schedule.forEach(newActivity => {
            // Encontrar atividade correspondente pelo ID (mais confiável) ou pelo tipo e nome
            const existingActivity = existingSchedule.activities.find(
                act => (act.id && act.id === newActivity.id) ||
                    (act.type === newActivity.type && act.name === newActivity.name)
            );

            if (existingActivity) {
                // Preservar rastreamento simples
                if (existingActivity.simpleTracking) {
                    newActivity.simpleTracking = { ...existingActivity.simpleTracking };
                }

                // Preservar tracking de água
                if (existingActivity.waterTracking) {
                    newActivity.waterTracking = { ...existingActivity.waterTracking };
                }

                // Preservar ajustes de horário
                if (existingActivity.originalTime) {
                    newActivity.originalTime = { ...existingActivity.originalTime };
                    newActivity.timeAdjusted = existingActivity.timeAdjusted;
                }
            }
        });
    }    // Salvar no dailySchedules
    appState.userData.dailySchedules[planningDateKey] = {
        date: planningDateKey,
        dayName: dayName,
        formattedDate: formattedDate,
        planData: planData,
        activities: schedule,
        createdAt: appState.userData.dailySchedules[planningDateKey]?.createdAt || new Date().toISOString(),
        lastSaved: new Date().toISOString(),
        isPlanned: !isToday
    };

    saveToStorage();

    // Limpar dados temporários
    appState.tempPlanData = null;
    appState.isPlanningMode = false;
    appState.planningDate = null;

    const message = isToday ? 'Cronograma de hoje atualizado!' : `Planejamento para ${dayName} salvo!`;
    alert(`✅ ${message}`);
    goToSchedules();
}
