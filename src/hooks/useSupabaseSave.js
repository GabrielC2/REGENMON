import { useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseSave() {

    /**
     * Guarda la partida del usuario en Supabase
     * @param {string} userId - wallet address o identificador único del usuario
     * @param {object} saveData - objeto completo con todos los datos del juego
     */
    const saveToSupabase = useCallback(async (userId, saveData) => {
        if (!userId || !saveData) return { success: false, error: 'userId o saveData inválido' }

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
                // Fallback a localStorage si Supabase falla
                try {
                    localStorage.setItem(`regenmon_backup_${userId}`, JSON.stringify(saveData))
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
            return { success: false, error: err }
        }
    }, [])

    /**
     * Carga la partida del usuario desde Supabase
     * @param {string} userId - wallet address o identificador único del usuario
     */
    const loadFromSupabase = useCallback(async (userId) => {
        if (!userId) return null

        try {
            const { data, error } = await supabase
                .from('game_saves')
                .select('save_data, updated_at')
                .eq('user_id', userId)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No existe partida en Supabase — puede ser usuario nuevo o partida en localStorage
                    console.log('📭 No hay partida en Supabase para este usuario')

                    // Intentar migrar desde localStorage si existe
                    const localBackup = localStorage.getItem(`regenmon_backup_${userId}`)
                    const localSave = localStorage.getItem(`regenmon_user_${userId}_regenmon_save_v4`)

                    const localData = localSave || localBackup
                    if (localData) {
                        console.log('🔄 Encontrada partida en localStorage, migrando a Supabase...')
                        const parsed = JSON.parse(localData)
                        await saveToSupabase(userId, parsed)
                        return parsed
                    }

                    return null
                }
                console.error('❌ Error cargando desde Supabase:', error)
                return null
            }

            console.log('☁️ Partida cargada desde Supabase, última actualización:', data.updated_at)
            return data.save_data

        } catch (err) {
            console.error('❌ Excepción al cargar desde Supabase:', err)
            return null
        }
    }, [saveToSupabase])

    /**
     * Borra la partida del usuario de Supabase
     * @param {string} userId
     */
    const deleteFromSupabase = useCallback(async (userId) => {
        if (!userId) return

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
