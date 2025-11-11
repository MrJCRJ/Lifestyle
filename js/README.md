# 📁 Estrutura de Arquivos JavaScript

Organização modular do código JavaScript do projeto Lifestyle.

## 📂 Estrutura de Pastas

```
js/
├── categories/      # Gerenciamento de categorias de atividades
├── core/           # Módulos principais do sistema
├── planner/        # Sistema de planejamento de dias
├── schedule/       # Geração e gerenciamento de cronogramas
├── tracking/       # Rastreamento de atividades
├── ui/             # Interface do usuário e componentes visuais
├── utils/          # Utilitários e funções auxiliares
└── main.js         # Ponto de entrada da aplicação
```

## 📋 Detalhamento das Pastas

### 🏷️ categories/

Gerenciamento das diferentes categorias de atividades do dia:

- **cleaning.js** - Limpeza e organização doméstica
- **exercise.js** - Exercícios físicos (horários e tipos)
- **hydration.js** - Hidratação (cálculo de água baseado em peso/altura)
- **meals.js** - Alimentação (horários de refeições)
- **study.js** - Estudos e cursos
- **work.js** - Trabalho e bicos

### 🎯 core/

Módulos essenciais do sistema:

- **data-transfer.js** - Exportação e importação de dados (backup/restore)
- **navigation.js** - Navegação entre telas e fluxo da aplicação
- **settings.js** - Gerenciamento de configurações (apenas backup)
- **state.js** - Estado global da aplicação

### 📅 planner/

Sistema de planejamento de dias futuros:

- **planner.js** - Interface principal do planejador
- **planner-data.js** - Gerenciamento de dados do planejador
- **planner-wizard.js** - Fluxo wizard do planejamento (passo a passo)

### 📊 schedule/

Geração e gerenciamento de cronogramas:

- **schedule-events.js** - Eventos e alertas do cronograma
- **schedule-generator.js** - Geração de cronogramas a partir dos dados
- **schedule-planner.js** - Planejamento de cronogramas

### 📈 tracking/

Rastreamento de atividades:

- **tracking-actions.js** - Ações de rastreamento (iniciar, pausar, concluir)

### 🎨 ui/

Interface do usuário e componentes visuais:

- **component-loader.js** - Carregamento dinâmico de componentes HTML
- **dashboard.js** - Dashboard e visualização de estatísticas
- **schedule-display.js** - Exibição de cronogramas
- **schedule-filters.js** - Filtros de cronogramas (hoje, semana, mês)
- **schedule-render.js** - Renderização visual dos cronogramas
- **tracking-modals.js** - Modais de rastreamento

### 🛠️ utils/

Utilitários e funções auxiliares:

- **forms.js** - Funções auxiliares para formulários
- **free-time.js** - Cálculo de tempo livre
- **time-utils.js** - Utilitários de manipulação de tempo

## 🔄 Fluxo de Categorias

### Setup Diário (Primeira Configuração)

1. 😴 Sono → `categories/`
2. 💼 Trabalho → `categories/work.js`
3. 📚 Estudos → `categories/study.js`
4. 🧹 Limpeza → `categories/cleaning.js`
5. 🍽️ Refeições → `categories/meals.js`
6. 💧 Hidratação → `categories/hydration.js`
7. 💪 Exercícios → `categories/exercise.js`
8. 📊 Cronograma Gerado

### Planejamento de Dias Futuros

Mesmo fluxo, mas usando as versões "planner" de cada tela.

## 🆕 Novas Funcionalidades

### 🍽️ Alimentação (meals.js)

- Define quantidade de refeições por dia
- Horários dinâmicos (adicionar/remover)
- Exibição: "🍽️ Refeição 1, 2, 3..."

### 💧 Hidratação (hydration.js)

- Solicita peso (kg) e altura (cm)
- Cálculo automático: **35ml × peso × fator de altura**
- Exibe recomendação em ml e litros
- Salva perfil do usuário permanentemente

### 💪 Exercícios (exercise.js)

- Horário de início e fim
- Tipo de exercício (Musculação, Corrida, Yoga, etc.)
- Exibição: "💪 [Tipo do Exercício]"

## 📝 Convenções

### Nomenclatura de Funções

- **Setup diário**: `saveWork()`, `saveStudy()`, etc.
- **Planejador**: `savePlannerWork()`, `savePlannerStudy()`, etc.
- **Toggle forms**: `toggleWorkForm()`, `togglePlannerWorkForm()`, etc.

### Navegação

- `prevStep(current)` - Voltar no setup diário
- `prevPlannerStep(current)` - Voltar no planejador

## 🔧 Dependências

### Ordem de Carregamento (index.html)

1. component-loader.js (UI)
2. core/\* (Estado e navegação)
3. utils/\* (Utilitários)
4. ui/\* (Interface)
5. categories/\* (Categorias)
6. schedule/\* (Cronogramas)
7. planner/\* (Planejamento)
8. tracking/\* (Rastreamento)
9. main.js (Inicialização)

## 🎨 CSS Relacionado

### Novos Estilos

- `.recommendation-box` - Caixa de recomendação de água
- `.time-slot` - Container para horários de refeições
- `.btn-remove` - Botão de remover horário
- Animação `fadeIn` para recomendações

## 📚 Referências

- **Estado Global**: `appState` (definido em `core/state.js`)
- **LocalStorage**: Gerenciado por `core/data-transfer.js`
- **Navegação**: Controlada por `core/navigation.js`
- **Componentes HTML**: `components/setup-screens.html` e `components/planner-screens.html`
