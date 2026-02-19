import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useDisconnect } from 'thirdweb/react';

const AUTH_STORAGE_KEY = 'regenmon_auth';
const USER_DATA_PREFIX = 'regenmon_user_';
const SAVE_KEY = 'regenmon_save_v4';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const activeAccount = useActiveAccount();
  const { disconnect } = useDisconnect();

  // ============================================
  // CARGAR SESIÓN AL INICIAR
  // ============================================
  useEffect(() => {
    const loadSession = async () => {
      console.log('🔍 Verificando sesión...');
      console.log('   activeAccount:', activeAccount?.address);

      // Pequeño delay para que Thirdweb se inicialice
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // 1. Verificar cuenta de Thirdweb activa PRIMERO
        if (activeAccount) {
          console.log('✅ Cuenta Thirdweb activa:', activeAccount.address);

          // Cargar datos guardados del usuario
          const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
          let email = null;

          if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            if (authData.walletAddress === activeAccount.address) {
              email = authData.email;
            }
          }

          // Guardar/actualizar auth
          const authData = {
            walletAddress: activeAccount.address,
            email: email,
            isGuest: false,
            lastLogin: Date.now(),
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

          setUser({
            id: activeAccount.address,
            walletAddress: activeAccount.address,
            email: email,
            isGuest: false,
          });
          setIsGuest(false);
          setIsLoading(false);
          return;
        }

        // 2. Verificar sesión guardada en localStorage (para invitados)
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);

          if (authData.isGuest) {
            console.log('✅ Sesión de invitado detectada');
            setUser({
              id: 'guest',
              isGuest: true,
            });
            setIsGuest(true);
            setIsLoading(false);
            return;
          }
        }

        // 3. No hay sesión
        console.log('❌ No hay sesión activa');
        setUser(null);
        setIsGuest(false);

      } catch (error) {
        console.error('Error al cargar sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [activeAccount]);

  // ============================================
  // CONTINUAR COMO INVITADO
  // ============================================
  const continueAsGuest = useCallback(() => {
    console.log('👤 Iniciando sesión como invitado');

    const guestData = {
      isGuest: true,
      sessionId: `guest_${Date.now()}`,
      createdAt: Date.now(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestData));

    setIsGuest(true);
    setUser({ id: 'guest', isGuest: true });

    return { success: true };
  }, []);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    console.log('🚪 Iniciando logout...');

    try {
      // 1. Desconectar wallet de Thirdweb
      if (activeAccount) {
        console.log('Desconectando wallet...');
        try {
          await disconnect(activeAccount);
        } catch (e) {
          console.warn('Error al desconectar:', e);
        }
      }

      // 2. Si es invitado, borrar sus datos de juego
      if (isGuest) {
        console.log('Borrando datos de invitado...');
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem('regenmon_chat');
        localStorage.removeItem('regenmon_memories');
      }

      // 3. Borrar SOLO los datos de autenticación (NO los datos del juego del usuario)
      localStorage.removeItem(AUTH_STORAGE_KEY);

      // 4. Resetear estados
      setUser(null);
      setIsGuest(false);

      console.log('✅ Logout completado');
      return { success: true };

    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsGuest(false);
      return { success: true };
    }
  }, [activeAccount, disconnect, isGuest]);

  // ============================================
  // OBTENER STORAGE KEY PARA USUARIO
  // ============================================
  const getUserStorageKey = useCallback((baseKey) => {
    if (isGuest || !user?.id || user.id === 'guest') {
      return baseKey; // Invitados usan key normal
    }
    // Usuarios autenticados usan key con su wallet address
    return `${USER_DATA_PREFIX}${user.id}_${baseKey}`;
  }, [user?.id, isGuest]);

  // ============================================
  // GUARDAR DATOS DEL USUARIO
  // ============================================
  const saveUserData = useCallback((key, data) => {
    const storageKey = getUserStorageKey(key);
    console.log('💾 Guardando en:', storageKey);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [getUserStorageKey]);

  // ============================================
  // CARGAR DATOS DEL USUARIO
  // ============================================
  const loadUserData = useCallback((key) => {
    const storageKey = getUserStorageKey(key);
    console.log('📂 Cargando de:', storageKey);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }, [getUserStorageKey]);

  // ============================================
  // VERIFICAR SI USUARIO TIENE PARTIDA GUARDADA
  // ============================================
  const hasSavedGame = useCallback(() => {
    const storageKey = getUserStorageKey(SAVE_KEY);
    const data = localStorage.getItem(storageKey);
    if (!data) return false;

    try {
      const parsed = JSON.parse(data);
      return parsed?.gameState?.hasRegenmon === true;
    } catch {
      return false;
    }
  }, [getUserStorageKey]);

  return {
    user,
    isGuest,
    isLoading,
    isAuthenticated: !!user,
    continueAsGuest,
    logout,
    saveUserData,
    loadUserData,
    getUserStorageKey,
    hasSavedGame,
  };
};
