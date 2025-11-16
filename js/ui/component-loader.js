/**
 * Component Loader
 * Sistema para carregar componentes HTML modulares com lazy loading
 */

const ComponentLoader = {
    // Cache de componentes já carregados
    loadedComponents: new Set(),

    /**
     * Carrega um componente HTML e injeta no elemento especificado
     * @param {string} componentPath - Caminho do arquivo HTML do componente
     * @param {string} targetSelector - Seletor CSS do elemento alvo
     * @param {boolean} showSkeleton - Se deve mostrar skeleton antes do carregamento
     * @returns {Promise<void>}
     */
    async loadComponent(componentPath, targetSelector, showSkeleton = false) {
        // Verificar se já foi carregado
        if (this.loadedComponents.has(componentPath)) {
            console.log(`[ComponentLoader] Componente já carregado: ${componentPath}`);
            return;
        }

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            throw new Error(`Elemento alvo não encontrado: ${targetSelector}`);
        }

        // Adicionar skeleton se solicitado
        let skeletonId;
        if (showSkeleton) {
            skeletonId = `skeleton-${Date.now()}`;
            targetElement.insertAdjacentHTML('beforeend', `
                <div id="${skeletonId}" class="skeleton-screen">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 60%"></div>
                    <div class="skeleton skeleton-input"></div>
                    <div class="skeleton skeleton-input"></div>
                </div>
            `);
        }

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar componente: ${componentPath}`);
            }
            const html = await response.text();

            // Remover skeleton se existir
            if (skeletonId) {
                const skeleton = document.getElementById(skeletonId);
                if (skeleton) skeleton.remove();
            }

            // Usar insertAdjacentHTML para não sobrescrever conteúdo existente
            targetElement.insertAdjacentHTML('beforeend', html);

            // Adicionar ao cache
            this.loadedComponents.add(componentPath);
            console.log(`[ComponentLoader] ✅ Carregado: ${componentPath}`);
        } catch (error) {
            // Remover skeleton em caso de erro
            if (skeletonId) {
                const skeleton = document.getElementById(skeletonId);
                if (skeleton) skeleton.remove();
            }
            console.error(`Erro ao carregar componente ${componentPath}:`, error);
            throw error;
        }
    },

    /**
     * Carrega múltiplos componentes em paralelo (agora em série para garantir ordem)
     * @param {Array<{path: string, target: string}>} components - Array de componentes para carregar
     * @returns {Promise<void>}
     */
    async loadComponents(components) {
        // Carregar em série para garantir que não sobrescreva
        for (const { path, target } of components) {
            await this.appendComponent(path, target);
        }
    },

    /**
     * Carrega um componente e adiciona ao final do elemento alvo
     * @param {string} componentPath - Caminho do arquivo HTML do componente
     * @param {string} targetSelector - Seletor CSS do elemento alvo
     * @returns {Promise<void>}
     */
    async appendComponent(componentPath, targetSelector) {
        return this.loadComponent(componentPath, targetSelector);
    },

    /**
     * Verifica se um componente já foi carregado
     * @param {string} componentPath - Caminho do componente
     * @returns {boolean}
     */
    isLoaded(componentPath) {
        return this.loadedComponents.has(componentPath);
    },

    /**
     * Carrega componentes de setup sob demanda
     * @returns {Promise<void>}
     */
    async loadSetupComponents() {
        console.log('[ComponentLoader] 🔄 Carregando componentes de Setup...');

        // Carregar CSS primeiro
        if (window.CSSLoader) {
            await window.CSSLoader.loadSetupCSS();
        }

        const setupComponents = [
            'components/setup/sleep.html',
            'components/setup/work.html',
            'components/setup/study.html',
            'components/setup/cleaning.html',
            'components/setup/hobby.html',
            'components/setup/meals.html',
            'components/setup/hydration.html',
            'components/setup/projects.html',
            'components/setup/exercise.html'
        ];

        for (const component of setupComponents) {
            await this.appendComponent(component, '#app');
        }
        console.log('[ComponentLoader] ✅ Setup components carregados');
    },

    /**
     * Carrega componentes de planejamento sob demanda
     * @returns {Promise<void>}
     */
    async loadPlannerComponents() {
        console.log('[ComponentLoader] 🔄 Carregando componentes de Planejamento...');

        // Carregar CSS primeiro
        if (window.CSSLoader) {
            await window.CSSLoader.loadPlannerCSS();
        }

        const plannerComponents = [
            'components/planner/navbar.html',
            'components/planner/sleep.html',
            'components/planner/work.html',
            'components/planner/study.html',
            'components/planner/cleaning.html',
            'components/planner/hygiene.html',
            'components/planner/hobby.html',
            'components/planner/projects.html',
            'components/planner/meals.html',
            'components/planner/hydration.html',
            'components/planner/exercise.html',
            'components/planner/edit.html'
        ];

        for (const component of plannerComponents) {
            await this.appendComponent(component, '#app');
        }
        console.log('[ComponentLoader] ✅ Planner components carregados');
    }
};

/**
 * Inicializa e carrega apenas componentes ESSENCIAIS da aplicação
 * Componentes de Setup e Planejamento são carregados sob demanda (lazy loading)
 */
async function initializeComponents() {
    try {
        console.log('[ComponentLoader] 🚀 Iniciando carregamento de componentes essenciais...');
        const startTime = performance.now();

        // === COMPONENTES ESSENCIAIS (carregados imediatamente) ===

        // 1. Header (sempre visível)
        await ComponentLoader.loadComponent('components/header.html', 'header');

        // 2. Schedule Screen (tela principal)
        await ComponentLoader.appendComponent('components/schedule-screen.html', '#app');

        // 3. Footer (sempre visível)
        await ComponentLoader.loadComponent('components/footer.html', 'footer');

        // 4. Modal de configurações (pode ser acessado a qualquer momento)
        await ComponentLoader.appendComponent('components/settings-modal.html', 'body');

        // 5. Modal de calendário (pode ser acessado a qualquer momento)
        await ComponentLoader.appendComponent('components/calendar-modal.html', 'body');

        // 6. Overlay de modo foco (pode ser acessado a qualquer momento)
        await ComponentLoader.appendComponent('components/focus-mode-overlay.html', 'body');

        // 7. Modal de registro de peso (pode ser acessado a qualquer momento)
        await ComponentLoader.appendComponent('components/health/weight-registration-modal.html', 'body');

        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`[ComponentLoader] ✅ Componentes essenciais carregados em ${loadTime}ms`);

        // Pequeno delay para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 50));

        // Disparar evento de componentes carregados
        document.dispatchEvent(new Event('componentsLoaded'));

        // === ADICIONAR SKELETONS PARA LAZY LOADING ===
        // Reservar espaço visual para prevenir layout shifts
        addLazyLoadingSkeletons();

        // === LAZY LOADING (carregado em background) ===
        // Carregar componentes não essenciais em background após a inicialização
        setTimeout(() => {
            loadNonEssentialComponents();
        }, 100);

    } catch (error) {
        console.error('Erro ao inicializar componentes:', error);
        alert('Erro ao carregar a aplicação. Por favor, recarregue a página.');
        throw error;
    }
}

/**
 * Adiciona skeletons para componentes que serão lazy loaded
 * Isso previne layout shifts reservando espaço visual
 */
function addLazyLoadingSkeletons() {
    const app = document.querySelector('#app');
    if (!app) return;

    // Não adicionar skeletons se os componentes já foram carregados
    if (ComponentLoader.loadedComponents.has('components/setup/sleep.html')) {
        return;
    }

    // Skeleton mínimo que reserva espaço sem ser intrusivo
    const skeletonHTML = `
        <div id="lazy-loading-placeholder" style="min-height: 200px; visibility: hidden;">
            <!-- Placeholder invisível para reservar espaço -->
        </div>
    `;

    app.insertAdjacentHTML('beforeend', skeletonHTML);
}

/**
 * Carrega componentes não essenciais em background (lazy loading)
 */
async function loadNonEssentialComponents() {
    try {
        console.log('[ComponentLoader] 🔄 Iniciando lazy loading de componentes não essenciais...');
        const startTime = performance.now();

        // Remover placeholder se existir
        const placeholder = document.getElementById('lazy-loading-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Carregar Setup e Planner components em paralelo para melhor performance
        await Promise.all([
            ComponentLoader.loadSetupComponents(),
            ComponentLoader.loadPlannerComponents()
        ]);

        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`[ComponentLoader] ✅ Lazy loading concluído em ${loadTime}ms`);

        // Disparar evento de todos os componentes carregados
        document.dispatchEvent(new Event('allComponentsLoaded'));
    } catch (error) {
        console.error('[ComponentLoader] ⚠️ Erro no lazy loading:', error);
        // Não bloquear a aplicação se o lazy loading falhar
    }
}

/**
 * Garante que componentes de setup estão carregados antes de usar
 * @returns {Promise<void>}
 */
async function ensureSetupComponentsLoaded() {
    if (!ComponentLoader.isLoaded('components/setup/sleep.html')) {
        console.log('[ComponentLoader] Setup não carregado, carregando agora...');
        await ComponentLoader.loadSetupComponents();
    }
}

/**
 * Garante que componentes de planejamento estão carregados antes de usar
 * @returns {Promise<void>}
 */
async function ensurePlannerComponentsLoaded() {
    if (!ComponentLoader.isLoaded('components/planner/navbar.html')) {
        console.log('[ComponentLoader] Planner não carregado, carregando agora...');
        await ComponentLoader.loadPlannerComponents();
    }
}
