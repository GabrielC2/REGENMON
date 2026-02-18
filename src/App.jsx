import { useState, useEffect, useRef } from 'react'

// ============================================
// CONFIGURACIÓN - VERSIÓN 4.2
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
// EFECTOS DE ACCIONES (v3.6)
// ============================================
const ACTION_EFFECTS = {
  feed: { hunger: 20, energy: 10, happiness: 5, exp: 2, foodCost: 1 },
  train: { hunger: -10, energy: -20, exp: 25 },
  play: { energy: -15, happiness: 20, exp: 12 },
  rest: { hunger: -5, energy: 20, exp: 5 },
};

const ELEMENT_BONUSES = {
  fuego: { trainingExpBonus: 0.15 },
  tierra: { hungerDecayReduction: 0.15 },
  agua: { playHappinessBonus: 15 },
  aire: { energyRegenBonus: 0.15 },
}

const EXP_TABLE = { 1: 0, 2: 50, 3: 125, 4: 225, 5: 375, 6: 575, 7: 825, 8: 1125, 9: 1525, 10: 2025, 11: 2625, 12: 3325, 13: 4125, 14: 5025, 15: 6025 }

const ACTIONS = {
  feed: { key: 'feed', name: 'Alimentar', icon: '🍖', cooldown: TIMERS.feedCooldown, dailyLimit: 10, effects: ACTION_EFFECTS.feed, requirements: { food: 1 }, noDailyLimit: false },
  train: { key: 'train', name: 'Entrenar', icon: '💪', cooldown: TIMERS.trainCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.train, requirements: { energy: 25, hunger: 10 }, noDailyLimit: true },
  play: { key: 'play', name: 'Jugar', icon: '🎾', cooldown: TIMERS.playCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.play, requirements: { energy: 15 }, noDailyLimit: true },
  rest: { key: 'rest', name: 'Descansar', icon: '😴', cooldown: TIMERS.restCooldown, dailyLimit: Infinity, effects: ACTION_EFFECTS.rest, requirements: { happiness: 10 }, noDailyLimit: true },
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
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 10, duration: 10 + Math.random() * 20, color: colors[Math.floor(Math.random() * colors.length)]
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{ left: `${p.left}%`, bottom: '-10px', backgroundColor: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
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
// PANEL DE CHAT (v4.1)
// ============================================

function ChatPanel({ regenmon, stats, onStatsChange }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memories, setMemories] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar mensajes y memorias de localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    const savedMemories = localStorage.getItem(MEMORIES_KEY);

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
  }, []);

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const messagesToSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Guardar memorias en localStorage
  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
    }
  }, [memories]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">💬 Chat</span>
        {memories.length > 0 && (
          <span className="memories-indicator">🧠 {memories.length}</span>
        )}
      </div>

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
// VISTA 1: LANDING PAGE (v3.8)
// ============================================

