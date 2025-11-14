# 🚀 Configuração Rápida - Vercel Deploy

## ⚡ Deploy Imediato

O projeto está configurado e pronto para deploy no Vercel!

### 📋 Pré-requisitos

Apenas uma coisa é necessária antes do deploy:

**Configure as variáveis de ambiente no Vercel:**

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione estas 3 variáveis:

```
VITE_GOOGLE_CLIENT_ID = 977777984787-5l6tf7jdsp44fra6fses0kv5hfanem4r.apps.googleusercontent.com
VITE_GOOGLE_API_KEY = (deixe vazio ou adicione sua API Key)
VITE_DRIVE_FILE_NAME = lifestyle-app-data.json
```

4. Selecione: **Production, Preview, Development** (todos os ambientes)
5. Clique em **Save**

### 🎯 Deploy

Depois de configurar as variáveis:

```bash
# O Vercel fará deploy automaticamente ao fazer push
git push origin main

# Ou use o comando do Vercel CLI
vercel --prod
```

### ✅ Verificação

Após o deploy:

1. Acesse sua URL no Vercel (ex: `lifestyle-rouge.vercel.app`)
2. Abra o Console do navegador (F12)
3. Você deve ver: `✅ Variáveis de ambiente carregadas`
4. Vá em **⚙️ Configurações** e teste a conexão com Google Drive

### 🔧 Arquivos Importantes

- `vercel.json` - Configuração do Vercel
- `scripts/vercel-build.sh` - Script executado durante o build
- `.env.example` - Template de variáveis de ambiente

### 📚 Documentação Completa

Para mais detalhes, consulte:

- [docs/VERCEL_SETUP.md](../docs/VERCEL_SETUP.md) - Guia detalhado
- [docs/ENV_QUICKSTART.md](../docs/ENV_QUICKSTART.md) - Quick start de variáveis

---

**Pronto! Seu app estará online em minutos! 🎉**
