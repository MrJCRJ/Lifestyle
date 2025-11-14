# 🌟 Lifestyle App

> Gerenciador inteligente de rotinas diárias com sincronização automática na nuvem

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/MrJCRJ/Lifestyle)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📱 Sobre

O **Lifestyle App** é um aplicativo web moderno para gerenciar sua rotina diária de forma inteligente e organizada. Com sincronização automática via Google Drive, seus dados ficam sempre disponíveis em qualquer dispositivo.

### ✨ Características Principais

- 📅 **Planejamento Inteligente** - Crie cronogramas detalhados para cada dia
- ☁️ **Sincronização Automática** - Dados salvos automaticamente no Google Drive
- 📊 **Dashboard Analytics** - Visualize estatísticas e insights da sua rotina
- 🎯 **Múltiplas Categorias** - Trabalho, Estudo, Exercícios, Alimentação, e mais
- 💾 **Backup Local** - Exporte e importe seus dados em JSON
- 📱 **Responsivo** - Funciona perfeitamente em desktop e mobile
- 🔒 **Seguro** - Autenticação OAuth 2.0 do Google

## 🚀 Demo

Acesse a versão online: [https://lifestyle-rouge.vercel.app](https://lifestyle-rouge.vercel.app)

## 📸 Screenshots

[Em breve]

## 🏗️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Sincronização**: Google Drive API v3
- **Autenticação**: Google OAuth 2.0
- **Deploy**: Vercel
- **Testes**: Jest

## 📦 Instalação

### Pré-requisitos

- Python 3.x ou Node.js (para servidor local)
- Credenciais do Google OAuth 2.0 (opcional para desenvolvimento)

### Setup Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/MrJCRJ/Lifestyle.git
cd Lifestyle

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais (ou use as padrões para teste)

# 3. Gere o arquivo de configuração
./scripts/generate-env.sh

# 4. Inicie o servidor local
python -m http.server 8000

# 5. Acesse no navegador
# http://localhost:8000
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Google OAuth 2.0
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=sua_api_key (opcional)
VITE_DRIVE_FILE_NAME=lifestyle-app-data.json
```

### Configurar Google Drive

Para habilitar a sincronização com Google Drive:

1. Siga o guia completo em [docs/GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md)
2. Ou use as credenciais já configuradas para teste

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## 📚 Documentação

Toda a documentação está disponível na pasta `docs/`:

- [📖 Índice Completo](docs/README.md)
- [🔧 Configuração Google Drive](docs/GOOGLE_DRIVE_SETUP.md)
- [💻 Testes Locais](docs/LOCAL_TESTING.md)
- [🚀 Deploy Vercel](docs/VERCEL_SETUP.md)
- [🔑 Credenciais](docs/GOOGLE_CREDENTIALS.md)

## 🎯 Funcionalidades

### Categorias Disponíveis

- 😴 **Sono** - Horário de dormir e acordar
- 💼 **Trabalho** - Gerenciar tarefas profissionais
- 📚 **Estudo** - Organizar sessões de estudo
- 🍽️ **Alimentação** - Planejar refeições do dia
- 💧 **Hidratação** - Acompanhar consumo de água
- 🏃 **Exercícios** - Agendar atividades físicas
- 🧹 **Limpeza** - Organizar tarefas domésticas
- 🎨 **Projetos** - Gerenciar projetos pessoais

### Sincronização Google Drive

- ✅ Sincronização automática (2 segundos após alterações)
- ✅ Sincronização manual sob demanda
- ✅ Resolução automática de conflitos
- ✅ Multi-dispositivo
- ✅ Dados salvos em pasta privada do app

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fork o projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Changelog

### v2.0.0 - Sincronização Google Drive (Nov 2024)

- ✨ Integração completa com Google Drive API
- ✨ Sincronização automática e manual
- ✨ Suporte multi-dispositivo
- ✨ Sistema de variáveis de ambiente
- ✨ Scripts de build para desenvolvimento e produção
- 📚 Documentação completa
- 🔒 Segurança aprimorada

### v1.0.0 - Release Inicial

- Sistema de planejamento de rotinas
- Múltiplas categorias de atividades
- Dashboard com estatísticas
- Backup local (exportar/importar)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**JoseJr** - [MrJCRJ](https://github.com/MrJCRJ)

## 🙏 Agradecimentos

- Google Drive API pela excelente documentação
- Vercel pela hospedagem
- Comunidade open source

---

**Desenvolvido com ❤️ para melhorar a organização de rotinas**

[⬆ Voltar ao topo](#-lifestyle-app)
