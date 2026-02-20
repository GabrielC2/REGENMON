import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { useSupabaseSave } from './hooks/useSupabaseSave'
import LoginModal from './components/LoginModal'
import UserHeader from './components/UserHeader'

// ============================================
// CONFIGURACIÓN - VERSIÓN 4.9 (Persistencia de datos y Login)
// ============================================

const ELEMENTS = [
  { id: 'fuego', name: 'FUEGO', emoji: '🔥', folder: 'FUEGO', eggImage: 'HUEVO FUEGO 0.png', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.4)', particles: ['#ef4444', '#f97316', '#fbbf24', '#ff6b6b'] },
  { id: 'tierra', name: 'TIERRA', emoji: '🌍', folder: 'TIERRA', eggImage: 'HUEVO Tierra 0.png', color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.4)', particles: ['#84cc16', '#22c55e', '#a3e635', '#4ade80'] },
  { id: 'agua', name: 'AGUA', emoji: '💧', folder: 'AGUA', eggImage: 'HUEVO Agua 0.png', color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', particles: ['#3b82f6', '#0ea5e9', '#06b6d4', '#60a5fa'] },
  { id: 'aire', name: 'AIRE', emoji: '💨', folder: 'AIRE', eggImage: 'HUEVO Aire 0.png', color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.4)', particles: ['#a855f7', '#c084fc', '#e879f9', '#d8b4fe'] },
]

const ELEMENT_TO_FOLDER = { 'fuego': 'FUEGO', 'tierra': 'TIERRA', 'agua': 'AGUA', 'aire': 'AIRE' }
const ELEMENT_BACKGROUNDS = { 'FUEGO': 'radial-gradient(circle at center, #1a0808 0%, #0a0a0f 70%)', 'AGUA': 'radial-gradient(circle at center, #080818 0%, #0a0a0f 70%)', 'TIERRA': 'radial-gradient(circle at center, #0a1408 0%, #0a0a0f 70%)', 'AIRE': 'radial-gradient(circle at center, #140814 0%, #0a0a0f 70%)' }
const ELEMENT_PARTICLES = { 'FUEGO': ['#ef4444', '#f97316', '#fbbf24', '#ff6b6b'], 'AGUA': ['#3b82f6', '#0ea5e9', '#06b6d4', '#60a5fa'], 'TIERRA': ['#84cc16', '#22c55e', '#a3e635', '#4ade80'], 'AIRE': ['#a855f7', '#c084fc', '#e879f9', '#d8b4fe'] }
const DRAGON_VARIANTS = { 'FUEGO': [1], 'AGUA': [1], 'TIERRA': [1], 'AIRE': [1] }

// ============================================
// ASSETS DE LANDING PAGE (v3.8)
// ============================================
const LANDING_ASSETS = {
  heroBackground: '/assets/Landing/Inicio.jpg',
  eggs: {
    fuego: '/assets/Landing/HUEVO FUEGO 0.png',
    tierra: '/assets/Landing/HUEVO Tierra 0.png',
    agua: '/assets/Landing/HUEVO Agua 0.png',
    aire: '/assets/Landing/HUEVO Aire 0.png',
  },
  actions: {
    alimentar: '/assets/Landing/Alimentar.png',
    entrenar: '/assets/Landing/Entrenar.png',
    jugar: '/assets/Landing/Jugar.png',
  },
  evolution: '/assets/Landing/Evolucion.png',
}

const LANDING_ELEMENTS = [
  { id: 'fuego', name: 'FUEGO', image: LANDING_ASSETS.eggs.fuego, color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.4)', description: 'Forjados en las llamas eternas del núcleo de DragonChain. Estos huevos arden con el poder de mil bloques minados, esperando eclosionar con la furia del fuego ancestral.' },
  { id: 'tierra', name: 'TIERRA', image: LANDING_ASSETS.eggs.tierra, color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.4)', description: 'Nacidos de las montañas cristalizadas donde se almacenan los registros inmutables. Cada huevo de tierra contiene la solidez de la blockchain, inquebrantable y eterno.' },
  { id: 'agua', name: 'AGUA', image: LANDING_ASSETS.eggs.agua, color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', description: 'Emergidos de las profundidades del océano digital de DragonChain. Fluyen como las transacciones en la red, adaptándose y encontrando siempre su camino.' },
  { id: 'aire', name: 'AIRE', image: LANDING_ASSETS.eggs.aire, color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.4)', description: 'Descendidos de las nubes donde residen los nodos más elevados. Estos huevos llevan la velocidad del viento y la libertad de una red descentralizada.' },
]

const LANDING_ACTIONS = [
  { id: 'alimentar', name: 'Alimentar', image: LANDING_ASSETS.actions.alimentar, description: 'Proporciona tokens de comida para mantener la salud y energía de tu dragón. Un dragón bien alimentado genera más recompensas en la DragonChain.' },
  { id: 'entrenar', name: 'Entrenar', image: LANDING_ASSETS.actions.entrenar, description: 'Consume energía para minar bloques de experiencia. Cada entrenamiento fortalece a tu dragón y lo acerca a su próxima evolución en la cadena.' },
  { id: 'jugar', name: 'Jugar', image: LANDING_ASSETS.actions.jugar, description: 'Aumenta los puntos de felicidad y fortalece el vínculo con tu criatura. Un dragón feliz es más eficiente en todas sus actividades on-chain.' },
]

const CLICKS_PER_STAGE = 5
const TOTAL_CLICKS_TO_HATCH = 20

// ============================================
// CONFIGURACIÓN DE TIEMPOS - v3.6
// ============================================
const TIMERS = {
  feedCooldown: 5 * 1000,       // 5 segundos
  trainCooldown: 10 * 1000,     // 10 segundos
  playCooldown: 8 * 1000,       // 8 segundos
  restCooldown: 8 * 1000,       // 8 segundos
  foodGeneration: 10 * 1000,    // +1 comida cada 10 segundos
  hungerDecay: 20 * 1000,       // -1 hambre cada 20 segundos
  happinessDecay: 20 * 1000,    // -1 felicidad cada 20 segundos
  starvingPenalty: 20 * 1000,   // -2 felicidad extra si hambre = 0
};

// ============================================
// EFECTOS DE ACCIONES (v5.0) - FIX DESCANSAR
// ============================================
const ACTION_EFFECTS = {
  feed: { hunger: 20, energy: 10, happiness: 5, exp: 2, foodCost: 1 },
  train: { hunger: -10, energy: -20, exp: 25 },
  play: { energy: -15, happiness: 20, exp: 12 },
  rest: { hunger: -5, energy: 20, happiness: -5, exp: 5 }, // FIX: Ahora consume -5 felicidad
};

// ============================================
// CONFIGURACIÓN DE ECONOMÍA - v5.0
// ============================================
const ECONOMY_CONFIG = {
  welcomeGift: 100,
  dragonLevelUpReward: 1,
  profileLevelUpBaseReward: 10,
  profileExpPerDragonLevel: 50,
};

const PROFILE_EXP_TABLE = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700, 6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
  11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 6000, 16: 6850, 17: 7750, 18: 8700, 19: 9700, 20: 10750,
};

const SHOP_PRICES = {
  egg: { fuego: 150, agua: 150, tierra: 150, aire: 150 },
  incubatorSlot: 200,
  incubatorSlot3: 400,
  habitat: { fuego: 300, agua: 300, tierra: 300, aire: 300 },
  habitatUpgrade: 250,
  breedCost: 100,
  breedHybridBonus: 50,
};

const INCUBATION_TIME = 2 * 60 * 1000; // 2 minutos
const BREED_COOLDOWN = 48 * 60 * 60 * 1000; // 48 horas

// ============================================
// CONFIGURACIÓN DE BREEDING - HÍBRIDOS
// ============================================
const HYBRID_CHANCES = {
  'fuego+tierra': { hybrid: 'lava', chance: 0.15 },
  'tierra+fuego': { hybrid: 'lava', chance: 0.15 },
  'agua+aire': { hybrid: 'hielo', chance: 0.15 },
  'aire+agua': { hybrid: 'hielo', chance: 0.15 },
  'fuego+aire': { hybrid: 'rayo', chance: 0.15 },
  'aire+fuego': { hybrid: 'rayo', chance: 0.15 },
  'tierra+agua': { hybrid: 'naturaleza', chance: 0.15 },
  'agua+tierra': { hybrid: 'naturaleza', chance: 0.15 },
};

const HYBRID_ELEMENTS = {
  lava: { name: 'LAVA', emoji: '🌋', color: '#ff6b35', folder: 'LAVA' },
  hielo: { name: 'HIELO', emoji: '❄️', color: '#74b9ff', folder: 'HIELO' },
  rayo: { name: 'RAYO', emoji: '⚡', color: '#f1c40f', folder: 'RAYO' },
  naturaleza: { name: 'NATURALEZA', emoji: '🌿', color: '#00b894', folder: 'NATURALEZA' },
};

// ============================================
// CÓDIGOS PROMOCIONALES - v5.1
// ============================================
const PROMO_CODES = {
  'DRAGON2024': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'WELCOMEFIRE': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'REGENMON100': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'FREECOINS01': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'TESTCODE001': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'DRAGONLOVE': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'HABITAT2024': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'BREEDPOWER': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'INCUBATOR01': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
  'SUPERDRAGON': { reward: 200, type: 'dc', description: '200 Dragoncoins' },
};

// ============================================
// RUTAS DE IMÁGENES DE HABITATS - v5.1
// ============================================
const HABITAT_IMAGES = {
  fuego: '/assets/Habitats/HFuego.png',
  agua: '/assets/Habitats/HAgua.png',
  tierra: '/assets/Habitats/HTierra.png',
  aire: '/assets/Habitats/HAire.png',
};

const getHabitatImagePath = (element) => {
  return HABITAT_IMAGES[element] || '/assets/Habitats/HFuego.png';
};

const ELEMENT_BONUSES = {
  fuego: { trainingExpBonus: 0.15 },
  tierra: { hungerDecayReduction: 0.15 },
  agua: { playHappinessBonus: 15 },
  aire: { energyRegenBonus: 0.15 },
}

const EXP_TABLE = { 1: 0, 2: 50, 3: 125, 4: 225, 5: 375, 6: 575, 7: 825, 8: 1125, 9: 1525, 10: 2025, 11: 2625, 12: 3325, 13: 4125, 14: 5025, 15: 6025 }

const ACTIONS = {
  feed: { key: 'feed', name: 'Alimentar', icon: '🍖', cooldown: TIMERS.feedCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.feed, requirements: { food: 1 }, noDailyLimit: true },
  train: { key: 'train', name: 'Entrenar', icon: '💪', cooldown: TIMERS.trainCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.train, requirements: { energy: 20, hunger: 10 }, noDailyLimit: true },
  play: { key: 'play', name: 'Jugar', icon: '🎾', cooldown: TIMERS.playCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.play, requirements: { energy: 15 }, noDailyLimit: true },
  rest: { key: 'rest', name: 'Descansar', icon: '😴', cooldown: TIMERS.restCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.rest, requirements: { hunger: 5 }, noDailyLimit: true },
}

const MOOD_CONFIG = {
  happy: { emoji: '😊', label: 'Feliz', color: '#22c55e', expModifier: 1.25 },
  normal: { emoji: '😐', label: 'Normal', color: '#eab308', expModifier: 1.0 },
  sad: { emoji: '😔', label: 'Triste', color: '#f97316', expModifier: 0.75 },
  exhausted: { emoji: '😴', label: 'Agotado', color: '#6b7280', expModifier: 0, blockActions: true },
  starving: { emoji: '😫', label: 'Hambriento', color: '#ef4444', expModifier: 0.5 },
  depressed: { emoji: '😢', label: 'Deprimido', color: '#8b5cf6', expModifier: 0.25 },
}

// ============================================
// SISTEMA DE GUARDADO - VERSIÓN 4.0
// ============================================
const SAVE_KEY = 'regenmon_save_v4'

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

const calculateDragonScale = (level) => level >= 10 ? 150 + ((level - 10) * 6) : level >= 5 ? 120 + ((level - 5) * 4) : 100 + ((level - 1) * 4)
const getMaturityState = (level) => level >= 10 ? 3 : level >= 5 ? 2 : 1
const calculateMood = (stats) => stats.energy === 0 ? 'exhausted' : stats.hunger === 0 ? 'starving' : stats.happiness === 0 ? 'depressed' : (stats.hunger < 30 || stats.energy < 30 || stats.happiness < 30) ? 'sad' : (stats.hunger > 70 && stats.energy > 70 && stats.happiness > 70) ? 'happy' : 'normal'

const formatTime = (ms) => {
  if (ms <= 0) return null
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

const getStatColor = (value) => value > 70 ? 'high' : value > 30 ? 'medium' : 'low'

const EGG_FILE_NAMES = {
  'FUEGO': (stage) => `HUEVO FUEGO ${stage}.png`,
  'AGUA': (stage) => `HUEVO Agua ${stage}.png`,
  'TIERRA': (stage) => `HUEVO Tierra ${stage}.png`,
  'AIRE': (stage) => `HUEVO Aire ${stage}.png`,
}

const DRAGON_FILE_NAMES = {
  'FUEGO': (id, state) => `BEBE DRAGON${id} ${state}.png`,
  'AGUA': (id, state) => `BEBE AGUA${id} ${state}.png`,
  'TIERRA': (id, state) => `BEBE Tierra ${state}.png`,
  'AIRE': (id, state) => `BEBE Aire ${state}.png`,
}

const getEggImagePath = (elementId, stage) => {
  const folder = ELEMENT_TO_FOLDER[elementId]
  const fileName = EGG_FILE_NAMES[folder](stage)
  return `/assets/HUEVOS/${folder}/${fileName}`
}

const getDragonImagePath = (elementId, dragonId, maturityState = 1) => {
  const folder = ELEMENT_TO_FOLDER[elementId]
  const fileName = DRAGON_FILE_NAMES[folder](dragonId, maturityState)
  return `/assets/DRAGONES/${folder}/${fileName}`
}

const getRandomDragonId = (elementId) => {
  const folder = ELEMENT_TO_FOLDER[elementId]
  const ids = DRAGON_VARIANTS[folder] || [1]
  return ids[Math.floor(Math.random() * ids.length)]
}

// ============================================
// CONSTANTES DE CHAT
// ============================================
const CHAT_STORAGE_KEY = 'regenmon_chat';
const MEMORIES_KEY = 'regenmon_memories';
const MAX_MESSAGES = 20;

// ============================================
// COMPONENTES
// ============================================

function Particles({ colors }) {
  // Partículas MUCHO más lentas: duración de 30-50 segundos
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 30 + Math.random() * 20, // 30-50 segundos (MÁS LENTO)
    size: 3 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)]
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  )
}

