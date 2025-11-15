#!/bin/bash

# Script para gerar arquivo .env se não existir

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Criando arquivo .env..."
    cat > "$ENV_FILE" << EOF
# Configurações de Ambiente - Lifestyle App
NODE_ENV=development
APP_VERSION=2.0.0
EOF
    echo "✅ Arquivo .env criado com sucesso!"
else
    echo "✅ Arquivo .env já existe"
fi

exit 0
