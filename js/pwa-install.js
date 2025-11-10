// PWA Install Prompt - Lifestyle App
// Gerencia o prompt de instalação do Progressive Web App

let deferredPrompt = null;
let installButton = null;

// Inicializa quando o DOM estiver pronto
function initPWAInstall() {
  installButton = document.getElementById('btn-install-pwa');

  if (!installButton) {
    console.warn('⚠️ Botão de instalação PWA não encontrado');
    return;
  }

  // Adiciona estilo hover ao botão
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 16px rgba(124,58,237,0.4)';
  });

  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)';
  });
}

// Evento disparado quando o navegador oferece instalação
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ PWA pode ser instalado');

  // Previne o prompt automático do navegador
  e.preventDefault();

  // Armazena o evento para uso posterior
  deferredPrompt = e;

  // Mostra o botão customizado de instalação
  if (installButton) {
    installButton.style.display = 'inline-block';

    // Adiciona animação de entrada
    installButton.style.animation = 'slideInUp 0.5s ease-out';
  }
});

// Quando o usuário clica no botão de instalação
if (document.getElementById('btn-install-pwa')) {
  document.getElementById('btn-install-pwa').addEventListener('click', async () => {
    if (!deferredPrompt) {
      console.log('⚠️ Prompt de instalação não disponível');
      return;
    }

    // Mostra o prompt de instalação
    deferredPrompt.prompt();

    // Aguarda a escolha do usuário
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalar o PWA');

      // Mostra mensagem de sucesso
      if (installButton) {
        installButton.textContent = '✅ Instalado!';
        installButton.style.background = '#10b981';

        setTimeout(() => {
          installButton.style.display = 'none';
        }, 2000);
      }
    } else {
      console.log('❌ Usuário recusou instalar o PWA');
    }

    // Limpa o prompt
    deferredPrompt = null;
  });
}

// Evento disparado quando o PWA é instalado
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalado com sucesso!');

  // Oculta o botão de instalação
  if (installButton) {
    installButton.style.display = 'none';
  }

  // Limpa o prompt armazenado
  deferredPrompt = null;

  // Opcional: mostrar mensagem de boas-vindas
  if (typeof showNotification === 'function') {
    showNotification('App instalado com sucesso! 🎉', 'success');
  }
});

// Detecta se o app já está instalado (standalone mode)
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Se já estiver instalado, não mostra o botão
if (isStandalone()) {
  console.log('✅ App rodando em modo standalone');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Inicializa quando o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWAInstall);
} else {
  initPWAInstall();
}

// Adiciona estilo de animação ao documento
if (!document.getElementById('pwa-install-styles')) {
  const style = document.createElement('style');
  style.id = 'pwa-install-styles';
  style.textContent = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(100px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    #btn-install-pwa:active {
      transform: translateY(0) scale(0.95) !important;
    }
    
    @media (max-width: 768px) {
      #btn-install-pwa {
        bottom: 70px !important;
        right: 16px !important;
        font-size: 13px !important;
        padding: 10px 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

console.log('📱 PWA Install module loaded');
