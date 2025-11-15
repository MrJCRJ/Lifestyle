#!/bin/bash

# Script de build para Vercel
# Este é um projeto estático, então não precisa de compilação

echo "✅ Build iniciado..."

# Verifica se os arquivos principais existem
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado!"
    exit 1
fi

if [ ! -d "js" ]; then
    echo "❌ Erro: diretório js/ não encontrado!"
    exit 1
fi

if [ ! -d "css" ]; then
    echo "❌ Erro: diretório css/ não encontrado!"
    exit 1
fi

echo "✅ Arquivos principais encontrados"
echo "✅ Projeto estático - nenhuma compilação necessária"
echo "✅ Build concluído com sucesso!"

exit 0
