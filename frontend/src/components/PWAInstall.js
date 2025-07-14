import React, { useState, useEffect } from 'react';

const PWAInstall = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Show iOS instructions after a delay if no Android prompt appears
    if (iOS) {
      const timer = setTimeout(() => {
        setShowIOSInstructions(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setShowIOSInstructions(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowIOSInstructions(false);
  };

  const handleIOSDismiss = () => {
    setShowIOSInstructions(false);
  };

  if (!showInstallPrompt && !showIOSInstructions) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: '#1976d2',
      color: 'white',
      padding: 16,
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      {showInstallPrompt && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {lang === 'en' ? 'Install ShoeCo App' : 'Instalar App ShoeCo'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {lang === 'en' ? 'Add to home screen for better experience' : 'Agregar a pantalla de inicio para mejor experiencia'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDismiss}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid white',
                  color: 'white',
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {lang === 'en' ? 'Later' : 'Después'}
              </button>
              <button
                onClick={handleInstallClick}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: 'none',
                  color: '#1976d2',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {lang === 'en' ? 'Install' : 'Instalar'}
              </button>
            </div>
          </div>
        </>
      )}

      {showIOSInstructions && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {lang === 'en' ? 'Install ShoeCo App (iPhone)' : 'Instalar App ShoeCo (iPhone)'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {lang === 'en' ? 'Tap Share button → Add to Home Screen' : 'Toca Compartir → Agregar a Pantalla de Inicio'}
              </div>
            </div>
            <button
              onClick={handleIOSDismiss}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid white',
                color: 'white',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Got it' : 'Entendido'}
            </button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.4 }}>
            {lang === 'en' 
              ? '1. Tap the Share button (square with arrow) 2. Scroll down and tap "Add to Home Screen" 3. Tap "Add" to install'
              : '1. Toca el botón Compartir (cuadrado con flecha) 2. Desplázate hacia abajo y toca "Agregar a Pantalla de Inicio" 3. Toca "Agregar" para instalar'
            }
          </div>
        </>
      )}
    </div>
  );
};

export default PWAInstall; 