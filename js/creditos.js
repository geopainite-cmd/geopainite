import { supabase } from './supabase.js'

/* ══════════════════════════════════════════════
   CRÉDITOS — GeoPainite (versión final)
   Toda la lógica crítica va al backend SQL
══════════════════════════════════════════════ */

export const Creditos = {

  /* ── OBTENER SALDO ── */
  async getSaldo(usuarioId) {
    const { data } = await supabase
      .from('usuarios')
      .select('creditos')
      .eq('id', usuarioId)
      .single()
    return data?.creditos ?? 0
  },

  /* ── COBRAR (llama función SQL atómica) ── */
  async cobrar(usuarioId, archivoId, tipo = 'descarga') {
    const { data, error } = await supabase.rpc('cobrar_creditos', {
      p_usuario_id: usuarioId,
      p_archivo_id: archivoId,
      p_tipo:       tipo
    })
    if (error) return { ok: false, error: error.message }
    return data
  },

  /* ── SUMAR (admin o bonos) ── */
  async sumar(usuarioId, cantidad, concepto) {
    const { data, error } = await supabase.rpc('sumar_creditos', {
      p_usuario_id: usuarioId,
      p_cantidad:   cantidad,
      p_concepto:   concepto
    })
    if (error) return { ok: false, error: error.message }
    return data
  },

  /* ── HISTORIAL ── */
  async getHistorial(usuarioId, limite = 20) {
    const { data } = await supabase
      .from('transacciones')
      .select('*, archivos(titulo)')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(limite)
    return data || []
  },

  /* ── ACTUALIZAR UI ── */
  async actualizarUI(usuarioId) {
    const saldo = await this.getSaldo(usuarioId)
    document.querySelectorAll('.user-creditos').forEach(el => {
      el.textContent = `💰 ${saldo}`
    })
    return saldo
  }
}

window.Creditos = Creditos