import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './PwaInstallBanner.css';

const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya lo cerró antes
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir el comportamiento por defecto de Chrome (aunque en Android suele ser silencioso)
      e.preventDefault();
      // Guardar el evento para dispararlo luego
      setDeferredPrompt(e);
      // Mostrar el banner si no fue descartado
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Ocultar si se instaló exitosamente
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Disparar el prompt nativo
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Guardar en localStorage para no molestar más
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-content">
        <div className="pwa-icon">
          <img src="/pwa-icons/icon-192x192.png" alt="Auténticos App" />
        </div>
        <div className="pwa-text">
          <h4>Instala Auténticos</h4>
          <p>Accede más rápido a tus resultados</p>
        </div>
      </div>
      <div className="pwa-actions">
        <button className="btn-install" onClick={handleInstallClick}>
          <Download size={14} style={{ marginRight: '4px' }} />
          Instalar
        </button>
        <button className="btn-dismiss" onClick={handleDismiss}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
