import { useState } from 'react';

const UserHeader = ({ userData, isGuest, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSeedWarning, setShowSeedWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Obtener nombre a mostrar
  const getDisplayName = () => {
    if (isGuest) return 'Invitado';
    if (userData?.email) return userData.email;
    if (userData?.walletAddress) {
      const addr = userData.walletAddress;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return 'Usuario';
  };

  // Copiar dirección al portapapeles
  const copyAddress = async () => {
    if (userData?.walletAddress) {
      try {
        await navigator.clipboard.writeText(userData.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  // Manejar logout con loading
  const handleLogout = async () => {
    console.log('🔘 Botón logout clickeado');
    setIsLoggingOut(true);

    try {
      await onLogout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="user-header">
        {/* Spacer para empujar todo a la derecha */}
        <div className="flex-1"></div>

        {/* Contenedor de usuario y botón salir - JUNTOS A LA DERECHA */}
        <div className="user-controls">
          {/* Info de usuario - Click abre perfil si no es invitado */}
          <div
            className={`user-info-box ${!isGuest ? 'clickable' : ''}`}
            onClick={() => !isGuest && setShowProfile(true)}
            role="button"
            tabIndex={0}
          >
            <span className="user-icon">{isGuest ? '👤' : '🔗'}</span>
            <span className="user-name">{getDisplayName()}</span>
            {isGuest && <span className="guest-badge">Invitado</span>}
            {!isGuest && <span className="profile-hint">Ver perfil</span>}
          </div>

          {/* Botón Salir */}
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <span className="logout-spinner"></span>
                <span className="logout-text">Saliendo...</span>
              </>
            ) : (
              <>
                <span>🚪</span>
                <span className="logout-text">Salir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Perfil */}
      {showProfile && !isGuest && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>

            <div className="profile-header">
              <h3>Mi Perfil</h3>
              <button
                className="profile-close"
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>

            <div className="profile-content">

              {/* Email */}
              {userData?.email && (
                <div className="profile-item">
                  <span className="profile-label">Email</span>
                  <span className="profile-value">{userData.email}</span>
                </div>
              )}

              {/* Wallet Address */}
              <div className="profile-item">
                <span className="profile-label">Dirección de Wallet</span>
                <div className="wallet-address-container">
                  <span className="profile-value wallet-address">
                    {userData?.walletAddress || 'No disponible'}
                  </span>
                  <button
                    className="copy-button"
                    onClick={copyAddress}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Advertencia de seguridad */}
              <div className="profile-section">
                <h4>Seguridad</h4>

                {!showSeedWarning ? (
                  <button
                    className="export-seed-button"
                    onClick={() => setShowSeedWarning(true)}
                  >
                    Exportar Clave Privada
                  </button>
                ) : (
                  <div className="seed-warning">
                    <div className="warning-content">
                      <span className="warning-icon">⚠️</span>
                      <p>
                        <strong>PELIGRO!</strong> Tu clave privada da acceso completo a tu wallet.<br/>
                        <strong>NUNCA</strong> la compartas con nadie.<br/>
                        Guárdala en un lugar seguro.
                      </p>
                    </div>
                    <div className="seed-warning-buttons">
                      <button
                        className="cancel-button"
                        onClick={() => setShowSeedWarning(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="confirm-export-button"
                        onClick={() => {
                          alert('La exportación de clave privada requiere integración adicional con Thirdweb. Por ahora, puedes ver tu dirección de wallet arriba.');
                          setShowSeedWarning(false);
                        }}
                      >
                        Entiendo
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserHeader;