function LandingPage({ onPlayClick }) {
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
          <button onClick={onPlayClick} className="bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 rounded-full transition-all duration-300 hover:scale-110 animate-pulse-glow shadow-lg shadow-accent/30">🎮 JUGAR</button>
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
// VISTA 2: REGISTRO
// ============================================

function RegisterPage({ onBack, onCreate }) {
  const [name, setName] = useState('')
  const nameLength = name.length
  const isNameValid = nameLength >= 3 && nameLength <= 15 && /^[a-zA-Z0-9]+$/.test(name)
  const nameError = name.length > 0 && ((nameLength < 3 && 'Mínimo 3 caracteres') || (nameLength > 15 && 'Máximo 15 caracteres') || (!/^[a-zA-Z0-9]+$/.test(name) && 'Solo letras y números'))

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <Particles colors={['#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']} />
      <div className="max-w-xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Volver</button>
        <div className="text-center mb-10"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Registra tu Regenmon</h1><p className="text-gray-400">Dale vida a tu nueva criatura elemental</p></div>
        <div className="mb-10">
          <label className="block text-white font-medium mb-2">Nombre de tu Regenmon</label>
          <div className="relative">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Sparky, Rocky, Aqua..." maxLength={15} className={`w-full bg-dark-secondary/80 backdrop-blur-sm border-2 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${nameError ? 'border-red-500' : isNameValid ? 'border-green-500' : 'border-gray-700 focus:border-accent'}`} />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${nameLength > 15 ? 'text-red-500' : 'text-gray-500'}`}>{nameLength}/15</span>
          </div>
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          {isNameValid && <p className="text-green-500 text-sm mt-1">✓ Nombre válido</p>}
        </div>
        <div className="mb-6"><label className="block text-white font-medium mb-4 text-center">Elige tu elemento</label><ElementCarousel onSelect={(id) => isNameValid && onCreate(name, id)} /></div>
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
  onReset
}) {
  const element = ELEMENTS.find(e => e.id === regenmonData.class)
  const folder = ELEMENT_TO_FOLDER[regenmonData.class]
  const elementBonus = ELEMENT_BONUSES[regenmonData.class] || {}

  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [isEvolving, setIsEvolving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [actionAnimations, setActionAnimations] = useState({})

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

      while (newLevel < 15 && newExp >= EXP_TABLE[newLevel + 1]) {
        newLevel++
        leveledUp = true
        if (newLevel === 5) { newMaturity = 2; evolved = true }
        if (newLevel === 10) { newMaturity = 3; evolved = true }
      }

      if (evolved) { setIsEvolving(true); setTimeout(() => setIsEvolving(false), 1500) }
      else if (leveledUp) { setIsLevelingUp(true); setTimeout(() => setIsLevelingUp(false), 1000) }

      return { ...prev, exp: newExp, level: newLevel, maturityState: newMaturity }
    })
  }

  const executeAction = (actionKey) => {
    const action = ACTIONS[actionKey]
    if (!action || (moodConfig.blockActions && actionKey !== 'feed' && actionKey !== 'rest') || cooldowns[actionKey] > 0) return
    if (!action.noDailyLimit && dailyUses[actionKey] >= action.dailyLimit) return

    // Verificar requisitos específicos
    if (actionKey === 'feed') {
      if (resources.food < 1 || stats.hunger >= 100) return
    } else if (actionKey === 'train') {
      if (stats.energy < 20 || stats.hunger < 10) return
    } else if (actionKey === 'play') {
      if (stats.energy < 15) return
    } else if (actionKey === 'rest') {
      if (stats.hunger < 5 || stats.energy >= 100) return
    }

    setActionAnimations(prev => ({ ...prev, [actionKey]: true }))
    setTimeout(() => setActionAnimations(prev => ({ ...prev, [actionKey]: false })), 200)

    // Aplicar efectos a stats
    const effects = action.effects
    setStats(prev => {
      const newStats = { ...prev }
      if (effects.hunger !== undefined) newStats.hunger = Math.max(0, Math.min(100, newStats.hunger + effects.hunger))
      if (effects.energy !== undefined) newStats.energy = Math.max(0, Math.min(100, newStats.energy + effects.energy))
      if (effects.happiness !== undefined) newStats.happiness = Math.max(0, Math.min(100, newStats.happiness + effects.happiness))
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

    // Actualizar usos diarios
    if (!action.noDailyLimit) {
      setDailyUses(prev => ({
        ...prev,
        [actionKey]: prev[actionKey] + 1
      }))
    }

    // Dar EXP
    if (action.effects.exp) addExperience(action.effects.exp)
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

    return (
      <div className="flex flex-col items-center">
        <button onClick={() => canExecute && executeAction(actionKey)} disabled={!canExecute} className={`w-full rounded-lg flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${actionAnimations[actionKey] ? 'animate-action-pulse' : ''} ${status.state === 'ready' ? 'bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/50 action-ready cursor-pointer hover:scale-105' : 'bg-dark-secondary/50 border border-gray-700 cursor-not-allowed opacity-50'}`}>
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

      {/* HEADER: Nombre, Tipo y Estado (centrado, fuera del cuadro) */}
      <header className="text-center pt-4 pb-2 relative z-10">
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
// APP PRINCIPAL - CON SISTEMA DE GUARDADO v4.0
// ============================================

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [regenmon, setRegenmon] = useState(null)
  const [stats, setStats] = useState({ hunger: 100, energy: 100, happiness: 100 })
  const [resources, setResources] = useState({ food: 10, maxFood: 50, lastFoodGenTime: Date.now(), lastHungerDecay: Date.now() })
  const [cooldowns, setCooldowns] = useState({ feed: 0, train: 0, play: 0, rest: 0 })
  const [dailyUses, setDailyUses] = useState({ feed: 0, train: 0, play: 0, lastReset: new Date().toDateString() })
  const [meta, setMeta] = useState({ lastSaved: 0, createdAt: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // ============================================
  // FUNCIONES DE GUARDADO
  // ============================================

  const saveGame = () => {
    if (!regenmon) return

    try {
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
      }

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
      console.log('💾 Partida guardada:', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  const loadGame = () => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY)

      if (!savedData) {
        console.log('🆕 No hay partida guardada, iniciando nuevo juego')
        return null
      }

      const data = JSON.parse(savedData)
      console.log('📂 Partida cargada:', data)
      return data
    } catch (error) {
      console.error('Error al cargar:', error)
      return null
    }
  }

  const deleteSave = () => {
    localStorage.removeItem(SAVE_KEY)
    console.log('🗑️ Partida borrada')
  }

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
  // CARGAR PARTIDA AL INICIAR
  // ============================================

  useEffect(() => {
    const savedData = loadGame()

    if (savedData && savedData.gameState?.hasRegenmon) {
      // Restaurar estado desde localStorage
      setRegenmon(savedData.regenmon)
      setStats(savedData.stats)
      setResources(savedData.resources)
      setCooldowns(savedData.cooldowns || { feed: 0, train: 0, play: 0, rest: 0 })
      setDailyUses(savedData.dailyUses)
      setMeta(savedData.meta)

      // Verificar si cambió el día para resetear dailyUses
      const today = new Date().toDateString()
      if (savedData.dailyUses.lastReset !== today) {
        setDailyUses({ feed: 0, train: 0, play: 0, lastReset: today })
      }

      // Calcular degradación pasiva desde último guardado
      if (savedData.meta?.lastSaved) {
        applyPassiveDecay(savedData.meta.lastSaved)
      }

      // Ir directo al juego
      setCurrentView('game')
      console.log('✅ Partida restaurada')
    } else {
      // No hay partida, mostrar landing
      setCurrentView('landing')
    }

    setIsLoading(false)
  }, [])

  // ============================================
  // GUARDAR AUTOMÁTICAMENTE
  // ============================================

  // Guardar cuando cambian los datos importantes
  useEffect(() => {
    if (regenmon && currentView === 'game') {
      saveGame()
    }
  }, [regenmon, stats, resources, dailyUses])

  // Guardar cada 30 segundos como backup
  useEffect(() => {
    if (currentView !== 'game' || !regenmon) return

    const autoSaveInterval = setInterval(() => {
      saveGame()
    }, 30000) // 30 segundos

    return () => clearInterval(autoSaveInterval)
  }, [currentView, regenmon, stats, resources])

  // Guardar al cerrar/recargar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (regenmon) {
        saveGame()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [regenmon, stats, resources])

  // ============================================
  // CREAR NUEVO REGENMON
  // ============================================

  const handleCreateRegenmon = (name, elementId) => {
    setRegenmon({ name, class: elementId, dragonId: null, level: 1, exp: 0, maturityState: 1 })
    setStats({ hunger: 100, energy: 100, happiness: 100 })
    setResources({ food: 10, maxFood: 50, lastFoodGenTime: Date.now(), lastHungerDecay: Date.now() })
    setCooldowns({ feed: 0, train: 0, play: 0, rest: 0 })
    setDailyUses({ feed: 0, train: 0, play: 0, lastReset: new Date().toDateString() })
    setMeta({ lastSaved: Date.now(), createdAt: Date.now() })
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

    console.log('🗑️ Juego reiniciado')
  }

  // ============================================
  // PANTALLA DE CARGA
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f]">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#8b5cf6] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="font-sans">
      {currentView === 'landing' && (
        <LandingPage onPlayClick={() => setCurrentView('register')} />
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
        />
      )}
    </div>
  )
}

export default App
