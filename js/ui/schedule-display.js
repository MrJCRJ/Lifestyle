// Controlador principal de visualização de cronogramas
// Depende de: schedule-render.js, schedule-filters.js

// Mostrar visualização de cronogramas com filtro
function showScheduleView(filter = 'today') {
    const container = document.getElementById('schedule-display');
    const schedules = getSchedulesByFilter(filter);

    // Salvar filtro ativo
    appState.activeFilter = filter;
    saveToStorage();

    // Atualizar botões de filtro
    updateFilterButtons(filter);

    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <strong>Nenhum cronograma encontrado para este período.</strong>
            </div>
        `;
        showScreen('schedule');
        return;
    }

    // Renderizar todos os cronogramas
    const todayKey = getDateKey(new Date());
    const html = schedules.map(schedule => {
        if (schedule.isEmpty) {
            return renderEmptyDayCard(schedule);
        } else {
            const isToday = schedule.date === todayKey;
            return renderScheduleDayCard(schedule, isToday);
        }
    }).join('');

    container.innerHTML = html;
    showScreen('schedule');

    // Atualizar linha de hora atual a cada minuto
    if (filter === 'today') {
        // Limpar intervalo anterior se existir
        if (window.timeIndicatorInterval) {
            clearInterval(window.timeIndicatorInterval);
        }
        // Atualizar a cada 60 segundos
        window.timeIndicatorInterval = setInterval(() => {
            showScheduleView('today');
        }, 60000);
    }
}
