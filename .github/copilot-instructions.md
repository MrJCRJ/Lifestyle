# 🤖 Copilot Instructions for Lifestyle App

## Visão Geral do Projeto

- **Lifestyle App** é um aplicativo web para organização de rotina, focado em planejamento diário, saúde e bem-estar.
- Frontend 100% em HTML, CSS e JavaScript Vanilla. Não usa frameworks modernos.
- Dados do usuário são salvos apenas no `localStorage` do navegador.
- Estrutura modular: cada categoria (trabalho, estudo, hidratação, limpeza, etc.) tem arquivos JS, HTML e CSS próprios.

## Estrutura e Componentes-Chave

- **js/**: Lógica principal, separada por domínio (`core/`, `planner/`, `categories/`, `health/`, etc.).
- **components/**: HTMLs reutilizáveis para telas, modais e dashboards.
- **css/**: Estilos globais e específicos por categoria/componente.
- ****tests**/**: Testes unitários e E2E (Jest, DOM sandbox, mocks de localStorage).
- **Estratégias detalhadas**: Veja `ESTRATEGIA_MELHORIAS_SAUDE.md` para fluxos, dados e interfaces planejadas.

## Convenções e Padrões

- **Exportação para testes**: Funções JS relevantes expostas via `module.exports` para integração com Jest.
- **Testes DOM**: Testes simulam DOM real, inicializando HTML inline e manipulando diretamente elementos e eventos.
- **Dados**: Estruturas de dados (ex: cômodos, histórico de limpeza, perfil de usuário) seguem exemplos e schemas descritos em `ESTRATEGIA_MELHORIAS_SAUDE.md`.
- **Nomenclatura**: Use nomes descritivos em português para variáveis, funções e IDs de elementos.
- **Responsividade**: CSS prioriza mobile-first, usando variáveis e breakpoints customizados.

## Workflows Essenciais

- **Build/Servir local**: Não há build. Use `python -m http.server 8000` ou similar para servir localmente.
- **Testes**: `npm test` (todos), `npm run test:watch` (modo watch), `npm run test:coverage` (cobertura).
- **Deploy**: Vercel (`vercel.json` já configurado).

## Integrações e Pontos de Atenção

- **Sem backend**: Toda lógica e dados são client-side.
- **Importação/Exportação**: Funções para backup/restauração de dados em JSON.
- **Novos módulos**: Siga o padrão de separar JS, HTML e CSS por categoria e expor funções para testes.
- **Referências**: Consulte `README.md` e `ESTRATEGIA_MELHORIAS_SAUDE.md` para exemplos de fluxos, dados e interfaces.

## Exemplos de Padrão

- Exporte funções para testes:
  ```js
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { minhaFuncao, outraFuncao };
  }
  ```
- Teste DOM:
  ```js
  document.body.innerHTML = `<div id="meu-elemento"></div>`;
  // ... manipule e teste
  ```

> Mantenha instruções concisas, siga padrões existentes e consulte arquivos de estratégia para decisões de arquitetura.
