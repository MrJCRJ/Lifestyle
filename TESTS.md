# Testes Automatizados - Lifestyle App

## 📋 Resumo

Este documento descreve a implementação de testes automatizados para o aplicativo Lifestyle, incluindo a identificação e correção de um bug crítico no formulário de trabalho.

## 🐛 Bug Identificado e Corrigido

### Problema

O formulário de trabalho estava informando erroneamente que os dados não foram preenchidos, mesmo quando o usuário preencheu todos os campos corretamente.

### Causa Raiz

Foram identificados **dois problemas principais**:

1. **Inconsistência entre duas implementações** de formulários no aplicativo:

   - **Setup Inicial** (`category-manager.js`): Usa `createCategoryCardHTML` que cria elementos com **classes CSS** (`.job-name`, `.job-time-start`, etc.)
   - **Planejador** (`forms.js`): Usa `createJobCardHTML` que cria elementos com **IDs** (`#planner-job-name-1`, etc.)

2. **Conflito de definições de funções**:
   - Havia **duas** definições de `collectJobsData`:
     - Uma em `js/utils/forms.js` (carregado primeiro)
     - Outra em `js/utils/category-manager.js` (carregado depois)
   - Como `category-manager.js` é carregado **depois** no HTML, ele **sobrescreve** a função de `forms.js`
   - A função em `category-manager.js` só funcionava com classes, causando o erro

### Solução Implementada

1. **Removemos** as funções duplicadas `collectJobsData` e `collectStudiesData` de `/js/utils/forms.js`
2. **Melhoramos** a função `collectCategoryData` em `/js/utils/category-manager.js` com:
   - Validações mais robustas
   - Mensagens de erro mais descritivas
   - Logs de debug para facilitar diagnóstico
   - Verificação explícita da existência de elementos antes de acessar propriedades

A função agora valida corretamente:

- Existência do container
- Presença de slots (.item-card)
- Existência de inputs de nome
- Existência de grupos de horários
- Valores preenchidos em todos os campos

## 🧪 Suíte de Testes

### Estrutura

```
__tests__/
├── category-manager-real.test.js # Testes da função real usada no app (7 testes)
├── planner-work.test.js           # Testes do formulário de trabalho (planejador) (8 testes)
├── work-inconsistency.test.js     # Demonstração do bug original (3 testes)
├── work-fix-validation.test.js    # Validação da correção (4 testes)
├── integration-real-setup.test.js # Testes de integração do setup (5 testes)
├── full-flow-setup-to-schedule.test.js # Fluxo completo do usuário (3 testes)
├── debug-real-issue.test.js       # Testes de debug detalhados (3 testes)
├── study.test.js                  # Testes de formulário de estudos (4 testes)
├── hydration.test.js              # Testes de hidratação (7 testes)
├── exercise.test.js               # Testes de exercícios (4 testes)
├── meals.test.js                  # Testes de refeições (6 testes)
└── cleaning.test.js               # Testes de limpeza (5 testes)
```

### Cobertura de Testes

#### ✅ Função Real do category-manager.js (7 testes)

- Coletar dados preenchidos corretamente
- Detectar quando não há slots
- Detectar nome vazio
- Detectar horários vazios
- Coletar múltiplos trabalhos
- Processar dados pré-preenchidos
- Fazer trim em nomes com espaços

#### ✅ Formulário de Trabalho (15 testes totais)

- Adicionar slots de trabalho vazio
- Encontrar inputs por ID
- Coletar dados preenchidos
- Validar nome obrigatório
- Validar horários obrigatórios
- Trabalho com dados pré-existentes
- Múltiplos trabalhos
- Compatibilidade com classes e IDs

#### ✅ Testes de Integração e Debug (11 testes)

- Integração real do setup
- Fluxo completo do usuário
- Testes de debug detalhados
- Verificação de persistência de dados
- Validação de whitespace/trim

#### ✅ Formulário de Estudos (4 testes)

- Adicionar slot de estudo
- Validar nome do curso obrigatório
- Validar horários obrigatórios
- Coletar dados corretamente

#### ✅ Formulário de Hidratação (7 testes)

- Validar meta de água obrigatória
- Validar intervalo obrigatório
- Validar horários obrigatórios
- Validar faixa de meta (500ml - 5000ml)
- Validar faixa de intervalo (30 - 240 min)
- Coletar dados corretamente

#### ✅ Formulário de Exercícios (4 testes)

- Validar tipo de exercício obrigatório
- Validar horários obrigatórios
- Coletar dados com notas
- Permitir exercício sem notas

#### ✅ Formulário de Refeições (6 testes)

- Validar seleção obrigatória
- Permitir não fazer refeições
- Validar quantidade obrigatória
- Validar faixa de refeições (1-8)
- Coletar dados corretamente

#### ✅ Formulário de Limpeza (5 testes)

- Validar seleção obrigatória
- Permitir não fazer limpeza
- Validar horários quando selecionado
- Coletar dados com notas
- Permitir limpeza sem notas

### Resultados

```
Test Suites: 12 passed, 12 total
Tests:       58 passed, 58 total
Snapshots:   0 total
Time:        ~1.8s
```

## 🚀 Como Executar os Testes

### Instalar Dependências

```bash
npm install
```

### Executar Todos os Testes

```bash
npm test
```

### Executar Testes em Modo Watch

```bash
npm run test:watch
```

### Gerar Relatório de Cobertura

```bash
npm run test:coverage
```

O relatório de cobertura será gerado na pasta `coverage/`.

## 🛠️ Tecnologias Utilizadas

- **Jest** v29.7.0 - Framework de testes
- **jest-environment-jsdom** v29.7.0 - Simulação do DOM para testes
- **@jest/globals** v29.7.0 - Utilitários de teste

## 📝 Convenções de Teste

### Nomenclatura

- Arquivos de teste: `*.test.js`
- Localização: pasta `__tests__/` na raiz do projeto
- Descrição clara do cenário testado

### Estrutura

```javascript
describe("Nome do Componente/Funcionalidade", () => {
  beforeEach(() => {
    // Setup inicial
  });

  test("Deve fazer algo específico", () => {
    // Arrange: preparar
    // Act: executar
    // Assert: verificar
  });
});
```

## 🔍 Próximos Passos

- [ ] Aumentar cobertura de código (atualmente 0% dos arquivos JS reais)
- [ ] Adicionar testes de integração
- [ ] Testes E2E com Playwright ou Cypress
- [ ] CI/CD com execução automática de testes
- [ ] Testes de performance
- [ ] Testes de acessibilidade

## 📚 Documentação Adicional

Para mais informações sobre:

- [Jest](https://jestjs.io/)
- [JSDOM](https://github.com/jsdom/jsdom)
- [Melhores práticas de teste](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Data de criação:** 12 de novembro de 2025
**Última atualização:** 12 de novembro de 2025
