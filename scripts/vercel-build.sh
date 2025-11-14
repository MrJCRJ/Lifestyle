#!/bin/bash

# Script de Build para Vercel
# Este script é executado automaticamente durante o deploy no Vercel
# Ele injeta as variáveis de ambiente nas configurações do app

echo "🚀 Iniciando build para produção..."

# Criar diretório se não existir
mkdir -p js/generated

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$VITE_GOOGLE_CLIENT_ID" ]; then
    echo "⚠️ VITE_GOOGLE_CLIENT_ID não definida!"
    echo "❌ Configure as variáveis de ambiente no Vercel"
    exit 1
fi

echo "✅ Variáveis de ambiente detectadas"

# Criar arquivo de configuração
cat > js/generated/env-config.js << EOF
// Configuração de Variáveis de Ambiente
// ESTE ARQUIVO É GERADO AUTOMATICAMENTE DURANTE O BUILD
// Gerado em: $(date)

window.ENV = {
  VITE_GOOGLE_CLIENT_ID: '${VITE_GOOGLE_CLIENT_ID}',
  VITE_GOOGLE_API_KEY: '${VITE_GOOGLE_API_KEY:-}',
  VITE_DRIVE_FILE_NAME: '${VITE_DRIVE_FILE_NAME:-lifestyle-app-data.json}'
};

console.log('✅ Variáveis de ambiente carregadas (Build: $(date +%Y%m%d-%H%M%S))');
EOF

echo "✅ Arquivo de configuração gerado: js/generated/env-config.js"

# Exibir informações do build (sem expor credenciais completas)
echo ""
echo "📊 Resumo do Build:"
echo "  - CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID:0:20}..."
echo "  - API_KEY: ${VITE_GOOGLE_API_KEY:+[CONFIGURADA]}"
echo "  - FILE_NAME: ${VITE_DRIVE_FILE_NAME:-lifestyle-app-data.json}"
echo ""
echo "🎉 Build concluído com sucesso!"
