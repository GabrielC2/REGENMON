import { useState, useEffect } from 'react';
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { client } from '../lib/thirdwebClient';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [showGuestConfirm, setShowGuestConfirm] = useState(false);
  const [key, setKey] = useState(0); // Key para forzar re-mount
  const [isConnecting, setIsConnecting] = useState(false);

  const activeAccount = useActiveAccount();

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setShowGuestConfirm(false);
      setIsConnecting(false);
      // Incrementar key para forzar re-mount del ConnectEmbed
      setKey(prev => prev + 1);
      console.log('🔄 LoginModal abierto, key incrementada a:', key + 1);
    }
  }, [isOpen]);

  // Detectar cuando el usuario se conecta
  useEffect(() => {
    if (activeAccount && isOpen && !isConnecting) {
      console.log('✅ Usuario conectado:', activeAccount.address);
      setIsConnecting(true);

      // Pequeño delay para asegurar que todo está listo
      setTimeout(() => {
        onSuccess('authenticated', activeAccount.address);
      }, 500);
    }
  }, [activeAccount, isOpen, isConnecting, onSuccess]);

  if (!isOpen) return null;

  // Configurar wallets con las opciones de autenticación
  const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",      // Login con Google
          "email",       // Login con Email (envía código OTP)
          "discord",     // Login con Discord
        ],
        mode: "popup",
      },
    }),
  ];

  // Continuar como invitado
  const handleGuestLogin = () => {
    console.log('👤 Continuando como invitado');
    onSuccess('guest', null);
  };

  // Prevenir cierre accidental
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="login-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="login-modal"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="login-modal-header">
          <h2>¡Bienvenido a Regenmon!</h2>
          <p>Inicia sesión para guardar tu progreso</p>
        </div>

        {/* Thirdweb ConnectEmbed - Con key para forzar re-mount */}
        <div className="thirdweb-connect-container">
          <ConnectEmbed
            key={key} // IMPORTANTE: Fuerza re-mount cuando cambia
            client={client}
            wallets={wallets}
            modalSize="compact"
            showThirdwebBranding={false}
            theme="dark"
            connectModal={{
              size: "compact",
              title: "Iniciar Sesión",
              showThirdwebBranding: false,
            }}
          />
        </div>

        {/* Separador */}
        <div className="login-divider">
          <span>o</span>
        </div>

        {/* Invitado */}
        {!showGuestConfirm ? (
          <button
            className="login-button guest"
            onClick={() => setShowGuestConfirm(true)}
          >
            <span>👤</span>
            <span>Continuar como Invitado</span>
          </button>
        ) : (
          <div className="guest-confirm">
            <div className="guest-warning">
              <span className="warning-icon">⚠️</span>
              <p>
                Como invitado, tu progreso <strong>NO se guardará</strong> al cerrar el navegador.
                ¿Estás seguro?
              </p>
            </div>
            <div className="guest-confirm-buttons">
              <button
                className="confirm-button cancel"
                onClick={() => setShowGuestConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="confirm-button accept"
                onClick={handleGuestLogin}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        <button
          className="login-modal-close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
