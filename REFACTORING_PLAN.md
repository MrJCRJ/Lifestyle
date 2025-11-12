# 🔧 Plano de Refatoração - Lifestyle App

## 📊 Análise de Código

### 🔴 Problemas Identificados:

1. **Duplicação de Código**

   - `js/ui/schedule-render.js` (382 linhas) tem funções duplicadas de `activity-components.js`
   - Funções duplicadas:
     - `renderTrackingInfo()`
     - `renderActivityInfo()`
     - `renderHydrationActions()`
     - `renderSimpleTrackingActions()`
     - `renderActivityActions()`
     - `getTypeLabel()`

2. **Arquivos Grandes que Precisam de Modularização**

   - `js/ui/schedule-render.js` (382 linhas) ⚠️
   - `js/planner/planner-wizard.js` (381 linhas) ⚠️
   - `js/ui/dashboard.js` (323 linhas) ⚠️
   - `js/utils/category-manager.js` (280 linhas) ⚠️

3. **Baixa Cobertura de Testes**
   - Arquivos sem testes:
     - `js/ui/dashboard.js`
     - `js/ui/tracking-modals.js`
     - `js/core/data-transfer.js`
     - `js/utils/duration-utils.js`
     - `js/utils/free-time.js`

## ✅ Ações de Refatoração

### 1. Remover Duplicações (PRIORIDADE ALTA)

#### 1.1. Consolidar Componentes de Atividade

- [x] Manter `activity-components.js` como fonte única
- [ ] Remover funções duplicadas de `schedule-render.js`
- [ ] Atualizar imports em `schedule-render.js`
- [ ] Testar integração

#### 1.2. Verificar schedule-builder vs schedule-generator

- [ ] Comparar funções
- [ ] Consolidar se houver duplicação

### 2. Modularizar Arquivos Grandes

#### 2.1. Refatorar `planner-wizard.js` (381 linhas)

- [ ] Extrair lógica de trabalho para `planner-work.js`
- [ ] Extrair lógica de estudo para `planner-study.js`
- [ ] Manter apenas navegação e coordenação no wizard

#### 2.2. Refatorar `schedule-render.js` (382 linhas)

- [ ] Extrair renderização de slots de tempo livre
- [ ] Extrair lógica de countdown timers
- [ ] Criar módulo `schedule-render-helpers.js`

#### 2.3. Modularizar `dashboard.js` (323 linhas)

- [ ] Extrair cálculo de estatísticas para `dashboard-stats.js`
- [ ] Extrair renderização de gráficos para `dashboard-charts.js`
- [ ] Extrair insights para `dashboard-insights.js`

### 3. Aumentar Cobertura de Testes

#### 3.1. Criar Testes Unitários

- [ ] `duration-utils.test.js` - 100% cobertura
- [ ] `free-time.test.js` - funções críticas
- [ ] `dashboard-stats.test.js` - cálculos
- [ ] `data-transfer.test.js` - import/export

#### 3.2. Criar Testes de Integração

- [ ] `tracking-flow.test.js` - marcar atividades
- [ ] `planner-navigation.test.js` - fluxo completo
- [ ] `dashboard-integration.test.js` - carregamento de stats

#### 3.3. Criar Testes E2E Adicionais

- [ ] `e2e-tracking.test.js` - rastreamento completo
- [ ] `e2e-import-export.test.js` - transferência de dados
- [ ] `e2e-dashboard.test.js` - visualização de estatísticas

### 4. Otimizações de Código

#### 4.1. Extrair Constantes

- [ ] Criar `constants.js` com:
  - Tipos de atividade
  - Ícones
  - Mensagens padrão
  - Limites e thresholds

#### 4.2. Padronizar Nomenclatura

- [ ] Revisar nomes de funções (camelCase consistente)
- [ ] Padronizar prefixos (planner-, setup-, etc)
- [ ] Documentar convenções

#### 4.3. Adicionar JSDoc

- [ ] Documentar funções públicas principais
- [ ] Adicionar tipos de parâmetros
- [ ] Exemplos de uso

### 5. Melhorias de Arquitetura

#### 5.1. Separação de Responsabilidades

- [ ] Garantir que UI só renderiza
- [ ] Garantir que utils só processam dados
- [ ] Garantir que core só gerencia estado

#### 5.2. Reduzir Dependências Circulares

- [ ] Mapear dependências entre módulos
- [ ] Identificar ciclos
- [ ] Refatorar para dependências unidirecionais

## 📈 Métricas de Sucesso

- ✅ 0 funções duplicadas
- ✅ Nenhum arquivo > 300 linhas
- ✅ Cobertura de testes > 80%
- ✅ Todos os testes E2E passando
- ✅ Tempo de build < 3s

## 🎯 Ordem de Execução

1. **Fase 1: Limpeza** (30min)

   - Remover duplicações
   - Consolidar activity-components

2. **Fase 2: Modularização** (1h)

   - Quebrar arquivos grandes
   - Criar módulos específicos

3. **Fase 3: Testes** (1h)

   - Criar testes unitários faltantes
   - Aumentar cobertura

4. **Fase 4: Documentação** (30min)
   - Adicionar JSDoc
   - Atualizar README

## 🔄 Status Atual

- Testes: 110/110 passando ✅
- Cobertura estimada: ~40%
- Duplicações: ~200 linhas
- Arquivos grandes: 4
