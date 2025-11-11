// Filtros e seleção de cronogramas

// Obter cronogramas baseado no filtro
function getSchedulesByFilter(filter) {
    const schedules = [];
    const today = new Date();
    const dailySchedules = appState.userData.dailySchedules || {};

    let startDate, endDate;

    switch (filter) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        case '3days':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 2);
            break;
        case 'week':
            // Encontrar segunda-feira da semana atual
            const dayOfWeek = today.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() + diffToMonday);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); // Domingo
            break;
        case '7days':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 6);
            break;
        default:
            startDate = new Date(today);
            endDate = new Date(today);
    }

    // Gerar todos os dias do período (incluindo vazios)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateKey = getDateKey(currentDate);

        if (dailySchedules[dateKey]) {
            schedules.push(dailySchedules[dateKey]);
        } else {
            // Criar entrada vazia para dia não planejado
            schedules.push({
                date: dateKey,
                dayName: getDayName(currentDate),
                formattedDate: getFormattedDate(currentDate),
                activities: [],
                isEmpty: true
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
}

// Atualizar botões de filtro
function updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === activeFilter) {
            btn.classList.add('active');
        }
    });
}