function ExplosionParticles({ colors, active }) {
  if (!active) return null
  const particles = Array.from({ length: 30 }, (_, i) => ({ id: i, angle: (360 / 30) * i, distance: 100 + Math.random() * 100, delay: Math.random() * 0.3, size: 4 + Math.random() * 8, color: colors[Math.floor(Math.random() * colors.length)] }))
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map(p => <div key={p.id} style={{ '--angle': `${p.angle}deg`, '--distance': `${p.distance}px`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: '50%', position: 'absolute', animation: `explode 0.8s ease-out ${p.delay} forwards` }} />)}
    </div>
  )
}

// ============================================
// COMPONENTE: REGALO DE BIENVENIDA (v5.0)
// ============================================

function WelcomeGiftModal({ isOpen, onClaim }) {
  const [claimed, setClaimed] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => {
      onClaim();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-yellow-500/30 rounded-3xl p-8 w-[90%] max-w-[400px] text-center overflow-hidden">

        {!claimed ? (
          <>
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Regenmon!</h2>
            <p className="text-gray-400 mb-6">Como nuevo entrenador, tienes un regalo esperándote</p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span className="text-2xl font-bold text-yellow-400">100 Dragoncoins</span>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-white font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25"
            >
              ✨ RECLAMAR ✨
            </button>
          </>
        ) : (
          <>
            <div className="py-8">
              <div className="mb-4 flex justify-center"><img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '64px', height: '64px', objectFit: 'contain' }} className="animate-pulse" /></div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">¡Felicidades!</h2>
              <p className="text-xl text-white">Acabas de obtener</p>
              <p className="text-4xl font-bold text-yellow-400 mt-2">100 Dragoncoins</p>

              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-coin-fall"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random() * 0.5}s`,
                    }}
                  >
                    <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: NAVEGACIÓN DE PESTAÑAS (v5.0)
// ============================================

