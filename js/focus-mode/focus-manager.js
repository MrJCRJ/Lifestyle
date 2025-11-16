/**
 * Focus Mode Manager
 * Sistema para visualização detalhada e focada de atividades do cronograma
 * Base para todas as funcionalidades de tracking e interação com atividades
 */

const FocusMode = {
  // Estado atual do modo foco
  state: {
    active: false,
    activityId: null,
    scheduleDate: null,
    activityIndex: null,
    activityData: null
  },

  // Timer interval
  timerInterval: null,

  /**
   * Abrir modo foco para uma atividade específica
   * @param {string} scheduleDate - Data do cronograma (YYYY-MM-DD)
   * @param {number} activityIndex - Índice da atividade no array
   */
  open(scheduleDate, activityIndex) {
    const schedule = appState.userData.dailySchedules[scheduleDate];
    if (!schedule || !schedule.activities) {
      console.error('Schedule not found:', scheduleDate);
      return;
    }

    const activity = schedule.activities[activityIndex];
    if (!activity) {
      console.error('Activity not found at index:', activityIndex);
      return;
    }

    // Atualizar estado
    this.state = {
      active: true,
      activityId: activity.id,
      scheduleDate: scheduleDate,
      activityIndex: activityIndex,
      activityData: activity
    };

    // Renderizar interface
    this.render();

    // Iniciar timer se atividade estiver ativa
    if (this.isActiveNow()) {
      this.startTimer();
    }

    // Mostrar overlay
    this.showOverlay();
  },

  /**
   * Fechar modo foco
   */
  close() {
    this.stopTimer();
    this.state.active = false;
    this.hideOverlay();

    // Recarregar cronograma para mostrar atualizações
    if (typeof showScheduleView === 'function') {
      showScheduleView(carouselState.filter || 'week');
    }
  },

  /**
   * Renderizar interface do modo foco
   */
  render() {
    const overlay = document.getElementById('focus-mode-overlay');
    if (!overlay) {
      console.error('Focus mode overlay not found');
      return;
    }

    const activity = this.state.activityData;
    const type = activity.type;

    // Usar renderizador específico ou genérico
    const renderer = FocusRenderers[type] || FocusRenderers.generic;
    const html = renderer(activity, this.state);

    overlay.innerHTML = html;
  },

  /**
   * Verificar se a atividade está ativa agora
   */
  isActiveNow() {
    const activity = this.state.activityData;
    const now = new Date();
    const todayKey = getDateKey(now);

    // Apenas ativo se for hoje e dentro do horário
    if (this.state.scheduleDate !== todayKey) {
      return false;
    }

    return isEventActive(activity.startTime, activity.endTime);
  },

  /**
   * Iniciar timer
   */
  startTimer() {
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  },

  /**
   * Parar timer
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  /**
   * Atualizar timer e progresso
   */
  updateTimer() {
    const activity = this.state.activityData;
    const remaining = getTimeRemaining(activity.endTime);

    // Atualizar UI do timer
    const timerEl = document.getElementById('focus-timer');
    if (timerEl) {
      timerEl.textContent = remaining.text;
    }

    // Atualizar barra de progresso
    const progress = this.calculateProgress();
    const progressBar = document.getElementById('focus-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Notificação quando terminar
    if (remaining.minutes === 0 && remaining.seconds === 0) {
      this.onTimerComplete();
    }
  },

  /**
   * Calcular progresso da atividade (0-100%)
   */
  calculateProgress() {
    const activity = this.state.activityData;
    const start = parseTimeToMinutes(activity.startTime);
    const end = parseTimeToMinutes(activity.endTime);
    const now = parseTimeToMinutes(getCurrentTime());

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  },

  /**
   * Callback quando timer completa
   */
  onTimerComplete() {
    this.stopTimer();

    // Notificação
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Atividade Concluída! ✅', {
        body: `${this.state.activityData.name} terminou`,
        icon: '/icon-192.png',
        tag: 'focus-mode-complete'
      });
    }

    // Som (opcional)
    this.playCompletionSound();
  },

  /**
   * Tocar som de conclusão
   */
  playCompletionSound() {
    // Usar Web Audio API para som simples
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  },

  /**
   * Marcar atividade como completa
   */
  markComplete() {
    markEventSimpleComplete(this.state.scheduleDate, this.state.activityIndex);
    this.close();
  },

  /**
   * Marcar atividade como incompleta
   */
  markIncomplete() {
    markEventSimpleIncomplete(this.state.scheduleDate, this.state.activityIndex);
    this.close();
  },

  /**
   * Adicionar nota à atividade
   */
  addNote(note) {
    const schedule = appState.userData.dailySchedules[this.state.scheduleDate];
    const activity = schedule.activities[this.state.activityIndex];

    if (!activity.simpleTracking) {
      activity.simpleTracking = {};
    }
    activity.simpleTracking.notes = note;

    saveToStorage();
  },

  /**
   * Mostrar overlay
   */
  showOverlay() {
    const overlay = document.getElementById('focus-mode-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Esconder overlay
   */
  hideOverlay() {
    const overlay = document.getElementById('focus-mode-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};

/**
 * Renderizadores específicos por tipo de atividade
 */
const FocusRenderers = {
  /**
   * Renderizador genérico (trabalho, estudo, projetos, hobby, limpeza, etc)
   */
  generic(activity, state) {
    const isActive = FocusMode.isActiveNow();
    const progress = isActive ? FocusMode.calculateProgress() : 0;
    const remaining = isActive ? getTimeRemaining(activity.endTime) : null;

    const statusClass = activity.simpleTracking?.status || 'pending';
    const hasNotes = activity.simpleTracking?.notes || '';

    return `
      <div class="focus-modal">
        <div class="focus-header">
          <h2>${activity.name}</h2>
          <button class="focus-close" onclick="FocusMode.close()">✕</button>
        </div>

        <div class="focus-body">
          <!-- Horário -->
          <div class="focus-time-info">
            <div class="time-badge">
              <span class="icon">🕐</span>
              <span>${activity.startTime} - ${activity.endTime}</span>
            </div>
            ${activity.duration ? `<div class="duration-badge">${activity.duration}</div>` : ''}
          </div>

          ${isActive ? `
            <!-- Timer e Progresso (apenas se ativa agora) -->
            <div class="focus-timer-section">
              <div class="timer-display">
                <div class="timer-label">Tempo restante:</div>
                <div class="timer-value" id="focus-timer">${remaining.text}</div>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" id="focus-progress-bar" style="width: ${progress}%"></div>
              </div>
              <div class="progress-label">${progress}% concluído</div>
            </div>
          ` : `
            <!-- Atividade futura ou passada -->
            <div class="focus-inactive-message">
              ${state.scheduleDate < getDateKey(new Date()) 
                ? '📅 Esta atividade já passou' 
                : state.scheduleDate > getDateKey(new Date())
                  ? '📅 Esta atividade é para outro dia'
                  : '⏰ Esta atividade ainda não começou'}
            </div>
          `}

          <!-- Descrição/Notas da atividade -->
          ${activity.description || activity.notes ? `
            <div class="focus-description">
              <h3>📝 Detalhes:</h3>
              <p>${activity.description || activity.notes}</p>
            </div>
          ` : ''}

          <!-- Notas do usuário -->
          <div class="focus-notes-section">
            <h3>💭 Observações:</h3>
            <textarea 
              id="focus-notes-input" 
              placeholder="Adicione observações sobre esta atividade..."
              rows="4"
            >${hasNotes}</textarea>
            <button 
              class="btn btn-outline btn-sm" 
              onclick="FocusMode.addNote(document.getElementById('focus-notes-input').value)"
            >
              Salvar Nota
            </button>
          </div>

          <!-- Ações -->
          <div class="focus-actions">
            ${statusClass !== 'complete' ? `
              <button class="btn btn-success" onclick="FocusMode.markComplete()">
                ✅ Marcar como Concluída
              </button>
            ` : `
              <button class="btn btn-outline" onclick="FocusMode.markIncomplete()">
                ↩️ Desmarcar
              </button>
            `}
            <button class="btn btn-outline" onclick="FocusMode.close()">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Renderizadores específicos serão adicionados depois
  // meal: função para refeições (com receita)
  // exercise: função para exercícios (com séries)
  // hydration: função para hidratação (com progresso)
};

// Expor globalmente
window.FocusMode = FocusMode;
window.FocusRenderers = FocusRenderers;
