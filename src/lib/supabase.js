import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente nulo de seguridad si faltan las variables de entorno
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase inicializado correctamente')
  } catch (err) {
    console.error('❌ Error inicializando Supabase:', err)
    supabase = null
  }
} else {
  console.warn('⚠️ Variables de entorno de Supabase no encontradas. Usando localStorage como fallback.')
}

export { supabase }
