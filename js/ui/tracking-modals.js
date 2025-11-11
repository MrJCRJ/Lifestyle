// Modais para sistema de rastreamento de eventos

// Modal para início detalhado
function showDetailedStartModal(dateKey, activityIndex, currentTime, timeStatus, message) {
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    const modalHtml = `
        <div class="modal-overlay" id="event-modal">
            <div class="modal-content">
                <h3>▶️ Marcar Início</h3>
                <div class="modal-body">
                    <div class="event-info">
                        <strong>${activity.name}</strong>
                        <p>Horário previsto: ${activity.startTime}</p>
                        <p>Marcado às: <strong>${currentTime}</strong></p>
                    </div>
                    
                    ${message ? `<p class="time-warning">${message}</p>` : ''}
                    
                    ${timeStatus !== 'on-time' ? `
                        <div class="time-adjust-question">
                            <label>
                                <input type="checkbox" id="adjust-start-time-check"> 
                                Deseja ajustar o horário de início para este dia?
                            </label>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>Observações (opcional):</label>
                        <textarea id="event-notes" rows="2" placeholder="Ex: Acordei mais cedo..."></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="closeEventModal()" class="btn btn-outline">Cancelar</button>
                    <button onclick="confirmDetailedStart('${dateKey}', ${activityIndex}, '${currentTime}', '${timeStatus}')" class="btn btn-primary">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Modal para fim detalhado
function showDetailedEndModal(dateKey, activityIndex, currentTime, timeStatus, message) {
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    const modalHtml = `
        <div class="modal-overlay" id="event-modal">
            <div class="modal-content">
                <h3>⏹️ Marcar Fim</h3>
                <div class="modal-body">
                    <div class="event-info">
                        <strong>${activity.name}</strong>
                        <p>Horário previsto: ${activity.endTime}</p>
                        <p>Marcado às: <strong>${currentTime}</strong></p>
                    </div>
                    
                    ${message ? `<p class="time-warning">${message}</p>` : ''}
                    
                    ${timeStatus !== 'on-time' ? `
                        <div class="time-adjust-question">
                            <label>
                                <input type="checkbox" id="adjust-end-time-check"> 
                                Deseja ajustar o horário de fim para este dia?
                            </label>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>Observações (opcional):</label>
                        <textarea id="event-notes" rows="2" placeholder="Ex: Terminei mais cedo..."></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="closeEventModal()" class="btn btn-outline">Cancelar</button>
                    <button onclick="confirmDetailedEnd('${dateKey}', ${activityIndex}, '${currentTime}', '${timeStatus}')" class="btn btn-primary">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Modal de ajuste de horário
function showTimeAdjustModal(dateKey, activityIndex, suggestedTime, adjustType = 'both') {
    const schedule = appState.userData.dailySchedules[dateKey];
    const activity = schedule.activities[activityIndex];

    const modalHtml = `
        <div class="modal-overlay" id="time-adjust-modal">
            <div class="modal-content">
                <h3>⏰ Ajustar Horário do Evento</h3>
                <div class="modal-body">
                    <p><strong>${activity.name}</strong></p>
                    <p>Horário original: ${activity.startTime} - ${activity.endTime}</p>
                    
                    ${adjustType === 'start' || adjustType === 'both' ? `
                    <div class="form-group">
                        <label>Novo horário de início:</label>
                        <input type="time" id="new-start-time" value="${adjustType === 'start' ? suggestedTime : activity.startTime}">
                    </div>
                    ` : ''}
                    
                    ${adjustType === 'end' || adjustType === 'both' ? `
                    <div class="form-group">
                        <label>Novo horário de fim:</label>
                        <input type="time" id="new-end-time" value="${adjustType === 'end' ? suggestedTime : activity.endTime}">
                    </div>
                    ` : ''}
                    
                    <p class="info-text">⚠️ Este ajuste é apenas para este dia específico.</p>
                </div>
                <div class="modal-actions">
                    <button onclick="closeTimeAdjustModal()" class="btn btn-outline">Cancelar</button>
                    <button onclick="confirmTimeAdjust('${dateKey}', ${activityIndex}, '${adjustType}')" class="btn btn-primary">
                        Ajustar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Fechar modal de evento
function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.remove();
    }
}

// Fechar modal de ajuste de tempo
function closeTimeAdjustModal() {
    const modal = document.getElementById('time-adjust-modal');
    if (modal) {
        modal.remove();
    }
}
