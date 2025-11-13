/**
 * CSS Loader
 * Sistema para carregar CSS sob demanda (lazy loading)
 */

const CSSLoader = {
  // Cache de CSS já carregados
  loadedStyles: new Set(),

  /**
   * Carrega um arquivo CSS dinamicamente
   * @param {string} cssPath - Caminho do arquivo CSS
   * @param {string} id - ID único para o link element
   * @returns {Promise<void>}
   */
  async loadCSS(cssPath, id = null) {
    // Verificar se já foi carregado
    if (this.loadedStyles.has(cssPath)) {
      console.log(`[CSSLoader] CSS já carregado: ${cssPath}`);
      return;
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      if (id) link.id = id;

      link.onload = () => {
        this.loadedStyles.add(cssPath);
        console.log(`[CSSLoader] ✅ CSS carregado: ${cssPath}`);
        resolve();
      };

      link.onerror = () => {
        console.error(`[CSSLoader] ❌ Erro ao carregar CSS: ${cssPath}`);
        reject(new Error(`Failed to load CSS: ${cssPath}`));
      };

      document.head.appendChild(link);
    });
  },

  /**
   * Carrega CSS para componentes de setup
   * @returns {Promise<void>}
   */
  async loadSetupCSS() {
    await this.loadCSS('css/components/setup.css', 'setup-styles');
  },

  /**
   * Carrega CSS para componentes de planejamento
   * @returns {Promise<void>}
   */
  async loadPlannerCSS() {
    await this.loadCSS('css/components/planner.css', 'planner-styles');
  },

  /**
   * Verifica se um CSS já foi carregado
   * @param {string} cssPath - Caminho do CSS
   * @returns {boolean}
   */
  isLoaded(cssPath) {
    return this.loadedStyles.has(cssPath);
  },

  /**
   * Remove um CSS carregado dinamicamente
   * @param {string} id - ID do link element
   */
  unloadCSS(id) {
    const link = document.getElementById(id);
    if (link) {
      link.remove();
      // Remover do cache também
      const cssPath = link.href.replace(window.location.origin + '/', '');
      this.loadedStyles.delete(cssPath);
      console.log(`[CSSLoader] 🗑️ CSS removido: ${id}`);
    }
  }
};

// Exportar para uso global
window.CSSLoader = CSSLoader;
