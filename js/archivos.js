import { supabase }  from './supabase.js'
import { Creditos }  from './creditos.js'

/* ══════════════════════════════════════════════
   ARCHIVOS — GeoPainite (versión final)
══════════════════════════════════════════════ */

// Tipos y tamaños permitidos
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument'
  + '.presentationml.presentation'
]

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export const Archivos = {

  /* ── SUBIR ARCHIVO ── */
  async subir(file, metadata) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { ok: false, error: 'Debes iniciar sesión' }

      // Validar tipo
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        return {
          ok: false,
          error: 'Solo se permiten PDF, imágenes y PowerPoint'
        }
      }

      // Validar tamaño
      if (file.size > MAX_SIZE) {
        return { ok: false, error: 'El archivo supera los 10MB' }
      }

      // Obtener perfil para saber si es admin
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      const esAdmin  = perfil?.rol === 'admin'
      const extension = file.name.split('.').pop().toLowerCase()
      const rutaStorage = `${user.id}/${Date.now()}.${extension}`

      // Subir a Storage
      const { error: storageError } = await supabase
        .storage
        .from('archivos')
        .upload(rutaStorage, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      // Calcular precio automático
      const precioBase = calcularPrecioFrontend(
        metadata.tipo,
        metadata.nivel_calidad || 'bueno'
      )

      // Guardar en BD
      const { data: archivo, error: dbError } = await supabase
        .from('archivos')
        .insert({
          titulo:             metadata.titulo,
          descripcion:        metadata.descripcion || '',
          tipo:               metadata.tipo,
          categoria:          metadata.categoria,
          nivel_calidad:      metadata.nivel_calidad || 'bueno',
          storage_path:       rutaStorage,
          subido_por:         user.id,
          // Admin → aprobado directo, usuario → pendiente
          estado:             esAdmin ? 'aprobado' : 'pendiente',
          costo_ver:          0,
          costo_descargar:    precioBase,
          creditos_por_subir: 10,
          tamanio_bytes:      file.size
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Si es admin, no necesita aprobación
      // Si es usuario, el admin aprueba y se dan créditos
      return { ok: true, archivo, esAdmin }

    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  /* ── OBTENER ARCHIVOS APROBADOS ── */
  async getAprobados(filtros = {}) {
    let query = supabase
      .from('archivos')
      .select(`
        id, titulo, descripcion, tipo,
        categoria, nivel_calidad,
        costo_descargar, costo_ver,
        descargas, vistas, created_at,
        usuarios(nombre),
        valoraciones(estrellas)
      `)
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false })

    if (filtros.tipo)      query = query.eq('tipo', filtros.tipo)
    if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
    if (filtros.busqueda)  query = query.ilike('titulo', `%${filtros.busqueda}%`)
    if (filtros.limite)    query = query.limit(filtros.limite)

    const { data } = await query
    return (data || []).map(a => ({
      ...a,
      promedio_estrellas: a.valoraciones?.length
        ? (a.valoraciones.reduce((s, v) => s + v.estrellas, 0)
           / a.valoraciones.length).toFixed(1)
        : null
    }))
  },

  /* ── DESCARGAR (usa función SQL atómica) ── */
  async descargar(archivoId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      Toast.show('Inicia sesión para descargar', 'info')
      window.ModalAuth?.open()
      return { ok: false }
    }

    Toast.show('Procesando descarga...', 'info')

    // Llamar función atómica del backend
    const resultado = await Creditos.cobrar(user.id, archivoId, 'descarga')

    if (!resultado.ok) {
      Toast.show(resultado.error, 'error', 5000)
      return resultado
    }

    // Si ya había accedido o el cobro fue exitoso
    if (resultado.storage_path) {
      const url = await this.getSignedUrl(resultado.storage_path)
      if (!url) {
        Toast.show('Error al generar el enlace de descarga', 'error')
        return { ok: false }
      }

      // Descargar
      const link = document.createElement('a')
      link.href     = url
      link.download = ''
      link.click()

      // Actualizar créditos en UI
      await Creditos.actualizarUI(user.id)

      const msg = resultado.ya_accedio
        ? '✅ Descargando (ya tenías acceso)'
        : `✅ Descargando · Saldo: 💰 ${resultado.saldo_nuevo}`

      Toast.show(msg, 'success')
      return { ok: true }
    }

    return { ok: false, error: 'Error inesperado' }
  },

  /* ── VER PREVIEW ── */
  async verPreview(archivoId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      Toast.show('Inicia sesión para ver el archivo', 'info')
      return null
    }

    const resultado = await Creditos.cobrar(user.id, archivoId, 'vista')
    if (!resultado.ok) {
      Toast.show(resultado.error, 'error')
      return null
    }

    if (resultado.storage_path) {
      return await this.getSignedUrl(resultado.storage_path, 300)
    }

    return null
  },

  /* ── URL FIRMADA ── */
  async getSignedUrl(storagePath, segundos = 60) {
    const { data } = await supabase
      .storage
      .from('archivos')
      .createSignedUrl(storagePath, segundos)
    return data?.signedUrl || null
  },

  /* ── VALORAR ── */
  async valorar(archivoId, estrellas, comentario = '') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false }
    const { error } = await supabase
      .from('valoraciones')
      .upsert({
        usuario_id: user.id,
        archivo_id: archivoId,
        estrellas,
        comentario
      })
    if (error) return { ok: false }
    Toast.show('⭐ Valoración guardada', 'success')
    return { ok: true }
  },

  /* ── REPORTAR ── */
  async reportar(archivoId, motivo, detalle = '') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false }
    await supabase.from('reportes').insert({
      usuario_id: user.id,
      archivo_id: archivoId,
      motivo,
      detalle
    })
    Toast.show('🚨 Reporte enviado', 'info')
    return { ok: true }
  }
}

/* ── Precio estimado en frontend (referencia visual) ── */
export function calcularPrecioFrontend(tipo, nivel) {
  const base = {
    imagen: 2, apunte: 4, practica: 5,
    pdf: 5, ppt: 6, examen: 8, tesis: 12
  }
  const mult = { basico: 0.75, bueno: 1.0, premium: 1.75 }
  return Math.ceil((base[tipo] || 5) * (mult[nivel] || 1.0))
}

window.Archivos = Archivos