function TabNavigation({ activeTab, setActiveTab, incubatorCount, habitatsCount }) {
  const tabs = [
    { id: 'dragon', label: 'Mi Dragón', icon: '🐲', badge: null },
    { id: 'incubator', label: 'Incubadora', icon: '🥚', badge: incubatorCount > 0 ? incubatorCount : null },
    { id: 'habitats', label: 'Habitats', icon: '🏠', badge: habitatsCount },
    { id: 'breed', label: 'Breed', icon: '💕', badge: null },
  ];

  return (
    <div className="flex justify-center gap-2 mb-4 px-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-xs transition-all
            ${activeTab === tab.id
              ? 'bg-purple-500/30 border border-purple-500/50 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          {tab.badge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE: MODAL DE DRAGÓN ECLOSIONADO CON NOMBRE (v5.2)
// ============================================

function HatchedDragonModal({
  egg,
  onClose,
  onSendToHabitat,
  onSell,
  habitats,
  allDragons,
  element
}) {
  const [dragonName, setDragonName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showSelectHabitat, setShowSelectHabitat] = useState(false);

  if (!egg) return null;

  const elementInfo = ELEMENTS.find(e => e.id === element);

  const checkNameExists = (name) => {
    return allDragons.some(d => d.name.toLowerCase() === name.toLowerCase());
  };

  const validateName = () => {
    const trimmedName = dragonName.trim();

    if (!trimmedName) {
      setNameError('Ingresa un nombre para tu dragón');
      return false;
    }

    if (trimmedName.length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (trimmedName.length > 15) {
      setNameError('El nombre no puede tener más de 15 caracteres');
      return false;
    }

    if (checkNameExists(trimmedName)) {
      setNameError('Este nombre ya está siendo utilizado');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleSendToHabitat = () => {
    if (!validateName()) return;
    setShowSelectHabitat(true);
  };

  const confirmSendToHabitat = (habitatId) => {
    const dragonWithName = {
      ...egg.dragonData,
      name: dragonName.trim(),
    };
    onSendToHabitat(egg, habitatId, dragonWithName);
  };

  const handleSell = () => {
    onSell(egg);
  };

  const getAvailableHabitats = () => {
    return habitats.filter(h => {
      // Solo habitats del mismo elemento, o habitats sin elemento asignado aún
      const isCompatible = h.element === element || h.element === null;
      const hasSpace = h.dragons.length < h.maxDragons;
      return isCompatible && hasSpace;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-green-500/30 rounded-3xl p-8 w-[95%] max-w-md text-center">

        {!showSelectHabitat ? (
          <>
            <h3 className="text-2xl font-bold text-white mb-2">🎉 ¡Nuevo Dragón!</h3>
            <p className="text-gray-400 mb-6">
              Tu huevo de {elementInfo?.emoji} {element} ha eclosionado
            </p>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent rounded-full blur-2xl"></div>
              <img
                src={getDragonImagePath(element, egg.dragonData?.dragonId || 1, 1)}
                alt="Nuevo dragón"
                className="w-40 h-40 mx-auto object-contain relative z-10 animate-float"
                style={{ filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.4))' }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2 text-left">
                Dale un nombre a tu dragón
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dragonName}
                  onChange={(e) => {
                    setDragonName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="Nombre del dragón"
                  maxLength={15}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-lg font-medium focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {dragonName.length}/15
                </span>
              </div>
              {nameError && (
                <p className="text-red-400 text-sm mt-2 text-left">❌ {nameError}</p>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{elementInfo?.emoji}</span>
                <span className="text-white font-medium">
                  Dragón de {element.charAt(0).toUpperCase() + element.slice(1)}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Nivel 1 • Bebé</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSell}
                className="flex-1 py-4 px-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-medium hover:bg-red-500/30 transition-all text-lg"
              >
                <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '18px', height: '18px', objectFit: 'contain', display: 'inline', verticalAlign: 'middle' }} /> Vender
                <span className="block text-sm opacity-70">50 DC</span>
              </button>

              <button
                onClick={handleSendToHabitat}
                className="flex-1 py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:from-green-400 hover:to-emerald-400 transition-all text-lg"
              >
                🏠 Habitat
                <span className="block text-sm opacity-70">Guardar</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-gray-500 text-sm hover:text-gray-300"
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Selecciona un Habitat</h3>
            <p className="text-gray-400 text-sm mb-4">
              Para <span className="text-purple-400 font-medium">{dragonName}</span>
            </p>

            {getAvailableHabitats().length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-4">🏠</span>
                <p className="text-gray-400">No tienes habitats disponibles</p>
                <p className="text-sm text-gray-500 mt-2">
                  Compra un habitat de {element} en la pestaña Habitats
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {getAvailableHabitats().map(habitat => {
                  const habitatElement = ELEMENTS.find(e => e.id === habitat.element);
                  return (
                    <button
                      key={habitat.id}
                      onClick={() => confirmSendToHabitat(habitat.id)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hover:bg-white/10 hover:border-green-500/50 transition-all"
                    >
                      <img
                        src={getHabitatImagePath(habitat.element)}
                        alt={`Habitat de ${habitat.element}`}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="text-left flex-1">
                        <p className="text-white font-medium">
                          {habitatElement?.emoji} Habitat de {habitat.element ? habitat.element.charAt(0).toUpperCase() + habitat.element.slice(1) : 'General'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {habitat.dragons.length}/{habitat.maxDragons} dragones • Nivel {habitat.level}
                        </p>
                      </div>
                      <span className="text-green-400">→</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowSelectHabitat(false)}
              className="w-full py-3 bg-white/10 rounded-xl text-white hover:bg-white/15"
            >
              ← Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: INCUBADORA (v5.2) - TAMAÑOS CORREGIDOS
// ============================================

function IncubatorTab({
  incubator,
  setIncubator,
  userProfile,
  setUserProfile,
  habitats,
  setHabitats,
  allDragons,
  setAllDragons,
  onHatchComplete
}) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHatchedModal, setShowHatchedModal] = useState(null);

  // Timer para actualizar eclosiones
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setIncubator(prev => {
        const updatedEggs = prev.eggs.map(egg => {
          if (!egg.hatched && now >= egg.hatchTime) {
            return {
              ...egg,
              hatched: true,
              readyToCollect: true,
              dragonData: {
                id: `dragon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `Dragón ${egg.element.charAt(0).toUpperCase() + egg.element.slice(1)}`,
                element: egg.element,
                level: 1,
                exp: 0,
                maturityState: 1,
                dragonId: 1,
                createdAt: Date.now(),
              }
            };
          }
          return egg;
        });

        return { ...prev, eggs: updatedEggs };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setIncubator]);

  // Mandar dragón a habitat CON NOMBRE (v5.2)
  const handleSendToHabitat = (egg, habitatId, dragonWithName) => {
    const dragon = dragonWithName || egg.dragonData;

    // Validación de elemento: el dragón debe ser compatible con el habitat
    const targetHabitat = habitats.find(h => h.id === habitatId);
    if (targetHabitat && targetHabitat.element && targetHabitat.element !== egg.element) {
      alert(`❌ Un dragón de ${egg.element} no puede vivir en un habitat de ${targetHabitat.element}`);
      return;
    }

    setAllDragons(prev => [...prev, { ...dragon, habitatId }]);

    setHabitats(prev => prev.map(h => {
      if (h.id === habitatId) {
        const newDragons = [...h.dragons, dragon.id];
        return { ...h, dragons: newDragons, element: h.element || egg.element };
      }
      return h;
    }));

    setIncubator(prev => ({
      ...prev,
      eggs: prev.eggs.filter(e => e.id !== egg.id),
    }));

    setShowHatchedModal(null);
  };

  // Vender dragón
  const handleSellDragon = (egg) => {
    const sellPrice = 50;

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins + sellPrice,
    }));

    setIncubator(prev => ({
      ...prev,
      eggs: prev.eggs.filter(e => e.id !== egg.id),
    }));

    setShowHatchedModal(null);
  };

  const handleBuyEgg = (element) => {
    const price = SHOP_PRICES.egg[element];

    if (userProfile.dragoncoins < price) {
      alert('No tienes suficientes Dragoncoins');
      return;
    }

    if (incubator.eggs.length >= incubator.slots) {
      alert('No tienes espacio en la incubadora');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins - price,
    }));

    const newEgg = {
      id: `egg_${Date.now()}`,
      element: element,
      startTime: Date.now(),
      hatchTime: Date.now() + INCUBATION_TIME,
      hatched: false,
      readyToCollect: false,
    };

    setIncubator(prev => ({
      ...prev,
      eggs: [...prev.eggs, newEgg],
    }));

    setShowBuyModal(false);
  };

  const handleBuySlot = () => {
    if (incubator.slots >= 3) {
      alert('Ya tienes el máximo de slots');
      return;
    }

    const price = incubator.slots === 1
      ? SHOP_PRICES.incubatorSlot
      : SHOP_PRICES.incubatorSlot3;

    if (userProfile.dragoncoins < price) {
      alert('No tienes suficientes Dragoncoins');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins - price,
    }));

    setIncubator(prev => ({
      ...prev,
      slots: prev.slots + 1,
    }));
  };

  const getTimeRemaining = (hatchTime) => {
    const remaining = hatchTime - Date.now();
    if (remaining <= 0) return 'Listo';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🥚 Incubadora
        </h2>
        <div className="flex items-center gap-2 text-yellow-400">
          <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span className="font-bold">{userProfile.dragoncoins} DC</span>
        </div>
      </div>

      {/* SLOTS DE INCUBADORA - TAMAÑOS CORREGIDOS v5.2 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 3 }).map((_, index) => {
          const egg = incubator.eggs[index];
          const isUnlocked = index < incubator.slots;

          return (
            <div
              key={index}
              className={`
                relative rounded-2xl border-2 flex flex-col items-center justify-center p-6 transition-all min-h-[280px]
                ${isUnlocked
                  ? egg
                    ? egg.hatched
                      ? 'bg-gradient-to-b from-green-500/20 to-green-500/5 border-green-500/50 cursor-pointer hover:border-green-400'
                      : 'bg-gradient-to-b from-purple-500/20 to-purple-500/5 border-purple-500/50'
                    : 'bg-white/5 border-white/20 border-dashed cursor-pointer hover:bg-white/10'
                  : 'bg-black/30 border-gray-700 cursor-pointer hover:border-yellow-500/50'
                }
              `}
              onClick={() => {
                if (!isUnlocked) {
                  handleBuySlot();
                } else if (!egg) {
                  setShowBuyModal(true);
                } else if (egg.hatched) {
                  setShowHatchedModal(egg);
                }
              }}
            >
              {isUnlocked ? (
                egg ? (
                  egg.hatched ? (
                    <>
                      {/* DRAGÓN ECLOSIONADO - TAMAÑO 200% MÁS GRANDE */}
                      <img
                        src={getDragonImagePath(egg.element, egg.dragonData?.dragonId || 1, 1)}
                        alt={`Dragón de ${egg.element}`}
                        className="w-36 h-36 object-contain animate-bounce"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))' }}
                      />
                      <p className="text-lg text-green-400 font-bold mt-4">¡Eclosionó!</p>
                      <p className="text-sm text-gray-400 mt-1">Click para ver</p>
                    </>
                  ) : (
                    <>
                      {/* HUEVO EN INCUBACIÓN - TAMAÑO 200% MÁS GRANDE */}
                      <img
                        src={LANDING_ASSETS.eggs[egg.element]}
                        alt={`Huevo de ${egg.element}`}
                        className="w-36 h-36 object-contain animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' }}
                      />
                      <div className="mt-4 text-center">
                        <p className="text-base text-gray-400 font-medium">Eclosiona en</p>
                        <p className="text-4xl font-bold text-purple-400 mt-2">
                          {getTimeRemaining(egg.hatchTime)}
                        </p>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    {/* Slot vacío - TAMAÑO AUMENTADO */}
                    <span className="text-6xl opacity-30">🥚</span>
                    <p className="text-base text-gray-500 mt-4">Vacío</p>
                    <p className="text-base text-purple-400 mt-1">Click para comprar</p>
                  </>
                )
              ) : (
                <>
                  {/* Slot bloqueado - TAMAÑO AUMENTADO */}
                  <span className="text-5xl">🔒</span>
                  <p className="text-base text-gray-500 mt-4">Bloqueado</p>
                  <p className="text-lg text-yellow-400 font-bold mt-1">
                    {index === 1 ? SHOP_PRICES.incubatorSlot : SHOP_PRICES.incubatorSlot3} DC
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: DRAGÓN ECLOSIONADO CON NOMBRE v5.2 */}
      {showHatchedModal && (
        <HatchedDragonModal
          egg={showHatchedModal}
          onClose={() => setShowHatchedModal(null)}
          onSendToHabitat={handleSendToHabitat}
          onSell={handleSellDragon}
          habitats={habitats}
          allDragons={allDragons}
          element={showHatchedModal.element}
        />
      )}

      {/* Modal de compra de huevo */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Comprar Huevo</h3>

            <div className="grid grid-cols-2 gap-3">
              {ELEMENTS.map(element => (
                <button
                  key={element.id}
                  onClick={() => handleBuyEgg(element.id)}
                  disabled={userProfile.dragoncoins < SHOP_PRICES.egg[element.id]}
                  className={`
                    p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                    ${userProfile.dragoncoins >= SHOP_PRICES.egg[element.id]
                      ? 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10'
                      : 'border-gray-700 opacity-50 cursor-not-allowed'
                    }
                  `}
                  style={{ borderColor: element.color + '40' }}
                >
                  <span className="text-3xl">{element.emoji}</span>
                  <span className="text-white font-medium">{element.name}</span>
                  <span className="text-yellow-400 text-sm">
                    <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '16px', height: '16px', objectFit: 'contain', display: 'inline', verticalAlign: 'middle' }} /> {SHOP_PRICES.egg[element.id]} DC
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBuyModal(false)}
              className="w-full mt-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/15"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: HABITATS (v5.1) - CON MODAL DETALLE
// ============================================

function HabitatsTab({
  habitats,
  setHabitats,
  allDragons,
  userProfile,
  setUserProfile,
  onSelectDragon
}) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedHabitat, setSelectedHabitat] = useState(null);

  const handleBuyHabitat = (element) => {
    const price = SHOP_PRICES.habitat[element];

    if (userProfile.dragoncoins < price) {
      alert('No tienes suficientes Dragoncoins');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins - price,
    }));

    const newHabitat = {
      id: `habitat_${Date.now()}`,
      element: element,
      level: 1,
      maxDragons: 2,
      dragons: [],
    };

    setHabitats(prev => [...prev, newHabitat]);
    setShowBuyModal(false);
  };

  const getDragonsInHabitat = (habitatId) => {
    return allDragons.filter(d => d.habitatId === habitatId);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏠 Habitats
        </h2>
        <button
          onClick={() => setShowBuyModal(true)}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl text-purple-400 text-sm font-medium hover:bg-purple-500/30"
        >
          + Nuevo Habitat
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {habitats.map(habitat => {
          const dragonsHere = getDragonsInHabitat(habitat.id);
          const elementInfo = ELEMENTS.find(e => e.id === habitat.element);

          return (
            <button
              key={habitat.id}
              onClick={() => setSelectedHabitat(habitat)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-purple-500/30 transition-all"
              style={{ borderColor: elementInfo?.color + '30' }}
            >
              <div className="flex justify-center mb-3">
                <img
                  src={getHabitatImagePath(habitat.element)}
                  alt={`Habitat de ${habitat.element}`}
                  className="w-20 h-20 object-contain"
                />
              </div>

              <div className="text-center">
                <p className="text-white font-medium text-sm">
                  {elementInfo?.emoji} {habitat.element ? habitat.element.charAt(0).toUpperCase() + habitat.element.slice(1) : 'General'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Nv.{habitat.level} • {dragonsHere.length}/{habitat.maxDragons} 🐲
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal de detalle de habitat */}
      {selectedHabitat && (
        <HabitatDetailModal
          habitat={selectedHabitat}
          onClose={() => setSelectedHabitat(null)}
          allDragons={allDragons}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          setHabitats={setHabitats}
          onSelectDragon={onSelectDragon}
        />
      )}

      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Comprar Habitat</h3>

            <div className="grid grid-cols-2 gap-3">
              {ELEMENTS.map(element => (
                <button
                  key={element.id}
                  onClick={() => handleBuyHabitat(element.id)}
                  disabled={userProfile.dragoncoins < SHOP_PRICES.habitat[element.id]}
                  className={`
                    p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                    ${userProfile.dragoncoins >= SHOP_PRICES.habitat[element.id]
                      ? 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10'
                      : 'border-gray-700 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <img
                    src={getHabitatImagePath(element.id)}
                    alt={`Habitat de ${element.name}`}
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-white font-medium">{element.name}</span>
                  <span className="text-yellow-400 text-sm">
                    <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '16px', height: '16px', objectFit: 'contain', display: 'inline', verticalAlign: 'middle' }} /> {SHOP_PRICES.habitat[element.id]} DC
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBuyModal(false)}
              className="w-full mt-4 py-3 bg-white/10 rounded-xl text-white hover:bg-white/15"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: BREED (v5.0)
// ============================================

function BreedTab({
  allDragons,
  userProfile,
  setUserProfile,
  incubator,
  setIncubator,
  breedingCooldowns,
  setBreedingCooldowns,
  regenmonData
}) {
  const [selectedParent1, setSelectedParent1] = useState(null);
  const [selectedParent2, setSelectedParent2] = useState(null);
  const [showResult, setShowResult] = useState(null);

  const adultDragons = allDragons.filter(d => d.level >= 10);

  const canBreed = (dragon) => {
    const cooldown = breedingCooldowns[dragon.id];
    if (!cooldown) return true;
    return Date.now() >= cooldown;
  };

  const calculateBreedResult = (parent1, parent2) => {
    const combo = `${parent1.element}+${parent2.element}`;
    const hybridInfo = HYBRID_CHANCES[combo];

    if (hybridInfo && Math.random() < hybridInfo.chance) {
      return { element: hybridInfo.hybrid, isHybrid: true };
    }

    return {
      element: Math.random() < 0.5 ? parent1.element : parent2.element,
      isHybrid: false
    };
  };

  const handleBreed = () => {
    if (!selectedParent1 || !selectedParent2) {
      alert('Selecciona dos dragones');
      return;
    }

    if (selectedParent1.id === selectedParent2.id) {
      alert('No puedes criar un dragón consigo mismo');
      return;
    }

    if (!canBreed(selectedParent1) || !canBreed(selectedParent2)) {
      alert('Uno de los dragones está en cooldown');
      return;
    }

    if (incubator.eggs.length >= incubator.slots) {
      alert('No tienes espacio en la incubadora');
      return;
    }

    const cost = SHOP_PRICES.breedCost;
    if (userProfile.dragoncoins < cost) {
      alert('No tienes suficientes Dragoncoins');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins - cost,
    }));

    const result = calculateBreedResult(selectedParent1, selectedParent2);

    const newEgg = {
      id: `egg_${Date.now()}`,
      element: result.element,
      startTime: Date.now(),
      hatchTime: Date.now() + INCUBATION_TIME,
      hatched: false,
      readyToCollect: false,
      isHybrid: result.isHybrid,
      parents: [selectedParent1.id, selectedParent2.id],
    };

    setIncubator(prev => ({
      ...prev,
      eggs: [...prev.eggs, newEgg],
    }));

    const cooldownTime = Date.now() + BREED_COOLDOWN;
    setBreedingCooldowns(prev => ({
      ...prev,
      [selectedParent1.id]: cooldownTime,
      [selectedParent2.id]: cooldownTime,
    }));

    setShowResult(result);

    setTimeout(() => {
      setSelectedParent1(null);
      setSelectedParent2(null);
      setShowResult(null);
    }, 3000);
  };

  const formatCooldown = (timestamp) => {
    const remaining = timestamp - Date.now();
    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          💕 Breeding
        </h2>
        <div className="text-sm text-gray-400">
          Dragones adultos: {adultDragons.length}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            onClick={() => setSelectedParent1(null)}
            className={`
              w-24 h-24 rounded-2xl border-2 flex items-center justify-center
              ${selectedParent1
                ? 'bg-pink-500/20 border-pink-500/50'
                : 'bg-white/5 border-white/20 border-dashed'
              }
            `}
          >
            {selectedParent1 ? (
              <div className="text-center">
                <img
                  src={getDragonImagePath(selectedParent1.element, selectedParent1.dragonId, selectedParent1.maturityState)}
                  alt={selectedParent1.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            ) : (
              <span className="text-gray-500">?</span>
            )}
          </div>

          <div className="text-3xl animate-pulse">💕</div>

          <div
            onClick={() => setSelectedParent2(null)}
            className={`
              w-24 h-24 rounded-2xl border-2 flex items-center justify-center
              ${selectedParent2
                ? 'bg-blue-500/20 border-blue-500/50'
                : 'bg-white/5 border-white/20 border-dashed'
              }
            `}
          >
            {selectedParent2 ? (
              <div className="text-center">
                <img
                  src={getDragonImagePath(selectedParent2.element, selectedParent2.dragonId, selectedParent2.maturityState)}
                  alt={selectedParent2.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            ) : (
              <span className="text-gray-500">?</span>
            )}
          </div>
        </div>

        <button
          onClick={handleBreed}
          disabled={!selectedParent1 || !selectedParent2 || userProfile.dragoncoins < SHOP_PRICES.breedCost}
          className={`
            w-full py-3 rounded-xl font-bold text-lg transition-all
            ${selectedParent1 && selectedParent2 && userProfile.dragoncoins >= SHOP_PRICES.breedCost
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Criar ({SHOP_PRICES.breedCost} DC)
        </button>
      </div>

      <h3 className="text-sm font-medium text-gray-400 mb-3">
        Selecciona dos dragones adultos (Nivel 10+)
      </h3>

      {adultDragons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tienes dragones adultos aún</p>
          <p className="text-sm">Sube tus dragones a nivel 10 para poder criarlos</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {adultDragons.map(dragon => {
            const isSelected = selectedParent1?.id === dragon.id || selectedParent2?.id === dragon.id;
            const cooldown = formatCooldown(breedingCooldowns[dragon.id]);

            return (
              <button
                key={dragon.id}
                onClick={() => {
                  if (cooldown) return;

                  if (!selectedParent1) {
                    setSelectedParent1(dragon);
                  } else if (!selectedParent2 && dragon.id !== selectedParent1.id) {
                    setSelectedParent2(dragon);
                  }
                }}
                disabled={!!cooldown}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'border-purple-500 bg-purple-500/20'
                    : cooldown
                      ? 'border-gray-700 opacity-50'
                      : 'border-white/10 hover:border-purple-500/50'
                  }
                `}
              >
                <img
                  src={getDragonImagePath(dragon.element, dragon.dragonId, dragon.maturityState)}
                  alt={dragon.name}
                  className="w-12 h-12 mx-auto object-contain"
                />
                <p className="text-xs text-white truncate mt-1">{dragon.name}</p>
                <p className="text-[10px] text-gray-400">Nv.{dragon.level}</p>
                {cooldown && (
                  <p className="text-[10px] text-red-400">⏳ {cooldown}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🥚</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {showResult.isHybrid ? '¡WOW! ¡Huevo Híbrido!' : '¡Nuevo Huevo!'}
            </h3>
            <p className="text-gray-400">
              Obtuviste un huevo de{' '}
              <span className="text-purple-400 font-bold">
                {showResult.element.charAt(0).toUpperCase() + showResult.element.slice(1)}
              </span>
            </p>
            {showResult.isHybrid && (
              <p className="text-yellow-400 text-sm mt-2">🌟 ¡Elemento raro!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: BARRA DE XP DEL PERFIL (v5.1)
// ============================================

function ProfileXPBar({ userProfile }) {
  const currentLevelExp = PROFILE_EXP_TABLE[userProfile.level] || 0;
  const nextLevelExp = PROFILE_EXP_TABLE[userProfile.level + 1] || PROFILE_EXP_TABLE[20];
  const expInCurrentLevel = userProfile.exp - currentLevelExp;
  const expNeededForLevel = nextLevelExp - currentLevelExp;
  const expProgress = Math.min(100, (expInCurrentLevel / expNeededForLevel) * 100);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-lg">👤</span>
        <div className="text-center">
          <p className="text-xs text-gray-400">Perfil</p>
          <p className="text-white font-bold">Nv.{userProfile.level}</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>XP</span>
          <span>{expInCurrentLevel}/{expNeededForLevel}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${expProgress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-lg">
        <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
        <span className="text-yellow-400 font-bold">{userProfile.dragoncoins}</span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: CANJEAR CÓDIGO (v5.1)
// ============================================

function RedeemCodeModal({ isOpen, onClose, userProfile, setUserProfile }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [usedCodes, setUsedCodes] = useState(() => {
    const saved = localStorage.getItem('regenmon_used_codes');
    return saved ? JSON.parse(saved) : [];
  });

  const handleRedeem = () => {
    const upperCode = code.toUpperCase().trim();

    if (!PROMO_CODES[upperCode]) {
      setMessage({ type: 'error', text: 'Código inválido' });
      return;
    }

    if (usedCodes.includes(upperCode)) {
      setMessage({ type: 'error', text: 'Ya usaste este código' });
      return;
    }

    const promo = PROMO_CODES[upperCode];

    if (promo.type === 'dc') {
      setUserProfile(prev => ({
        ...prev,
        dragoncoins: prev.dragoncoins + promo.reward,
      }));
    }

    const newUsedCodes = [...usedCodes, upperCode];
    setUsedCodes(newUsedCodes);
    localStorage.setItem('regenmon_used_codes', JSON.stringify(newUsedCodes));

    setMessage({ type: 'success', text: `¡Canjeaste ${promo.description}!` });
    setCode('');

    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm">
        <h3 className="text-lg font-bold text-white mb-4 text-center">🎟️ Canjear Código</h3>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ingresa tu código"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center font-mono text-lg focus:outline-none focus:border-purple-500"
          maxLength={20}
        />

        {message && (
          <div className={`mt-3 p-3 rounded-lg text-center ${message.type === 'success'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 rounded-xl text-white hover:bg-white/15"
          >
            Cancelar
          </button>
          <button
            onClick={handleRedeem}
            disabled={!code.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Canjear
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: BOTÓN DE REGALO (v5.1)
// ============================================

function GiftButton({ userProfile, setUserProfile }) {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (userProfile.hasClaimedWelcomeGift) return null;

  const handleClaim = () => {
    setClaimed(true);

    setTimeout(() => {
      setUserProfile(prev => ({
        ...prev,
        dragoncoins: prev.dragoncoins + 100,
        hasClaimedWelcomeGift: true,
      }));

      setTimeout(() => {
        setShowGiftModal(false);
      }, 2000);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setShowGiftModal(true)}
        className="relative animate-bounce"
        title="¡Tienes un regalo!"
      >
        <span className="text-2xl">🎁</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>

      {showGiftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-yellow-500/30 rounded-3xl p-8 w-[90%] max-w-[400px] text-center overflow-hidden">

            {!claimed ? (
              <>
                <div className="text-6xl mb-4 animate-bounce">🎁</div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Regalo de Bienvenida!</h2>
                <p className="text-gray-400 mb-6">Como nuevo entrenador, tienes un regalo especial</p>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    <span className="text-2xl font-bold text-yellow-400">100 Dragoncoins</span>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-white font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25"
                >
                  ✨ RECLAMAR ✨
                </button>

                <button
                  onClick={() => setShowGiftModal(false)}
                  className="mt-4 text-gray-500 text-sm hover:text-gray-300"
                >
                  Más tarde
                </button>
              </>
            ) : (
              <>
                <div className="py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-green-400 mb-2">¡Felicidades!</h2>
                  <p className="text-xl text-white">Obtuviste</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-2">+100 DC</p>
                </div>

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-coin-fall"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.3}s`,
                      }}
                    >
                      <img src="/assets/Moneda/Coin.png" alt="DC" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// COMPONENTE: MODAL DE DETALLE DE HABITAT (v5.1)
// ============================================

function HabitatDetailModal({
  habitat,
  onClose,
  allDragons,
  userProfile,
  setUserProfile,
  setHabitats,
  onSelectDragon
}) {
  if (!habitat) return null;

  const dragonsInHabitat = allDragons.filter(d => d.habitatId === habitat.id);

  const elementInfo = ELEMENTS.find(e => e.id === habitat.element) || {
    name: 'General',
    emoji: '🏠',
    color: '#8b5cf6'
  };

  const handleUpgrade = () => {
    if (habitat.level >= 2) {
      alert('Nivel máximo alcanzado');
      return;
    }

    if (userProfile.dragoncoins < SHOP_PRICES.habitatUpgrade) {
      alert('No tienes suficientes Dragoncoins');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      dragoncoins: prev.dragoncoins - SHOP_PRICES.habitatUpgrade,
    }));

    setHabitats(prev => prev.map(h => {
      if (h.id === habitat.id) {
        return {
          ...h,
          level: h.level + 1,
          maxDragons: h.maxDragons + 2,
        };
      }
      return h;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div
        className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-2 rounded-3xl w-full max-w-lg overflow-hidden"
        style={{ borderColor: elementInfo.color + '50' }}
      >
        <div
          className="relative p-6 pb-4"
          style={{ background: `linear-gradient(180deg, ${elementInfo.color}20 0%, transparent 100%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full text-white font-bold text-xl hover:bg-red-400 transition-all shadow-lg"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-white text-center mb-4">
            {elementInfo.emoji} Habitat de {elementInfo.name} nivel {habitat.level}
          </h2>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={getHabitatImagePath(habitat.element)}
                alt={`Habitat de ${habitat.element}`}
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Máx. Dragones</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐲</span>
                  <span className="text-2xl font-bold text-white">
                    {dragonsInHabitat.length}x / {habitat.maxDragons}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Elemento</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{elementInfo.emoji}</span>
                  <span className="text-white font-medium">{elementInfo.name}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Nivel</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Nivel {habitat.level}</span>
                  {habitat.level < 2 && (
                    <button
                      onClick={handleUpgrade}
                      className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 hover:bg-yellow-500/30"
                    >
                      ⬆️ {SHOP_PRICES.habitatUpgrade} DC
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Dragones en este habitat
          </h3>

          {dragonsInHabitat.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🐲</span>
              <p>No hay dragones en este habitat</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {dragonsInHabitat.map(dragon => (
                <button
                  key={dragon.id}
                  onClick={() => {
                    onSelectDragon(dragon);
                    onClose();
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 hover:border-purple-500/50 transition-all"
                >
                  <img
                    src={getDragonImagePath(dragon.element, dragon.dragonId, dragon.maturityState)}
                    alt={dragon.name}
                    className="w-14 h-14 object-contain"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{dragon.name}</p>
                    <p className="text-xs text-gray-400">Nivel {dragon.level}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {dragonsInHabitat.length < habitat.maxDragons && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {Array.from({ length: habitat.maxDragons - dragonsInHabitat.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-white/5 border border-white/10 border-dashed rounded-xl p-3 flex items-center justify-center h-20"
                >
                  <span className="text-gray-600 text-sm">Espacio vacío</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// FLASH CIRCULAR PARA CAMBIO DE ETAPA (v3.1 - 150% más grande)
// ============================================

function StageFlash({ active, color }) {
  if (!active) return null
  const rings = [1, 2, 3]
  const particles = Array.from({ length: 16 }, (_, i) => ({ id: i, angle: (360 / 16) * i }))
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {rings.map(r => (
        <div key={r} className="absolute rounded-full border-[6px] animate-ring-expand" style={{ borderColor: color, boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`, animationDelay: `${(r - 1) * 0.1}s` }} />
      ))}
      {particles.map(p => (
        <div key={p.id} className="absolute w-3 h-3 rounded-full animate-particle-fly" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}`, '--fly-angle': `${p.angle}deg`, animationDelay: `${Math.random() * 0.2}s` }} />
      ))}
    </div>
  )
}

// ============================================
// PANEL DE CHAT (v4.4) - CON STORAGE POR USUARIO
// ============================================

function ChatPanel({ regenmon, stats, onStatsChange, storagePrefix = '' }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memories, setMemories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Claves de storage con prefijo de usuario
  const chatKey = storagePrefix ? `${storagePrefix}_${CHAT_STORAGE_KEY}` : CHAT_STORAGE_KEY;
  const memoriesKey = storagePrefix ? `${storagePrefix}_${MEMORIES_KEY}` : MEMORIES_KEY;

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar mensajes y memorias de localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(chatKey);
    const savedMemories = localStorage.getItem(memoriesKey);

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
  }, [chatKey, memoriesKey]);

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const messagesToSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
    }
  }, [messages, chatKey]);

  // Guardar memorias en localStorage
  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem(memoriesKey, JSON.stringify(memories));
    }
  }, [memories, memoriesKey]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (isExpanded || !isMobile) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, isMobile]);

  // Auto-focus en input cuando se expande en móvil
  useEffect(() => {
    if (isMobile && isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isExpanded, isMobile]);

  // Toggle expandir/colapsar
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Detectar memorias en el mensaje del usuario
  const detectMemories = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    const newMemories = [];

    // Detectar nombre del usuario
    const nameMatch = lowerMsg.match(/(?:me llamo|mi nombre es|soy) (\w+)/);
    if (nameMatch) {
      newMemories.push(`El nombre de mi dueño es ${nameMatch[1]}`);
    }

    // Detectar gustos
    const likeMatch = lowerMsg.match(/(?:me gusta|me encanta|amo) (.+?)(?:\.|,|$)/);
    if (likeMatch) {
      newMemories.push(`A mi dueño le gusta ${likeMatch[1]}`);
    }

    // Detectar color favorito
    const colorMatch = lowerMsg.match(/(?:mi color favorito es|me gusta el color) (\w+)/);
    if (colorMatch) {
      newMemories.push(`El color favorito de mi dueño es ${colorMatch[1]}`);
    }

    // Agregar nuevas memorias (máximo 10)
    if (newMemories.length > 0) {
      setMemories(prev => {
        const updated = [...prev, ...newMemories].slice(-10);
        return [...new Set(updated)]; // Eliminar duplicados
      });
    }
  };

  // Enviar mensaje
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    inputRef.current?.focus();

    // Detectar memorias
    detectMemories(userMessage);

    // Agregar mensaje del usuario
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Aplicar efectos en stats
    onStatsChange(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 5),
      energy: Math.max(0, prev.energy - 3),
    }));

    // Mostrar indicador de escritura
    setIsTyping(true);

    try {
      // Preparar mensajes para la API (solo los últimos 10 para contexto)
      const apiMessages = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: 'user', content: userMessage });

      // Llamar a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          regenmonData: {
            name: regenmon.name,
            element: regenmon.element,
            maturityState: regenmon.maturityState,
            stats: stats,
            memories: memories,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Pequeño delay para que se sienta natural
      await new Promise(resolve => setTimeout(resolve, 500));

      // Agregar respuesta del Regenmon
      const regenmonMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, regenmonMessage]);

      // Penalización si hay muchos mensajes seguidos
      const recentMessages = messages.slice(-5);
      if (recentMessages.length >= 5) {
        onStatsChange(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 5),
        }));
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error);

      // Mensaje de error del Regenmon
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '😵 *bosteza* Perdón, estoy un poco confundido... ¿Puedes repetir eso?',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-panel ${isMobile ? 'mobile' : 'desktop'} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header - Siempre visible, clickeable en móvil */}
      <div
        className="chat-header"
        onClick={isMobile ? toggleExpanded : undefined}
        style={{ cursor: isMobile ? 'pointer' : 'default' }}
      >
        <div className="chat-header-left">
          <span className="chat-title">💬 Chat</span>
          {memories.length > 0 && (
            <span className="memories-indicator">🧠 {memories.length}</span>
          )}
        </div>

        {/* Botón de expandir/colapsar - SOLO EN MÓVIL */}
        {isMobile && (
          <button
            className="chat-toggle-button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            aria-label={isExpanded ? 'Minimizar chat' : 'Expandir chat'}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Contenido del chat - Oculto cuando está colapsado en móvil */}
      {(!isMobile || isExpanded) && (
        <>
          {/* Área de mensajes */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>¡Saluda a {regenmon.name}!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.role === 'user' ? 'user' : 'regenmon'}`}
              >
                <span className="bubble-content">{msg.content}</span>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="chat-bubble regenmon typing">
                <span className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              maxLength={200}
            />
            <button
              className="chat-send-button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              📤
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// CARRUSEL DE ELEMENTOS
// ============================================

function ElementCarousel({ onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const currentElement = ELEMENTS[currentIndex]

  const goNext = () => { setSlideDirection('right'); setCurrentIndex((prev) => (prev + 1) % ELEMENTS.length); setTimeout(() => setSlideDirection(null), 300) }
  const goPrev = () => { setSlideDirection('left'); setCurrentIndex((prev) => (prev - 1 + ELEMENTS.length) % ELEMENTS.length); setTimeout(() => setSlideDirection(null), 300) }
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => { if (!touchStart || !touchEnd) return; const distance = touchStart - touchEnd; if (distance > 50) goNext(); if (distance < -50) goPrev() }

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Selecciona tu Elemento</h2>
      <div className="flex items-center gap-4 md:gap-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <button onClick={goPrev} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl hover:bg-white/20 hover:scale-110 transition-all">◀</button>
        <div className={`w-72 h-96 md:w-80 md:h-[420px] rounded-2xl bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-6 p-6 transition-all duration-300 ${slideDirection === 'right' ? 'animate-slide-in-right' : ''} ${slideDirection === 'left' ? 'animate-slide-in-left' : ''}`} style={{ boxShadow: `0 0 60px ${currentElement.glowColor}`, border: `2px solid ${currentElement.color}40` }}>
          <img src={getEggImagePath(currentElement.id, 0)} alt={`Huevo ${currentElement.name}`} className="w-44 h-44 md:w-52 md:h-52 object-contain drop-shadow-2xl hover:scale-105 transition-transform" draggable={false} />
          <span className="text-3xl md:text-4xl font-bold" style={{ color: currentElement.color }}>{currentElement.name}</span>
        </div>
        <button onClick={goNext} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl hover:bg-white/20 hover:scale-110 transition-all">▶</button>
      </div>
      <div className="flex gap-3">{ELEMENTS.map((_, i) => <button key={i} onClick={() => setCurrentIndex(i)} className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`} />)}</div>
      <button onClick={() => onSelect(currentElement.id)} className="px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-105" style={{ backgroundColor: currentElement.color, boxShadow: `0 0 20px ${currentElement.glowColor}` }}>Seleccionar {currentElement.name}</button>
    </div>
  )
}

// ============================================
// VISTA 1: LANDING PAGE (v4.4 - Con Login)
// ============================================

// ============================================
// VISTA 1: LANDING PAGE (v4.6 - Sin estado de conexión)
// ============================================

function LandingPage({ onShowLogin }) {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* HERO SECTION con imagen de fondo */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img src={LANDING_ASSETS.heroBackground} alt="Dragones de Regenmon" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0a0a0f]" />
        </div>
        <Particles colors={['#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']} />
        <div className="text-center z-10 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-pink-500 mb-4 animate-float">REGENMON</h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-4 font-medium">Cuida. Entrena. Evoluciona.</p>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8 px-4">Adopta tu criatura elemental, cuídala diariamente y observa cómo evoluciona de una pequeña cría a un poderoso ser ancestral.</p>
          <button onClick={onShowLogin} className="bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 rounded-full transition-all duration-300 hover:scale-110 animate-pulse-glow shadow-lg shadow-accent/30">🎮 JUGAR</button>
        </div>
      </section>

      {/* ELEMENTOS SECTION con imágenes de huevos */}
      <section className="py-16 md:py-20 px-4 bg-dark-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-10">Los Cuatro Elementos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LANDING_ELEMENTS.map(e => (
              <div key={e.id} className="bg-dark-secondary/50 backdrop-blur-sm border-2 rounded-xl p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-2 shadow-lg group" style={{ borderColor: `${e.color}60`, boxShadow: `0 4px 20px ${e.glowColor}` }}>
                <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-4 flex items-center justify-center">
                  <img src={e.image} alt={`Huevo de ${e.name}`} className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" draggable={false} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-center mb-2" style={{ color: e.color }}>{e.name}</h3>
                <p className="text-xs md:text-sm text-gray-400 text-center leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA SECTION con imágenes de acciones (MÁS GRANDES) */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-dark-bg to-dark-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-10">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {LANDING_ACTIONS.map(a => (
              <div key={a.id} className="text-center p-4 group">
                <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 flex items-center justify-center bg-white/[0.03] rounded-2xl p-4 transition-transform duration-300 group-hover:scale-105">
                  <img src={a.image} alt={a.name} className="w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-lg" draggable={false} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{a.name}</h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVOLUCIÓN SECTION con imagen (MÁS GRANDE) */}
      <section className="py-16 md:py-20 px-4 bg-dark-bg">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Evoluciona tu Regenmon</h2>
          <p className="text-base md:text-lg text-gray-400 mb-10">15 niveles de progresión. 3 etapas de evolución.</p>

          {/* Imagen de evolución - MÁS GRANDE */}
          <div className="max-w-3xl mx-auto mb-10 rounded-2xl overflow-hidden shadow-xl shadow-purple-500/20">
            <img src={LANDING_ASSETS.evolution} alt="Evolución de Regenmon" className="w-full h-auto transition-transform duration-300 hover:scale-[1.02]" draggable={false} />
          </div>

          {/* Etapas */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-10">
            {[
              { emoji: '🐣', name: 'Bebé', levels: 'Nv 1-4' },
              { emoji: '🦎', name: 'Adolescente', levels: 'Nv 5-9' },
              { emoji: '🐉', name: 'Adulto', levels: 'Nv 10+' }
            ].map((stage, i) => (
              <div key={stage.name} className="flex items-center">
                <div className="bg-dark-secondary/80 border border-gray-700 rounded-xl px-5 md:px-8 py-4 md:py-5 hover:border-purple-500/50 transition-all flex flex-col items-center min-w-[120px] md:min-w-[140px]">
                  <span className="text-3xl mb-1">{stage.emoji}</span>
                  <span className="text-base md:text-lg font-medium text-white">{stage.name}</span>
                  <span className="text-xs md:text-sm text-gray-500">{stage.levels}</span>
                </div>
                {i < 2 && <span className="hidden md:block text-purple-400 text-3xl mx-3">→</span>}
              </div>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">Cada evolución desbloquea nuevas habilidades y aumenta el poder de tu dragón en el ecosistema de DragonChain. Los dragones adultos son los guardianes más poderosos de la blockchain.</p>
        </div>
      </section>

      <footer className="py-8 px-4 bg-dark-secondary/50 border-t border-gray-800"><div className="max-w-6xl mx-auto text-center"><p className="text-gray-500 text-sm">© 2024 Regenmon</p></div></footer>
    </div>
  )
}

// ============================================
// VISTA 2: REGISTRO (v4.7 - Con verificación de nombres)
// ============================================

function RegisterPage({ onBack, onCreate }) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const nameLength = name.length
  const isNameValid = nameLength >= 3 && nameLength <= 15 && /^[a-zA-Z0-9]+$/.test(name) && !nameError

  // Verificar nombre duplicado
  const checkNameExists = (nameToCheck) => {
    const keys = Object.keys(localStorage)

    for (const key of keys) {
      if (key.includes('regenmon_save')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          if (data?.regenmon?.name?.toLowerCase() === nameToCheck.toLowerCase()) {
            return true
          }
        } catch (e) {
          continue
        }
      }
    }
    return false
  }

  // Validar nombre cuando cambia
  useEffect(() => {
    if (name.length === 0) {
      setNameError('')
      return
    }

    if (name.length < 3) {
      setNameError('Mínimo 3 caracteres')
      return
    }

    if (name.length > 15) {
      setNameError('Máximo 15 caracteres')
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      setNameError('Solo letras y números')
      return
    }

    // Verificar nombre duplicado
    if (checkNameExists(name)) {
      setNameError('Este nombre ya está en uso')
      return
    }

    setNameError('')
  }, [name])

  // Manejar selección de elemento
  const handleElementSelect = (elementId) => {
    if (!isNameValid || isChecking) return

    setIsChecking(true)

    // Verificar nombre una vez más antes de crear
    if (checkNameExists(name)) {
      setNameError('Este nombre ya está en uso')
      setIsChecking(false)
      return
    }

    // Crear el regenmon
    onCreate(name, elementId)
    setIsChecking(false)
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <Particles colors={['#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']} />
      <div className="max-w-xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Volver</button>
        <div className="text-center mb-10"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Registra tu Regenmon</h1><p className="text-gray-400">Dale vida a tu nueva criatura elemental</p></div>
        <div className="mb-10">
          <label className="block text-white font-medium mb-2">Nombre de tu Regenmon</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sparky, Rocky, Aqua..."
              maxLength={15}
              disabled={isChecking}
              className={`w-full bg-dark-secondary/80 backdrop-blur-sm border-2 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${nameError ? 'border-red-500' : isNameValid ? 'border-green-500' : 'border-gray-700 focus:border-accent'}`}
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${nameLength > 15 ? 'text-red-500' : 'text-gray-500'}`}>{nameLength}/15</span>
          </div>
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          {isNameValid && <p className="text-green-500 text-sm mt-1">✓ Nombre disponible</p>}
        </div>
        <div className="mb-6"><label className="block text-white font-medium mb-4 text-center">Elige tu elemento</label><ElementCarousel onSelect={handleElementSelect} /></div>
        {!isNameValid && <p className="text-center text-gray-500 text-sm mt-4">Ingresa un nombre válido para seleccionar tu elemento</p>}
      </div>
    </div>
  )
}

// ============================================
// VISTA 3: ECLOSIÓN (SIN CONTADORES)
// ============================================

function HatchingPage({ regenmonData, onHatchComplete }) {
  const [clickCount, setClickCount] = useState(0)
  const [eggStage, setEggStage] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showStageFlash, setShowStageFlash] = useState(false)
  const [dragonId, setDragonId] = useState(null)

  const element = ELEMENTS.find(e => e.id === regenmonData.class)
  const folder = ELEMENT_TO_FOLDER[regenmonData.class]

  useEffect(() => { for (let i = 0; i <= 3; i++) { const img = new Image(); img.src = getEggImagePath(regenmonData.class, i) } }, [regenmonData.class])
  useEffect(() => { const id = getRandomDragonId(regenmonData.class); setDragonId(id); const img = new Image(); img.src = getDragonImagePath(regenmonData.class, id, 1) }, [regenmonData.class])

  const handleEggClick = () => {
    if (showFlash) return
    const newCount = clickCount + 1
    setClickCount(newCount)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 200)
    const newStage = Math.floor(newCount / CLICKS_PER_STAGE)
    if (newStage !== eggStage && newStage <= 3) {
      setEggStage(newStage)
      setShowStageFlash(true)
      setTimeout(() => setShowStageFlash(false), 600)
    }
    if (newCount >= TOTAL_CLICKS_TO_HATCH) { setShowExplosion(true); setTimeout(() => setShowFlash(true), 400); setTimeout(() => { setShowFlash(false); onHatchComplete(dragonId) }, 1200) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: ELEMENT_BACKGROUNDS[folder] }}>
      <Particles colors={element?.particles || ELEMENT_PARTICLES['FUEGO']} />
      {showFlash && <div className="fixed inset-0 bg-white z-50 animate-flash" />}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 z-10 animate-pulse">¡Clickea para eclosionar!</h2>
      <p className="text-gray-400 mb-12 z-10">{regenmonData.name} está esperando...</p>
      <div className="relative z-10 mb-12">
        <ExplosionParticles colors={element?.particles} active={showExplosion} />
        <StageFlash active={showStageFlash} color={element?.color} />
        <button onClick={handleEggClick} className={`relative cursor-pointer transition-transform ${isShaking ? 'animate-egg-shake' : 'hover:scale-105'}`} style={{ touchAction: 'manipulation' }}>
          <img src={getEggImagePath(regenmonData.class, Math.min(eggStage, 3))} alt="Huevo" className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl" draggable={false} />
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-8 z-10 animate-bounce">👆 Toca el huevo</p>
    </div>
  )
}

// ============================================
// VISTA 4: DRAGÓN REVELADO
// ============================================

function DragonRevealPage({ regenmonData, onStartGame }) {
  const [showContent, setShowContent] = useState(false)
  const element = ELEMENTS.find(e => e.id === regenmonData.class)
  const folder = ELEMENT_TO_FOLDER[regenmonData.class]

  useEffect(() => { const t = setTimeout(() => setShowContent(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: ELEMENT_BACKGROUNDS[folder] }}>
      <Particles colors={element?.particles || ELEMENT_PARTICLES['FUEGO']} />
      {showContent && (<div className="text-center z-10 mb-8 animate-fade-in-down"><p className="text-2xl mb-2">✨</p><h2 className="text-3xl md:text-4xl font-bold text-white">¡Ha nacido!</h2></div>)}
      {showContent && (
        <div className="relative z-10 mb-8 animate-dragon-reveal">
          <img src={getDragonImagePath(regenmonData.class, regenmonData.dragonId, 1)} alt={regenmonData.name} className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl" draggable={false} />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full animate-ping opacity-60" />
          <div className="absolute -top-4 right-8 w-3 h-3 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '0.3s' }} />
        </div>
      )}
      {showContent && (
        <div className="text-center z-10 mb-8 animate-fade-in-up">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{regenmonData.name}</h3>
          <p className="text-lg text-gray-300">{element?.emoji} Dragón de <span style={{ color: element?.color }} className="font-medium">{element?.name?.toLowerCase().charAt(0).toUpperCase() + element?.name?.toLowerCase().slice(1)}</span></p>
          <p className="text-sm text-gray-500 mt-2">Nivel 1 • Bebé</p>
        </div>
      )}
      {showContent && <button onClick={onStartGame} className="z-10 mt-4 bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>🎮 ¡Comenzar juego!</button>}
    </div>
  )
}

// ============================================
// VISTA 5: JUEGO PRINCIPAL (v4.1 - Con Chat)
// ============================================

function GamePage({
  regenmonData,
  setRegenmon,
  stats,
  setStats,
  resources,
  setResources,
  cooldowns,
  setCooldowns,
  dailyUses,
  setDailyUses,
  onReset,
  onLogout,
  userData,
  isGuest,
  storagePrefix = '',
  // Props de economía v5.0
  userProfile,
  setUserProfile,
  incubator,
  setIncubator,
  habitats,
  setHabitats,
  allDragons,
  setAllDragons,
  breedingCooldowns,
  setBreedingCooldowns,
  addProfileExp,
}) {
  const element = ELEMENTS.find(e => e.id === regenmonData.class)
  const folder = ELEMENT_TO_FOLDER[regenmonData.class]
  const elementBonus = ELEMENT_BONUSES[regenmonData.class] || {}

  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [isEvolving, setIsEvolving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [actionAnimations, setActionAnimations] = useState({})
  const [activeTab, setActiveTab] = useState('dragon') // Sistema de pestañas v5.0
  const [showRedeemCode, setShowRedeemCode] = useState(false) // Modal de códigos v5.1

  const regenmon = regenmonData
  const mood = calculateMood(stats)
  const moodConfig = MOOD_CONFIG[mood]
  const maturityState = getMaturityState(regenmon.level)

  // Verificar reset diario
  useEffect(() => {
    const today = new Date().toDateString()
    if (dailyUses.lastReset !== today) {
      setDailyUses({ feed: 0, train: 0, play: 0, lastReset: today })
    }
  }, [dailyUses.lastReset])

  // Actualizar cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => ({
        feed: Math.max(0, prev.feed - 1000),
        train: Math.max(0, prev.train - 1000),
        play: Math.max(0, prev.play - 1000),
        rest: Math.max(0, prev.rest - 1000),
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // GENERACIÓN DE COMIDA
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        const elapsed = Date.now() - prev.lastFoodGenTime
        if (elapsed >= TIMERS.foodGeneration) {
          const newFood = Math.min(prev.food + 1, prev.maxFood)
          return {
            ...prev,
            food: newFood,
            lastFoodGenTime: Date.now()
          }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // CONSUMO DE HAMBRE (-1 cada 20 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        const elapsed = Date.now() - (prev.lastHungerDecay || Date.now())
        if (elapsed >= TIMERS.hungerDecay) {
          const newHunger = Math.max(0, stats.hunger - 1)
          setStats(s => ({ ...s, hunger: newHunger }))
          return {
            ...prev,
            lastHungerDecay: Date.now()
          }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [stats.hunger])

  // CONSUMO DE FELICIDAD (-1 cada 20 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        happiness: Math.max(0, prev.happiness - 1)
      }))
    }, TIMERS.happinessDecay)
    return () => clearInterval(interval)
  }, [])

  // PENALIZACIÓN POR HAMBRE = 0 (-2 felicidad cada 20 segundos)
  useEffect(() => {
    if (stats.hunger === 0) {
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          happiness: Math.max(0, prev.happiness - 2)
        }))
      }, TIMERS.starvingPenalty)
      return () => clearInterval(interval)
    }
  }, [stats.hunger])

  const addExperience = (amount) => {
    let expGain = amount * moodConfig.expModifier
    if (elementBonus.trainingExpBonus && amount === ACTIONS.train.effects.exp) expGain *= (1 + elementBonus.trainingExpBonus)
    expGain = Math.floor(expGain)

    setRegenmon(prev => {
      let newExp = prev.exp + expGain
      let newLevel = prev.level
      let newMaturity = prev.maturityState
      let leveledUp = false
      let evolved = false
      const oldLevel = prev.level

      while (newLevel < 15 && newExp >= EXP_TABLE[newLevel + 1]) {
        newLevel++
        leveledUp = true
        if (newLevel === 5) { newMaturity = 2; evolved = true }
        if (newLevel === 10) { newMaturity = 3; evolved = true }
      }

      // Recompensas por subir nivel v5.0
      if (leveledUp) {
        const levelsGained = newLevel - oldLevel

        // +1 DC por nivel de dragón
        setUserProfile(p => ({
          ...p,
          dragoncoins: p.dragoncoins + (levelsGained * ECONOMY_CONFIG.dragonLevelUpReward),
        }))

        // +50 XP de perfil por nivel de dragón
        addProfileExp(levelsGained * ECONOMY_CONFIG.profileExpPerDragonLevel)

        console.log(`🐲 Dragón subió ${levelsGained} nivel(es)! +${levelsGained} DC`)
      }

      if (evolved) { setIsEvolving(true); setTimeout(() => setIsEvolving(false), 1500) }
      else if (leveledUp) { setIsLevelingUp(true); setTimeout(() => setIsLevelingUp(false), 1000) }

      return { ...prev, exp: newExp, level: newLevel, maturityState: newMaturity }
    })
  }

  const executeAction = (actionKey) => {
    console.log(`🎮 executeAction llamado: ${actionKey}`)

    const action = ACTIONS[actionKey]
    if (!action) {
      console.log(`❌ Acción no encontrada: ${actionKey}`)
      return
    }

    // Verificar mood blocking
    if (moodConfig.blockActions && actionKey !== 'feed' && actionKey !== 'rest') {
      console.log(`❌ Acción bloqueada por mood: ${mood}`)
      return
    }

    // Verificar cooldown
    if (cooldowns[actionKey] > 0) {
      console.log(`❌ En cooldown: ${cooldowns[actionKey]}ms`)
      return
    }

    // Verificar requisitos específicos
    if (actionKey === 'feed') {
      if (resources.food < 1) {
        console.log(`❌ Sin comida`)
        return
      }
      if (stats.hunger >= 100) {
        console.log(`❌ Ya está lleno`)
        return
      }
    } else if (actionKey === 'train') {
      if (stats.energy < 20) {
        console.log(`❌ Sin energía: ${stats.energy}`)
        return
      }
      if (stats.hunger < 10) {
        console.log(`❌ Hambriento: ${stats.hunger}`)
        return
      }
    } else if (actionKey === 'play') {
      if (stats.energy < 15) {
        console.log(`❌ Sin energía: ${stats.energy}`)
        return
      }
    } else if (actionKey === 'rest') {
      if (stats.hunger < 5) {
        console.log(`❌ Hambriento: ${stats.hunger}`)
        return
      }
      if (stats.energy >= 100) {
        console.log(`❌ Ya está descansado`)
        return
      }
    }

    console.log(`✅ Ejecutando acción: ${actionKey}`)

    // Animación
    setActionAnimations(prev => ({ ...prev, [actionKey]: true }))
    setTimeout(() => setActionAnimations(prev => ({ ...prev, [actionKey]: false })), 200)

    // Aplicar efectos a stats
    const effects = action.effects
    setStats(prev => {
      const newStats = { ...prev }
      if (effects.hunger !== undefined) newStats.hunger = Math.max(0, Math.min(100, newStats.hunger + effects.hunger))
      if (effects.energy !== undefined) newStats.energy = Math.max(0, Math.min(100, newStats.energy + effects.energy))
      if (effects.happiness !== undefined) newStats.happiness = Math.max(0, Math.min(100, newStats.happiness + effects.happiness))
      console.log(`📊 Stats actualizados:`, newStats)
      return newStats
    })

    // Aplicar costo de comida
    if (effects.foodCost !== undefined) {
      setResources(prev => ({
        ...prev,
        food: Math.max(0, prev.food - effects.foodCost)
      }))
    }

    // Actualizar cooldown
    setCooldowns(prev => ({
      ...prev,
      [actionKey]: action.cooldown
    }))

    // Dar EXP
    if (action.effects.exp) {
      console.log(`⭐ Ganando ${action.effects.exp} EXP`)
      addExperience(action.effects.exp)
    }
  }

  const currentLevelExp = EXP_TABLE[regenmon.level] || 0
  const nextLevelExp = EXP_TABLE[regenmon.level + 1] || EXP_TABLE[15]
  const expInCurrentLevel = regenmon.exp - currentLevelExp
  const expNeededForLevel = nextLevelExp - currentLevelExp
  const expProgress = (expInCurrentLevel / expNeededForLevel) * 100

  const getTimeUntilNextFood = () => { const elapsed = Date.now() - resources.lastFoodGenTime; const remaining = TIMERS.foodGeneration - (elapsed % TIMERS.foodGeneration); return formatTime(remaining) }

  const StatBar = ({ label, icon, value }) => {
    const colorClass = getStatColor(value)
    const colorMap = { high: 'from-green-500 to-emerald-400', medium: 'from-yellow-500 to-amber-400', low: 'from-red-500 to-rose-400' }
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] text-gray-400">{label}</span>
          <span className="text-[10px] text-gray-500 ml-auto">{Math.round(value)}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${colorMap[colorClass]} transition-all duration-500 rounded-full`} style={{ width: `${value}%` }} />
        </div>
      </div>
    )
  }

  // Funciones de verificación de estado para cada acción
  const getActionStatus = (actionKey) => {
    const action = ACTIONS[actionKey]

    // Verificar cooldown primero
    if (cooldowns[actionKey] > 0) {
      return { text: formatTime(cooldowns[actionKey]), disabled: true, state: 'cooldown' }
    }

    // Verificar límite diario (solo si no es sin límite)
    if (!action.noDailyLimit && dailyUses[actionKey] >= action.dailyLimit) {
      return { text: 'LÍMITE', disabled: true, state: 'limit' }
    }

    // Verificar si está bloqueado por mood (excepto feed y rest)
    if (moodConfig.blockActions && actionKey !== 'feed' && actionKey !== 'rest') {
      return { text: 'BLOQUEADO', disabled: true, state: 'blocked' }
    }

    // Verificaciones específicas por acción
    if (actionKey === 'feed') {
      if (resources.food < 1) return { text: 'SIN COMIDA', disabled: true, state: 'no-food' }
      if (stats.hunger >= 100) return { text: 'LLENO', disabled: true, state: 'full' }
      return { text: 'LISTO', disabled: false, state: 'ready' }
    }

    if (actionKey === 'train') {
      if (stats.energy < 20) return { text: 'SIN ENERGÍA', disabled: true, state: 'no-energy' }
      if (stats.hunger < 10) return { text: 'HAMBRIENTO', disabled: true, state: 'hungry' }
      return { text: 'LISTO', disabled: false, state: 'ready' }
    }

    if (actionKey === 'play') {
      if (stats.energy < 15) return { text: 'SIN ENERGÍA', disabled: true, state: 'no-energy' }
      return { text: 'LISTO', disabled: false, state: 'ready' }
    }

    if (actionKey === 'rest') {
      if (stats.hunger < 5) return { text: 'HAMBRIENTO', disabled: true, state: 'hungry' }
      if (stats.energy >= 100) return { text: 'LLENO', disabled: true, state: 'full' }
      return { text: 'LISTO', disabled: false, state: 'ready' }
    }

    return { text: 'LISTO', disabled: false, state: 'ready' }
  }

  const ActionButton = ({ actionKey }) => {
    const action = ACTIONS[actionKey]
    const status = getActionStatus(actionKey)
    const canExecute = !status.disabled
    const dailyLimit = action.noDailyLimit ? '∞' : `${dailyUses[actionKey]}/${action.dailyLimit}`

    // Handler con console.log para debug
    const handleClick = () => {
      console.log(`🔘 Botón ${actionKey} clickeado`)
      console.log(`   canExecute: ${canExecute}`)
      console.log(`   status:`, status)

      if (canExecute) {
        executeAction(actionKey)
      }
    }

    return (
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={!canExecute}
          className={`w-full rounded-lg flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${actionAnimations[actionKey] ? 'animate-action-pulse' : ''} ${status.state === 'ready' ? 'bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/50 action-ready cursor-pointer hover:scale-105' : 'bg-dark-secondary/50 border border-gray-700 cursor-not-allowed opacity-50'}`}
        >
          <span className="text-xl md:text-2xl">{action.icon}</span>
          <span className="text-[9px] md:text-[10px] font-medium text-white">{action.name}</span>
          <span className={`text-[8px] md:text-[10px] ${status.state === 'ready' ? 'text-green-400' : 'text-gray-500'}`}>{status.text}</span>
        </button>
        <span className="text-[9px] text-gray-500 mt-0.5">{dailyLimit}</span>
      </div>
    )
  }

  // Obtener etiqueta de madurez
  const getMaturityLabel = () => {
    if (regenmon.level >= 10) return '🐉 Adulto'
    if (regenmon.level >= 5) return '🦎 Adolescente'
    return '🐣 Bebé'
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: ELEMENT_BACKGROUNDS[folder] }}>
      <Particles colors={element?.particles || ELEMENT_PARTICLES['FUEGO']} />

      {/* HEADER DE USUARIO CON LOGOUT */}
      <UserHeader
        userData={userData}
        isGuest={isGuest}
        onLogout={onLogout}
      />

      {/* Banner de advertencia para invitados */}
      {isGuest && (
        <div className="guest-warning-banner">
          ⚠️ Modo Invitado - Tu progreso no se guardará al cerrar
        </div>
      )}

      {/* HEADER DE ECONOMÍA v5.1 - Barra de XP del Perfil */}
      <div className="px-4 py-2 relative z-10">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* Botón de regalo */}
          <GiftButton
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
          {/* Botón de códigos */}
          <button
            onClick={() => setShowRedeemCode(true)}
            className="text-xl hover:scale-110 transition-transform"
            title="Canjear código"
          >
            🎟️
          </button>
          {/* Barra de XP del perfil */}
          <div className="flex-1">
            <ProfileXPBar userProfile={userProfile} />
          </div>
        </div>
      </div>

      {/* Modal de canjear código */}
      <RedeemCodeModal
        isOpen={showRedeemCode}
        onClose={() => setShowRedeemCode(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {/* NAVEGACIÓN DE PESTAÑAS v5.0 */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        incubatorCount={incubator.eggs.filter(e => e.readyToCollect).length}
        habitatsCount={habitats.length}
      />

      {/* CONTENIDO SEGÚN PESTAÑA ACTIVA */}
      {activeTab === 'dragon' && (
        <>
          {/* HEADER: Nombre, Tipo y Estado (centrado, fuera del cuadro) */}
          <header className="text-center pt-2 pb-2 relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{regenmon.name}</h1>
            <p className="text-sm md:text-base text-gray-400 mt-1">{element?.emoji} Dragón de {element?.name?.toLowerCase().charAt(0).toUpperCase() + element?.name?.toLowerCase().slice(1)}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{getMaturityLabel()}</p>
          </header>

          {/* ÁREA PRINCIPAL: Recursos (izq) + Dragón (centro) + Chat (der) */}
          <div className="relative z-10 flex-1 px-4 pb-4">
            <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 flex-col md:flex-row items-start">

              {/* Panel de Recursos (IZQUIERDA) */}
              <div className="resources-left-panel w-full md:w-[140px] bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex md:flex-col items-center justify-around md:justify-start gap-2 shrink-0">
                <h3 className="hidden md:block text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-wider text-center">Recursos</h3>

                {/* Comida */}
                <div className="flex md:flex-col items-center gap-2 md:gap-1">
                  <span className="text-3xl md:text-4xl">🍖</span>
                  <div className="flex md:flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 hidden md:block">Comida</span>
                    <span className="text-xl md:text-2xl font-bold text-white">{resources.food}<span className="text-gray-500 text-sm">/{resources.maxFood}</span></span>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex md:flex-col items-center gap-1 md:border-t md:border-white/10 md:pt-2 md:mt-1 md:w-full">
                  <span className="text-[10px] text-gray-500">Próxima:</span>
                  <span className="text-sm md:text-base text-white/80 font-medium">{getTimeUntilNextFood()}</span>
                </div>
              </div>

              {/* Cuadro del Dragón (CENTRO) */}
              <div className="dragon-display-box bg-black/40 backdrop-blur-md border-2 rounded-2xl p-3 relative" style={{ boxShadow: `0 0 40px ${element?.glowColor}`, borderColor: `${element?.color}60` }}>
                {/* Header interno: XP | Reiniciar */}
                <div className="flex justify-between items-start mb-2">
                  {/* XP Box */}
                  <div className={`bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-2 min-w-[90px] ${isLevelingUp ? 'animate-level-up-box' : ''}`}>
                    <div className="flex items-center gap-1 mb-1"><span className="text-xs">⭐</span><span className="text-xs font-bold text-white">Nv {regenmon.level}</span></div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-1"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full" style={{ width: `${Math.min(expProgress, 100)}%` }} /></div>
                    <div className="text-[10px] text-white/60 text-center">{expInCurrentLevel}/{expNeededForLevel} XP</div>
                  </div>

                  {/* Botón reset */}
                  <button onClick={() => setShowResetConfirm(true)} className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1.5 flex flex-col items-center gap-0.5 text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all group">
                    <span className="text-base transition-transform duration-500 group-hover:rotate-180">🔄</span>
                    <span className="text-[8px]">Reiniciar</span>
                  </button>
                </div>

                {/* Imagen del dragón */}
                <div className="dragon-image-container">
                  <div className="relative">
                    <img src={getDragonImagePath(regenmon.class, regenmon.dragonId, maturityState)} alt={regenmon.name} className={`dragon-image drop-shadow-2xl animate-dragon-idle ${isLevelingUp ? 'animate-level-up' : ''} ${isEvolving ? 'animate-evolution' : ''}`} style={{ '--dragon-scale': calculateDragonScale(regenmon.level) / 100 }} draggable={false} />
                    {isEvolving && <div className="absolute inset-0 flex items-center justify-center"><div className="absolute inset-0 bg-white/20 animate-ping rounded-full" /></div>}
                  </div>
                </div>

                {/* Estado de ánimo */}
                <div className="flex items-center justify-center gap-2 pb-1">
                  <span className="text-lg">{moodConfig.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: moodConfig.color }}>{moodConfig.label}</span>
                </div>
              </div>

              {/* Panel de Chat (DERECHA) */}
              <ChatPanel
                regenmon={{
                  name: regenmon.name,
                  element: element?.name?.toLowerCase(),
                  maturityState: maturityState
                }}
                stats={stats}
                onStatsChange={setStats}
                storagePrefix={storagePrefix}
              />
            </div>
          </div>

          {/* Panel de Estadísticas */}
          <div className="relative z-10 px-4 pb-2">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <h3 className="text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-wider">Estadísticas</h3>
              <div className="grid grid-cols-3 gap-2">
                <StatBar label="Hambre" icon="🍖" value={stats.hunger} />
                <StatBar label="Energía" icon="⚡" value={stats.energy} />
                <StatBar label="Felicidad" icon="😊" value={stats.happiness} />
              </div>
            </div>
          </div>

          {/* Panel de Acciones */}
          <div className="relative z-10 px-4 pb-4">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <h3 className="text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-wider">Acciones</h3>
              <div className="grid grid-cols-4 gap-2">
                <ActionButton actionKey="feed" />
                <ActionButton actionKey="train" />
                <ActionButton actionKey="play" />
                <ActionButton actionKey="rest" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* PESTAÑA INCUBADORA */}
      {activeTab === 'incubator' && (
        <IncubatorTab
          incubator={incubator}
          setIncubator={setIncubator}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          habitats={habitats}
          setHabitats={setHabitats}
          allDragons={allDragons}
          setAllDragons={setAllDragons}
        />
      )}

      {/* PESTAÑA HABITATS */}
      {activeTab === 'habitats' && (
        <HabitatsTab
          habitats={habitats}
          setHabitats={setHabitats}
          allDragons={allDragons}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onSelectDragon={(dragon) => {
            console.log('🐲 Dragón seleccionado desde habitat:', dragon);

            // NUEVO: Guardar estado del dragón activo antes de cambiar
            if (regenmon?.id) {
              setAllDragons(prev => prev.map(d => {
                if (d.id === regenmon.id) {
                  return {
                    ...d,
                    name: regenmon.name,
                    element: regenmon.class,
                    dragonId: regenmon.dragonId,
                    level: regenmon.level,
                    exp: regenmon.exp,
                    maturityState: regenmon.maturityState,
                    stats: { ...stats },
                  };
                }
                return d;
              }));
            }

            // Cargar el nuevo dragón activo
            setRegenmon({
              name: dragon.name,
              class: dragon.element,
              dragonId: dragon.dragonId,
              level: dragon.level,
              exp: dragon.exp,
              maturityState: dragon.maturityState,
              id: dragon.id,
              habitatId: dragon.habitatId,
            });

            // NUEVO: Cargar las stats del dragón seleccionado (si las tiene guardadas)
            if (dragon.stats) {
              setStats({
                hunger: dragon.stats.hunger ?? 70,
                energy: dragon.stats.energy ?? 70,
                happiness: dragon.stats.happiness ?? 70,
              });
            } else {
              // Si no tiene stats guardadas, usar valores neutros
              setStats({ hunger: 70, energy: 70, happiness: 70 });
            }

            setActiveTab('dragon');
          }}
        />
      )}

      {/* PESTAÑA BREED */}
      {activeTab === 'breed' && (
        <BreedTab
          allDragons={allDragons}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          incubator={incubator}
          setIncubator={setIncubator}
          breedingCooldowns={breedingCooldowns}
          setBreedingCooldowns={setBreedingCooldowns}
          regenmonData={regenmon}
        />
      )}

      {/* Modal de reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-secondary border border-red-500/30 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-4">⚠️ ¿Estás seguro?</h3>
            <p className="text-gray-400 mb-6">Esto borrará TODO tu progreso.</p>
            <p className="text-red-400 text-sm mb-6 font-medium">Esta acción NO se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors">Cancelar</button>
              <button onClick={() => { setShowResetConfirm(false); onReset() }} className="flex-1 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition-colors">Reiniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// APP PRINCIPAL - CON SISTEMA DE GUARDADO v4.6
// ============================================

function App() {
  // Hook de autenticación
  const { user, isGuest, isLoading: authLoading, isAuthenticated, saveUserData, loadUserData, logout: authLogout, getUserStorageKey, hasSavedGame } = useAuth();

  const [currentView, setCurrentView] = useState('loading')
  const [regenmon, setRegenmon] = useState(null)
  const [stats, setStats] = useState({ hunger: 100, energy: 100, happiness: 100 })
  const [resources, setResources] = useState({ food: 10, maxFood: 50, lastFoodGenTime: Date.now(), lastHungerDecay: Date.now() })
  const [cooldowns, setCooldowns] = useState({ feed: 0, train: 0, play: 0, rest: 0 })
  const [dailyUses, setDailyUses] = useState({ feed: 0, train: 0, play: 0, lastReset: new Date().toDateString() })
  const [meta, setMeta] = useState({ lastSaved: 0, createdAt: 0 })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [userData, setUserData] = useState(null)

  // Hook de Supabase
  const { saveToSupabase, loadFromSupabase, deleteFromSupabase } = useSupabaseSave()

  // ============================================
  // ESTADOS DE ECONOMÍA - v5.0
  // ============================================
  const [userProfile, setUserProfile] = useState({
    level: 1,
    exp: 0,
    dragoncoins: 0,
    hasClaimedWelcomeGift: false,
    createdAt: Date.now(),
  });

  const [incubator, setIncubator] = useState({
    slots: 1,
    eggs: [],
  });

  const [habitats, setHabitats] = useState([
    {
      id: 'habitat_1',
      element: null,
      level: 1,
      maxDragons: 2,
      dragons: [],
    }
  ]);

  const [allDragons, setAllDragons] = useState([]);

  const [breedingCooldowns, setBreedingCooldowns] = useState({});

  const [showWelcomeGift, setShowWelcomeGift] = useState(false);

  // ============================================
  // FUNCIÓN: AÑADIR EXPERIENCIA DE PERFIL
  // ============================================
  const addProfileExp = useCallback((expAmount) => {
    setUserProfile(prev => {
      let newExp = prev.exp + expAmount;
      let newLevel = prev.level;
      let coinsEarned = 0;

      while (newLevel < 20 && newExp >= (PROFILE_EXP_TABLE[newLevel + 1] || Infinity)) {
        newLevel++;
        const reward = (newLevel - 1) * ECONOMY_CONFIG.profileLevelUpBaseReward;
        coinsEarned += reward;
        console.log(`🎉 ¡Perfil subió a nivel ${newLevel}! +${reward} DC`);
      }

      return {
        ...prev,
        exp: newExp,
        level: newLevel,
        dragoncoins: prev.dragoncoins + coinsEarned,
      };
    });
  }, []);

  // ============================================
  // FUNCIONES DE GUARDADO - BASADO EN USUARIO
  // ============================================

  // Helper para obtener userId consistente entre dispositivos (v5.5)
  const getUserId = useCallback((u) => {
    if (!u) return null
    // Prioridad: email > walletAddress > id (email es estable entre dispositivos)
    return u.email || u.walletAddress || u.id || null
  }, [])

  const saveGame = useCallback(async () => {
    if (!regenmon || !isAuthenticated || !user) return

    try {
      // Sincronizar el dragón activo en allDragons ANTES de guardar
      let syncedAllDragons = allDragons;
      if (regenmon?.id) {
        syncedAllDragons = allDragons.map(d => {
          if (d.id === regenmon.id) {
            return {
              ...d,
              name: regenmon.name,
              element: regenmon.class,
              dragonId: regenmon.dragonId,
              level: regenmon.level,
              exp: regenmon.exp,
              maturityState: regenmon.maturityState,
              stats: { ...stats },
            };
          }
          return d;
        });
      }

      const saveData = {
        regenmon,
        stats,
        resources,
        cooldowns,
        dailyUses,
        meta: {
          lastSaved: Date.now(),
          createdAt: meta.createdAt || Date.now(),
        },
        gameState: {
          currentView,
          hasRegenmon: true,
        },
        userProfile,
        incubator,
        habitats,
        allDragons: syncedAllDragons,
        breedingCooldowns,
      }

      const userId = getUserId(user)
      console.log('🔑 userId para guardar:', userId)
      await saveToSupabase(userId, saveData)
      console.log('☁️💾 Partida guardada en Supabase')

    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }, [regenmon, stats, resources, cooldowns, dailyUses, meta, currentView, isAuthenticated, user, saveToSupabase, userProfile, incubator, habitats, allDragons, breedingCooldowns, getUserId])

  const loadGame = useCallback(async () => {
    if (!isAuthenticated || !user) return null

    try {
      const userId = getUserId(user)
      console.log('🔑 userId para cargar:', userId)
      const savedData = await loadFromSupabase(userId)

      if (!savedData) {
        console.log('🆕 No hay partida guardada, iniciando nuevo juego')
        return null
      }

      console.log('📂 Partida cargada desde Supabase')
      return savedData
    } catch (error) {
      console.error('Error al cargar:', error)
      return null
    }
  }, [isAuthenticated, user, loadFromSupabase])

  const deleteSave = useCallback(async () => {
    if (!isAuthenticated || !user) return
    const userId = getUserId(user)
    await deleteFromSupabase(userId)
    console.log('🗑️ Partida borrada de Supabase')
  }, [isAuthenticated, user, deleteFromSupabase])

  // ============================================
  // APLICAR DEGRADACIÓN PASIVA
  // ============================================

  const applyPassiveDecay = (lastSavedTimestamp) => {
    const now = Date.now()
    const timePassed = now - lastSavedTimestamp // en milisegundos

    if (timePassed <= 0) return

    const intervalsHunger = Math.floor(timePassed / TIMERS.hungerDecay)
    const intervalsHappiness = Math.floor(timePassed / TIMERS.happinessDecay)
    const foodGenerated = Math.floor(timePassed / TIMERS.foodGeneration)

    console.log(`⏰ Tiempo pasado: ${Math.floor(timePassed / 1000)}s`)

    // Aplicar degradación de hambre
    if (intervalsHunger > 0) {
      setStats(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - intervalsHunger),
      }))
      console.log(`🍖 Hambre reducida en ${intervalsHunger}`)
    }

    // Aplicar degradación de felicidad
    if (intervalsHappiness > 0) {
      setStats(prev => ({
        ...prev,
        happiness: Math.max(0, prev.happiness - intervalsHappiness),
      }))
      console.log(`😊 Felicidad reducida en ${intervalsHappiness}`)
    }

    // Generar comida pasiva
    if (foodGenerated > 0) {
      setResources(prev => ({
        ...prev,
        food: Math.min(prev.maxFood, prev.food + foodGenerated),
        lastFoodGenTime: now,
      }))
      console.log(`🍖 Comida generada: +${foodGenerated}`)
    }

    // Actualizar timestamp de última generación
    setResources(prev => ({
      ...prev,
      lastHungerDecay: now,
    }))
  }

  // ============================================
  // VERIFICAR SESIÓN AL CARGAR - v4.9
  // ============================================

  useEffect(() => {
    // Esperar a que termine la carga de autenticación
    if (authLoading) return

    const checkSession = async () => {
      console.log('🔍 Verificando sesión...')
      console.log('   isAuthenticated:', isAuthenticated)
      console.log('   user:', user)
      console.log('   isGuest:', isGuest)

      if (isAuthenticated && user) {
        // Guardar datos del usuario
        setUserData({
          walletAddress: user.walletAddress || user.id,
          email: user.email,
          isGuest: isGuest,
        })

        // Cargar partida desde Supabase
        const userId = getUserId(user)
        console.log('🔍 Buscando partida en Supabase para:', userId)

        const savedData = await loadFromSupabase(userId)

        if (savedData?.gameState?.hasRegenmon) {
          console.log('✅ Restaurando partida desde Supabase')

          setRegenmon(savedData.regenmon)

          // Cargar stats del dragón activo si tiene sus propias stats en allDragons
          if (savedData.allDragons && savedData.regenmon?.id) {
            const activeDragonData = savedData.allDragons.find(d => d.id === savedData.regenmon.id)
            if (activeDragonData?.stats) {
              setStats(activeDragonData.stats)
            } else {
              setStats(savedData.stats)
            }
          } else {
            setStats(savedData.stats)
          }

          setResources(savedData.resources)
          setCooldowns(savedData.cooldowns || { feed: 0, train: 0, play: 0, rest: 0 })
          setDailyUses(savedData.dailyUses)
          setMeta(savedData.meta)

          if (savedData.userProfile) setUserProfile(savedData.userProfile)
          if (savedData.incubator) setIncubator(savedData.incubator)
          if (savedData.habitats) setHabitats(savedData.habitats)
          if (savedData.allDragons) setAllDragons(savedData.allDragons)
          if (savedData.breedingCooldowns) setBreedingCooldowns(savedData.breedingCooldowns)

          // El regalo de bienvenida se muestra después de eclosionar el primer huevo (v5.4)

          const today = new Date().toDateString()
          if (savedData.dailyUses?.lastReset !== today) {
            setDailyUses({ feed: 0, train: 0, play: 0, lastReset: today })
          }

          if (savedData.meta?.lastSaved) {
            applyPassiveDecay(savedData.meta.lastSaved)
          }

          setCurrentView('game')
          console.log('✅ Partida restaurada desde Supabase')
          return
        }

        // Usuario autenticado pero sin partida
        console.log('📝 Usuario sin partida, yendo a registro')
        setCurrentView('register')

      } else {
        // No hay sesión, mostrar landing
        console.log('❌ Sin sesión, mostrando landing')
        setCurrentView('landing')
      }
    }

    checkSession()
  }, [authLoading, isAuthenticated, user, isGuest])

  // ============================================
  // GUARDAR AUTOMÁTICAMENTE
  // ============================================

  // Guardar cuando cambian los datos importantes
  useEffect(() => {
    if (regenmon && currentView === 'game' && isAuthenticated) {
      saveGame()
    }
  }, [regenmon, stats, resources, dailyUses, currentView, isAuthenticated, saveGame])

  // Guardar cada 30 segundos como backup
  useEffect(() => {
    if (currentView !== 'game' || !regenmon || !isAuthenticated) return

    const autoSaveInterval = setInterval(() => {
      saveGame()
    }, 30000) // 30 segundos

    return () => clearInterval(autoSaveInterval)
  }, [currentView, regenmon, isAuthenticated, saveGame])

  // Guardar al cerrar/recargar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (regenmon && isAuthenticated) {
        saveGame()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [regenmon, stats, resources, isAuthenticated, saveGame])

  // ============================================
  // CREAR NUEVO REGENMON - Con guardado inmediato
  // ============================================

  const handleCreateRegenmon = (name, elementId) => {
    const newRegenmon = { name, class: elementId, dragonId: null, level: 1, exp: 0, maturityState: 1 }
    const newStats = { hunger: 100, energy: 100, happiness: 100 }
    const newResources = { food: 10, maxFood: 50, lastFoodGenTime: Date.now(), lastHungerDecay: Date.now() }
    const newCooldowns = { feed: 0, train: 0, play: 0, rest: 0 }
    const newDailyUses = { feed: 0, train: 0, play: 0, lastReset: new Date().toDateString() }
    const newMeta = { lastSaved: Date.now(), createdAt: Date.now() }

    // Actualizar estados
    setRegenmon(newRegenmon)
    setStats(newStats)
    setResources(newResources)
    setCooldowns(newCooldowns)
    setDailyUses(newDailyUses)
    setMeta(newMeta)

    // El regalo de bienvenida se muestra después de eclosionar el primer huevo (v5.4)

    // GUARDAR INMEDIATAMENTE en Supabase
    const saveData = {
      regenmon: newRegenmon,
      stats: newStats,
      resources: newResources,
      cooldowns: newCooldowns,
      dailyUses: newDailyUses,
      meta: newMeta,
      gameState: {
        currentView: 'hatching',
        hasRegenmon: true,
      },
      // Incluir datos de economía iniciales
      userProfile: {
        level: 1,
        exp: 0,
        dragoncoins: 0,
        hasClaimedWelcomeGift: false,
        createdAt: Date.now(),
      },
      incubator: { slots: 1, eggs: [] },
      habitats: [{ id: 'habitat_1', element: elementId, level: 1, maxDragons: 2, dragons: [] }],
      allDragons: [],
      breedingCooldowns: {},
    }

    const userId = getUserId(user)
    if (userId) {
      saveToSupabase(userId, saveData)
    }
    console.log('☁️💾 Registro guardado inmediatamente en Supabase:', saveData)

    setCurrentView('hatching')
  }

  // ============================================
  // REINICIAR JUEGO
  // ============================================

  const handleReset = () => {
    // Borrar localStorage
    deleteSave()

    // Resetear estados
    setRegenmon(null)
    setStats({ hunger: 100, energy: 100, happiness: 100 })
    setResources({ food: 10, maxFood: 50, lastFoodGenTime: Date.now(), lastHungerDecay: Date.now() })
    setCooldowns({ feed: 0, train: 0, play: 0, rest: 0 })
    setDailyUses({ feed: 0, train: 0, play: 0, lastReset: new Date().toDateString() })
    setMeta({ lastSaved: 0, createdAt: 0 })
    setCurrentView('landing')

    // Resetear estados de economía v5.0
    setUserProfile({
      level: 1,
      exp: 0,
      dragoncoins: 0,
      hasClaimedWelcomeGift: false,
      createdAt: Date.now(),
    })
    setIncubator({ slots: 1, eggs: [] })
    setHabitats([{
      id: 'habitat_1',
      element: null,
      level: 1,
      maxDragons: 2,
      dragons: [],
    }])
    setAllDragons([])
    setBreedingCooldowns({})
    setShowWelcomeGift(false)

    console.log('🗑️ Juego reiniciado')
  }

  // ============================================
  // LOGOUT COMPLETO - v5.6b
  // ============================================

  // Helper para limpiar TODAS las keys de autenticación de localStorage
  const clearAllAuthStorage = () => {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key.includes('thirdweb') ||
        key.includes('walletConnect') ||
        key.includes('wc@') ||
        key.includes('WALLETCONNECT') ||
        key.includes('regenmon_auth') ||
        key.includes('regenmon_session') ||
        key.includes('-active-wallet') ||
        key.includes('tw-') ||
        key.includes('wagmi') ||
        key.includes('coinbaseWallet')
      ) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => {
      console.log('🗑️ Eliminando key de auth:', key)
      localStorage.removeItem(key)
    })
    console.log(`🧹 ${keysToRemove.length} keys de auth eliminadas`)
  }

  const handleLogout = async () => {
    console.log('🚪 handleLogout iniciado')

    try {
      // 1. Guardar partida antes de salir
      if (regenmon && isAuthenticated && user) {
        await saveGame()
        console.log('💾 Partida guardada antes del logout')
      }

      // 2. Llamar al logout del hook de autenticación
      try {
        await authLogout()
      } catch (e) {
        console.warn('Error en authLogout (ignorado):', e)
      }

      // 3. Limpiar TODAS las keys de auth de localStorage
      clearAllAuthStorage()

      console.log('✅ Logout completado, recargando página...')

      // 4. Forzar recarga limpia para garantizar estado limpio
      window.location.reload()

    } catch (error) {
      console.error('Error en handleLogout:', error)
      // Forzar limpieza aunque haya error
      clearAllAuthStorage()
      window.location.reload()
    }
  }

  // ============================================
  // PANTALLA DE CARGA
  // ============================================

  if (currentView === 'loading' || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f]">
        <div style={{ fontSize: '4rem' }} className="mb-4 animate-bounce">🐉</div>
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#8b5cf6] rounded-full animate-spin mb-4"></div>
        <p className="text-[#a78bfa] text-lg">Cargando tu aventura...</p>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="font-sans">
      {currentView === 'landing' && (
        <LandingPage
          onShowLogin={() => setShowLoginModal(true)}
        />
      )}

      {currentView === 'register' && (
        <RegisterPage
          onBack={() => setCurrentView('landing')}
          onCreate={handleCreateRegenmon}
        />
      )}

      {currentView === 'hatching' && regenmon && (
        <HatchingPage
          regenmonData={regenmon}
          onHatchComplete={(dragonId) => {
            setRegenmon(prev => ({ ...prev, dragonId }))

            // Agregar dragón inicial a allDragons (v5.0)
            const initialDragon = {
              id: `dragon_main_${Date.now()}`,
              name: regenmon.name,
              element: regenmon.class,
              level: 1,
              exp: 0,
              maturityState: 1,
              dragonId: dragonId,
              habitatId: 'habitat_1',
              isMain: true,
            }
            setAllDragons([initialDragon])

            // Asignar elemento al habitat inicial
            setHabitats(prev => prev.map(h =>
              h.id === 'habitat_1' ? { ...h, element: regenmon.class, dragons: [initialDragon.id] } : h
            ))

            // Mostrar regalo de bienvenida después del primer huevo (v5.4)
            if (!userProfile.hasClaimedWelcomeGift) {
              setShowWelcomeGift(true)
            }

            setCurrentView('dragon-reveal')
          }}
        />
      )}

      {currentView === 'dragon-reveal' && regenmon && (
        <DragonRevealPage
          regenmonData={regenmon}
          onStartGame={() => setCurrentView('game')}
        />
      )}

      {currentView === 'game' && regenmon && (
        <GamePage
          regenmonData={regenmon}
          setRegenmon={setRegenmon}
          stats={stats}
          setStats={setStats}
          resources={resources}
          setResources={setResources}
          cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          dailyUses={dailyUses}
          setDailyUses={setDailyUses}
          onReset={handleReset}
          onLogout={handleLogout}
          userData={userData}
          isGuest={isGuest}
          storagePrefix={user?.id ? `regenmon_user_${user.id}` : ''}
          // Props de economía v5.0
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          incubator={incubator}
          setIncubator={setIncubator}
          habitats={habitats}
          setHabitats={setHabitats}
          allDragons={allDragons}
          setAllDragons={setAllDragons}
          breedingCooldowns={breedingCooldowns}
          setBreedingCooldowns={setBreedingCooldowns}
          addProfileExp={addProfileExp}
        />
      )}

      {/* Modal de Regalo de Bienvenida v5.0 */}
      <WelcomeGiftModal
        isOpen={showWelcomeGift}
        onClaim={() => {
          setUserProfile(prev => ({
            ...prev,
            dragoncoins: prev.dragoncoins + ECONOMY_CONFIG.welcomeGift,
            hasClaimedWelcomeGift: true,
          }));
          setShowWelcomeGift(false);
          console.log('🎁 Regalo de bienvenida reclamado: +100 DC');
        }}
      />

      {/* Modal de Login - Visible en cualquier vista */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(method, walletAddress) => {
          console.log('🎉 Login exitoso:', method, walletAddress);
          setShowLoginModal(false);

          if (method === 'guest') {
            // Invitado: guardar sesión y ir a registro
            const guestData = {
              isGuest: true,
              sessionId: `guest_${Date.now()}`,
              createdAt: Date.now(),
            };
            localStorage.setItem('regenmon_auth', JSON.stringify(guestData));

            setUserData({ isGuest: true });
            setCurrentView('register');

          } else {
            // Usuario autenticado: guardar sesión
            const authData = {
              walletAddress: walletAddress,
              isGuest: false,
              lastLogin: Date.now(),
            };
            localStorage.setItem('regenmon_auth', JSON.stringify(authData));

            setUserData({
              walletAddress: walletAddress,
              isGuest: false,
            });

            // IMPORTANTE: Verificar si tiene partida guardada con su wallet address
            const userSaveKey = `regenmon_user_${walletAddress}_${SAVE_KEY}`;
            const savedGame = localStorage.getItem(userSaveKey);

            console.log('🔍 Buscando partida en:', userSaveKey);
            console.log('   Encontrado:', !!savedGame);

            if (savedGame) {
              try {
                const data = JSON.parse(savedGame);

                if (data.gameState?.hasRegenmon) {
                  console.log('✅ Restaurando partida guardada');

                  // Restaurar todos los datos
                  setRegenmon(data.regenmon);
                  setStats(data.stats);
                  setResources(data.resources);
                  setCooldowns(data.cooldowns || { feed: 0, train: 0, play: 0, rest: 0 });
                  setDailyUses(data.dailyUses);
                  setMeta(data.meta);

                  // Ir directo al juego
                  setCurrentView('game');
                  return;
                }
              } catch (e) {
                console.error('Error al parsear partida:', e);
              }
            }

            // No tiene partida, ir a registro
            console.log('📝 Usuario nuevo, ir a registro');
            setCurrentView('register');
          }
        }}
      />
    </div>
  )
}

export default App
