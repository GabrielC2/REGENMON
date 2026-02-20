import { useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseSave() {

    const saveToSupabase = useCallback(async (userId, saveData) => {
        if (!userId || !saveData) return { success: false, error: 'userId o saveData inválido' }

        // Si Supabase no está disponible, guardar en localStorage directamente
        if (!supabase) {
            try {
                localStorage.setItem(`regenmon_user_${userId}_regenmon_save_v4`, JSON.stringify(saveData))
                console.log('💾 Guardado en localStorage (Supabase no disponible)')
                return { success: true, fallback: true }
            } catch (err) {
                console.error('❌ Error guardando en localStorage:', err)
                return { success: false, error: err }
            }
        }

        try {
            const { error } = await supabase
                .from('game_saves')
                .upsert(
                    {
                        user_id: userId,
                        save_data: saveData,
                    },
                    { onConflict: 'user_id' }
                )

            if (error) {
                console.error('❌ Error guardando en Supabase:', error)
                // Fallback a localStorage
                try {
                    localStorage.setItem(`regenmon_user_${userId}_regenmon_save_v4`, JSON.stringify(saveData))
                    console.warn('⚠️ Guardado en localStorage como backup')
                } catch (localErr) {
                    console.error('❌ Error en fallback localStorage:', localErr)
                }
                return { success: false, error }
            }

            console.log('☁️ Partida guardada en Supabase')
            return { success: true }

        } catch (err) {
            console.error('❌ Excepción al guardar en Supabase:', err)
            // Fallback a localStorage
            try {
                localStorage.setItem(`regenmon_user_${userId}_regenmon_save_v4`, JSON.stringify(saveData))
                console.warn('⚠️ Guardado en localStorage como backup tras excepción')
            } catch (localErr) { }
            return { success: false, error: err }
        }
    }, [])

    const loadFromSupabase = useCallback(async (userId) => {
        if (!userId) return null

        // Si Supabase no está disponible, cargar desde localStorage directamente
        if (!supabase) {
            console.warn('⚠️ Supabase no disponible, cargando desde localStorage')
            try {
                const localSave = localStorage.getItem(`regenmon_user_${userId}_regenmon_save_v4`)
                if (localSave) {
                    console.log('📦 Partida cargada desde localStorage (fallback)')
                    return JSON.parse(localSave)
                }
                return null
            } catch (err) {
                console.error('❌ Error cargando desde localStorage:', err)
                return null
            }
        }

        try {
            const { data, error } = await supabase
                .from('game_saves')
                .select('save_data, updated_at')
                .eq('user_id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('📭 No hay partida en Supabase para este usuario')

                    // Intentar migrar desde localStorage si existe
                    const localSave = localStorage.getItem(`regenmon_user_${userId}_regenmon_save_v4`)
                    if (localSave) {
                        console.log('🔄 Encontrada partida en localStorage, migrando a Supabase...')
                        const parsed = JSON.parse(localSave)
                        await saveToSupabase(userId, parsed)
                        return parsed
                    }

                    return null
                }
                console.error('❌ Error cargando desde Supabase:', error)

                // Intentar fallback a localStorage
                try {
                    const localSave = localStorage.getItem(`regenmon_user_${userId}_regenmon_save_v4`)
                    if (localSave) return JSON.parse(localSave)
                } catch { }

                return null
            }

            console.log('☁️ Partida cargada desde Supabase, última actualización:', data.updated_at)
            return data.save_data

        } catch (err) {
            console.error('❌ Excepción al cargar desde Supabase:', err)

            // Fallback a localStorage
            try {
                const localSave = localStorage.getItem(`regenmon_user_${userId}_regenmon_save_v4`)
                if (localSave) {
                    console.warn('⚠️ Usando localStorage como fallback tras excepción')
                    return JSON.parse(localSave)
                }
            } catch { }

            return null
        }
    }, [saveToSupabase])

    const deleteFromSupabase = useCallback(async (userId) => {
        if (!userId) return

        if (!supabase) {
            localStorage.removeItem(`regenmon_user_${userId}_regenmon_save_v4`)
            return
        }

        try {
            const { error } = await supabase
                .from('game_saves')
                .delete()
                .eq('user_id', userId)

            if (error) {
                console.error('❌ Error borrando de Supabase:', error)
                return
            }
            console.log('🗑️ Partida borrada de Supabase')
        } catch (err) {
            console.error('❌ Excepción al borrar de Supabase:', err)
        }
    }, [])

    return { saveToSupabase, loadFromSupabase, deleteFromSupabase }
}
