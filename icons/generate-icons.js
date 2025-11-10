// Script para gerar ícones do PWA usando Canvas (Node.js)
// Execute com: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Cria um diretório se não existir
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Criar gradiente
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#7c3aed');
  gradient.addColorStop(1, '#a855f7');

  // Fundo com gradiente e bordas arredondadas
  ctx.fillStyle = gradient;
  ctx.beginPath();
  const radius = size / 5;
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Texto "L"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', size / 2, size / 2);

  // Salvar arquivo
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${__dirname}/icon-${size}x${size}.png`, buffer);
  console.log(`✓ Criado icon-${size}x${size}.png`);
});

console.log('\n✅ Todos os ícones foram gerados com sucesso!');
console.log('📁 Localização:', __dirname);
