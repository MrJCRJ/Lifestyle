// Gerenciamento de Variáveis de Ambiente

/**
 * Configuração de Variáveis de Ambiente
 * 
 * Para aplicações client-side (JavaScript no navegador), as variáveis de ambiente
 * precisam ser injetadas durante o build ou carregadas de forma específica.
 * 
 * Este módulo oferece suporte para diferentes ambientes:
 * 1. Desenvolvimento: Carrega de um objeto global window.ENV
 * 2. Build com Vite/Webpack: Usa import.meta.env ou process.env
 * 3. Fallback: Valores padrão para desenvolvimento rápido
 */

const ENV = {
  // Tentar carregar de diferentes fontes
  GOOGLE_CLIENT_ID:
    window.ENV?.VITE_GOOGLE_CLIENT_ID ||
    '977777984787-5l6tf7jdsp44fra6fses0kv5hfanem4r.apps.googleusercontent.com', // Fallback para desenvolvimento

  GOOGLE_API_KEY:
    window.ENV?.VITE_GOOGLE_API_KEY ||
    '', // API Key é opcional

  DRIVE_FILE_NAME:
    window.ENV?.VITE_DRIVE_FILE_NAME ||
    'lifestyle-app-data.json'
};

/**
 * Validar se as variáveis essenciais estão configuradas
 */
function validateEnv() {
  const warnings = [];

  if (!ENV.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID.includes('your_client_id_here')) {
    warnings.push('⚠️ GOOGLE_CLIENT_ID não configurado. A sincronização com Google Drive não funcionará.');
  }

  if (!ENV.GOOGLE_API_KEY && ENV.GOOGLE_API_KEY !== '') {
    console.info('ℹ️ GOOGLE_API_KEY não configurado (opcional, mas recomendado para melhor performance)');
  }

  if (warnings.length > 0) {
    console.warn('Avisos de configuração:');
    warnings.forEach(warning => console.warn(warning));
    console.info('📖 Consulte docs/GOOGLE_DRIVE_SETUP.md para instruções de configuração');
  }

  return warnings.length === 0;
}

/**
 * Obter configuração do Google Drive
 */
function getGoogleDriveConfig() {
  return {
    CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
    API_KEY: ENV.GOOGLE_API_KEY,
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: [
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    FILE_NAME: ENV.DRIVE_FILE_NAME
  };
}

/**
 * Verificar se está em modo de desenvolvimento
 */
function isDevelopment() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost')
  );
}

/**
 * Verificar se está em modo de produção
 */
function isProduction() {
  return !isDevelopment();
}

// Validar na inicialização (apenas em desenvolvimento)
if (isDevelopment()) {
  console.log('🔧 Modo de desenvolvimento detectado');
  console.log('📋 Variáveis de ambiente:', {
    GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado',
    GOOGLE_API_KEY: ENV.GOOGLE_API_KEY ? '✅ Configurado' : 'ℹ️ Opcional',
    DRIVE_FILE_NAME: ENV.DRIVE_FILE_NAME
  });
  validateEnv();
}

// Exportar para uso global
window.AppEnv = {
  ...ENV,
  getGoogleDriveConfig,
  isDevelopment,
  isProduction,
  validateEnv
};
