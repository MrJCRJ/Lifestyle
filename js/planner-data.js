// Gerenciamento de dados do planejador

// Filtrar planData apenas com categorias habilitadas
function filterPlanDataByEnabledCategories(planData) {
    const filtered = {
        sleep: planData.sleep,  // Sempre copiar (obrigatório)
        wake: planData.wake,    // Sempre copiar (obrigatório)
        jobs: [],
        studies: [],
        cleaning: null
    };

    // Copiar apenas se a categoria estiver habilitada
    if (isCategoryEnabled('work') && planData.jobs) {
        filtered.jobs = planData.jobs;
    }

    if (isCategoryEnabled('study') && planData.studies) {
        filtered.studies = planData.studies;
    }

    if (isCategoryEnabled('cleaning') && planData.cleaning) {
        filtered.cleaning = planData.cleaning;
    }

    return filtered;
}

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

    // Armazenar em tempPlanData para edição
    appState.tempPlanData = JSON.parse(JSON.stringify(planData));

    // Carregar dados de sono
    const sleepInput = document.getElementById('plannerSleepTime');
    const wakeInput = document.getElementById('plannerWakeTime');

    if (sleepInput) sleepInput.value = planData.sleep || '';
    if (wakeInput) wakeInput.value = planData.wake || '';

    // Carregar trabalhos (apenas se estiver habilitado)
    if (isCategoryEnabled('work')) {
        if (planData.jobs && planData.jobs.length > 0) {
            document.querySelector('input[name="plannerHasWork"][value="yes"]').checked = true;
            togglePlannerWorkForm(true);
            document.getElementById('planner-jobs-container').innerHTML = '';
            plannerJobCounter = 0;
            planData.jobs.forEach(job => {
                addPlannerJobSlot(job);
            });
        } else {
            document.querySelector('input[name="plannerHasWork"][value="no"]').checked = true;
            togglePlannerWorkForm(false);
        }
    }

    // Carregar estudos (apenas se estiver habilitado)
    if (isCategoryEnabled('study')) {
        if (planData.studies && planData.studies.length > 0) {
            document.querySelector('input[name="plannerHasStudy"][value="yes"]').checked = true;
            togglePlannerStudyForm(true);
            document.getElementById('planner-studies-container').innerHTML = '';
            plannerStudyCounter = 0;
            planData.studies.forEach(study => {
                addPlannerStudySlot(study);
            });
        } else {
            document.querySelector('input[name="plannerHasStudy"][value="no"]').checked = true;
            togglePlannerStudyForm(false);
        }
    }

    // Carregar limpeza (apenas se estiver habilitado)
    if (isCategoryEnabled('cleaning')) {
        if (planData.cleaning) {
            document.querySelector('input[name="plannerHasCleaning"][value="yes"]').checked = true;
            togglePlannerCleaningForm(true);
            document.getElementById('plannerCleaningStartTime').value = planData.cleaning.start || '';
            document.getElementById('plannerCleaningEndTime').value = planData.cleaning.end || '';
            document.getElementById('plannerCleaningNotes').value = planData.cleaning.notes || '';
        } else {
            document.querySelector('input[name="plannerHasCleaning"][value="no"]').checked = true;
            togglePlannerCleaningForm(false);
        }
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
        // Filtrar apenas categorias habilitadas
        const filteredPlanData = filterPlanDataByEnabledCategories(previousSchedule.planData);
        loadPlanDataToWizard(filteredPlanData);
    } else {
        alert('Não há configuração no dia anterior para copiar.');
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
        // Filtrar apenas categorias habilitadas
        const filteredPlanData = filterPlanDataByEnabledCategories(lastWeekSchedule.planData);
        loadPlanDataToWizard(filteredPlanData);
    } else {
        alert('Não há configuração na semana passada para copiar.');
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

    // Salvar no dailySchedules
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

    // Re-agendar notificações se for o dia de hoje
    if (isToday && typeof scheduleNotificationsForToday === 'function') {
        scheduleNotificationsForToday();
    }

    // Limpar dados temporários
    appState.tempPlanData = null;
    appState.isPlanningMode = false;
    appState.planningDate = null;

    const message = isToday ? 'Cronograma de hoje atualizado!' : `Planejamento para ${dayName} salvo!`;
    alert(`✅ ${message}`);
    goToSchedules();
}
