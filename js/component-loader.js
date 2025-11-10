/**
 * Component Loader
 * Sistema para carregar componentes HTML modulares
 */

const ComponentLoader = {
    /**
     * Carrega um componente HTML e injeta no elemento especificado
     * @param {string} componentPath - Caminho do arquivo HTML do componente
     * @param {string} targetSelector - Seletor CSS do elemento alvo
     * @returns {Promise<void>}
     */
    async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar componente: ${componentPath}`);
            }
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);

            if (!targetElement) {
                throw new Error(`Elemento alvo não encontrado: ${targetSelector}`);
            }

            // Usar insertAdjacentHTML para não sobrescrever conteúdo existente
            targetElement.insertAdjacentHTML('beforeend', html);
        } catch (error) {
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
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar componente: ${componentPath}`);
            }
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);

            if (!targetElement) {
                throw new Error(`Elemento alvo não encontrado: ${targetSelector}`);
            }

            targetElement.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error(`Erro ao adicionar componente ${componentPath}:`, error);
            throw error;
        }
    }
};

/**
 * Inicializa e carrega todos os componentes da aplicação
 */
/**
 * Inicializa e carrega todos os componentes da aplicação
 */
async function initializeComponents() {
    try {
        // Carregar header
        await ComponentLoader.loadComponent('components/header.html', 'header');

        // Carregar telas no main (adiciona ao #app)
        await ComponentLoader.appendComponent('components/setup-screens.html', '#app');
        await ComponentLoader.appendComponent('components/planner-screens.html', '#app');
        await ComponentLoader.appendComponent('components/schedule-screen.html', '#app');

        // Carregar footer
        await ComponentLoader.loadComponent('components/footer.html', 'footer');

        // Carregar modal de configurações
        await ComponentLoader.appendComponent('components/settings-modal.html', 'body');

        // Pequeno delay para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 50));

        // Disparar evento de componentes carregados
        document.dispatchEvent(new Event('componentsLoaded'));
    } catch (error) {
        console.error('Erro ao inicializar componentes:', error);
        alert('Erro ao carregar a aplicação. Por favor, recarregue a página.');
        throw error;
    }
}
