#!/bin/bash

# Script para gerar arquivo de configuração de variáveis de ambiente
# Este script lê o arquivo .env e gera um arquivo JavaScript que injeta
# as variáveis no window.ENV para uso no browser

echo "🔧 Gerando configuração de variáveis de ambiente..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado!"
    echo "📋 Copiando .env.example para .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Por favor, configure suas credenciais."
    exit 1
fi

# Criar diretório de saída se não existir
mkdir -p js/generated

# Arquivo de saída
OUTPUT_FILE="js/generated/env-config.js"

# Iniciar arquivo
cat > "$OUTPUT_FILE" << 'EOF'
// Configuração de Variáveis de Ambiente
// ESTE ARQUIVO É GERADO AUTOMATICAMENTE - NÃO EDITE MANUALMENTE
// Para alterar as configurações, edite o arquivo .env na raiz do projeto

EOF

echo "window.ENV = {" >> "$OUTPUT_FILE"

# Ler arquivo .env e processar
while IFS= read -r line; do
    # Ignorar linhas vazias e comentários
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Extrair chave e valor
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remover aspas se existirem
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        
        # Adicionar ao arquivo
        echo "  $key: '$value'," >> "$OUTPUT_FILE"
    fi
done < .env

echo "};" >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "console.log('✅ Variáveis de ambiente carregadas');" >> "$OUTPUT_FILE"

echo "✅ Arquivo gerado: $OUTPUT_FILE"
echo "📦 Configuração pronta para uso!"
