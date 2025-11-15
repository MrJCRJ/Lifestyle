# 🔧 Notas de Build e Segurança

## ✅ Problema de Build Resolvido

**Erro Original:**
```
sh: line 1: ./scripts/vercel-build.sh: No such file or directory
Error: Command "npm run build" exited with 127
```

**Solução Implementada:**
- Criado diretório `scripts/`
- Criado `scripts/vercel-build.sh` - Script de build para Vercel
- Criado `scripts/generate-env.sh` - Script para gerar arquivo .env
- Scripts com permissões de execução configuradas (`chmod +x`)

**Status:** ✅ Build funcionando corretamente

---

## 🔒 Vulnerabilidades de Segurança

### Status Atual:
- **18 vulnerabilidades moderadas** detectadas
- **Todas relacionadas ao Jest** (ferramenta de testes de desenvolvimento)

### Análise:
```
Pacote afetado: js-yaml <4.1.1 (usado pelo Jest)
Severidade: Moderada
Tipo: Prototype pollution in merge
```

### ⚠️ Importante:
- **Não afeta produção** - Jest é dependência de desenvolvimento (`devDependencies`)
- **Não é carregado no build** - Apenas usado para testes locais
- **Build de produção está seguro** - Contém apenas HTML, CSS e JavaScript puro

### Opções de Correção:

#### Opção 1: Aguardar (RECOMENDADO)
```bash
# Aguardar atualização oficial do Jest que corrija o js-yaml
# Status: Em desenvolvimento pela equipe do Jest
```

#### Opção 2: Force Fix (NÃO RECOMENDADO)
```bash
npm audit fix --force
# ⚠️ Pode causar breaking changes
# ⚠️ Pode quebrar testes existentes
# ⚠️ Regrediria Jest de v29.7.0 para v25.0.0
```

#### Opção 3: Ignorar Temporariamente
```bash
# Adicionar ao package.json:
"overrides": {
  "js-yaml": "^4.1.1"
}
```

### 📊 Contexto:
- **39 packages** aguardando funding (normal, não é erro)
- **331 pacotes** auditados
- **Tempo de instalação:** ~9s
- **Build de produção:** Funcional e seguro

---

## 🚀 Como Fazer Deploy

### Vercel (Automático)
1. Push para o repositório GitHub
2. Vercel detecta `vercel.json`
3. Executa `npm run build`
4. Deploy automático

### Comandos Úteis:
```bash
# Testar build localmente
npm run build

# Rodar servidor de desenvolvimento
npm run dev

# Executar testes
npm test

# Ver cobertura de testes
npm test:coverage
```

---

## 📁 Estrutura de Scripts

```
scripts/
├── vercel-build.sh     # Build para produção (Vercel)
└── generate-env.sh     # Gera arquivo .env para desenvolvimento
```

### vercel-build.sh
- Valida existência dos arquivos principais
- Não compila (projeto estático)
- Retorna código de saída apropriado

### generate-env.sh
- Cria arquivo `.env` se não existir
- Define variáveis de ambiente padrão
- Usado pelo comando `npm run dev`

---

**Data:** 15/11/2025  
**Resolvido por:** José Cícero  
**Status:** ✅ Build funcionando, vulnerabilidades analisadas e documentadas
