import { supabase } from './supabase.js'
import { Auth }     from './auth.js'

/* ══════════════════════════════════════════════════════════════
   ADMIN.JS — GeoPainite
   Lógica completa del panel de administración
══════════════════════════════════════════════════════════════ */

/* ── VERIFICAR ACCESO ADMIN ── */
export async function verificarAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { window.location.href = '../index.html'; return null }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'admin') {
    alert('Acceso denegado. No tienes permisos de administrador.')
    window.location.href = '../index.html'
    return null
  }

  // Mostrar info del admin en sidebar
  const nombreEl = document.getElementById('admin-nombre')
  const avatarEl = document.getElementById('admin-avatar')
  if (nombreEl) nombreEl.textContent = perfil.nombre
  if (avatarEl) avatarEl.textContent = perfil.nombre.charAt(0).toUpperCase()

  return perfil
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
export async function cargarDashboard() {
  const [
    { count: totalUsuarios, data: usuariosData },
    { count: totalArchivos },
    { count: totalPendientes },
  ] = await Promise.all([
    supabase.from('usuarios').select('id, creditos', { count: 'exact' }),
    supabase.from('archivos').select('id', { count: 'exact' }).eq('estado', 'aprobado'),
    supabase.from('archivos').select('id', { count: 'exact' }).eq('estado', 'pendiente'),
  ])

  setEl('stat-usuarios',   totalUsuarios  || 0)
  setEl('stat-archivos',   totalArchivos  || 0)
  setEl('stat-pendientes', totalPendientes || 0)

  const totalCreditos = (usuariosData || [])
    .reduce((s, u) => s + (u.creditos || 0), 0)
  setEl('stat-creditos', totalCreditos)

  // Badge pendientes en sidebar
  const badge = document.getElementById('badge-pendientes')
  if (badge && totalPendientes > 0) {
    badge.textContent = totalPendientes
    badge.style.display = 'inline'
  }

  // Últimos usuarios registrados
  const { data: ultimos } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  renderTabla('tabla-ultimos-usuarios', ultimos || [], u => `
    <tr>
      <td><strong>${u.nombre}</strong></td>
      <td style="font-size:.8rem">${u.email}</td>
      <td><span class="rol-badge rol-${u.rol}">${u.rol}</span></td>
      <td><strong style="color:var(--vino)">💰 ${u.creditos}</strong></td>
      <td style="font-size:.78rem;color:var(--text-muted)">
        ${formatFecha(u.created_at)}
      </td>
    </tr>
  `, 5)
}

/* ══════════════════════════════════════════════════════════════
   USUARIOS
══════════════════════════════════════════════════════════════ */
export async function cargarUsuarios() {
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  // Tabla usuarios
  renderTabla('tabla-usuarios', data || [], u => `
    <tr>
      <td><strong>${u.nombre}</strong></td>
      <td style="font-size:.8rem">${u.email}</td>
      <td><span class="rol-badge rol-${u.rol}">${u.rol}</span></td>
      <td><strong style="color:var(--vino)">💰 ${u.creditos}</strong></td>
      <td><span class="estado-badge estado-${u.estado}">${u.estado}</span></td>
      <td style="font-size:.78rem;color:var(--text-muted)">${formatFecha(u.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-xs btn-xs-gold"
            onclick="AdminActions.abrirCreditos('${u.id}','${u.nombre}',${u.creditos})">
            💰 Créditos
          </button>
          <button class="btn-xs btn-xs-primary"
            onclick="AdminActions.cambiarRol('${u.id}','${u.rol}')">
            👑 Rol
          </button>
          <button class="btn-xs ${u.estado === 'activo' ? 'btn-xs-red' : 'btn-xs-green'}"
            onclick="AdminActions.toggleEstado('${u.id}','${u.estado}')">
            ${u.estado === 'activo' ? '🚫 Suspender' : '✅ Activar'}
          </button>
        </div>
      </td>
    </tr>
  `)

  // Tabla créditos
  renderTabla('tabla-creditos', data || [], u => `
    <tr>
      <td><strong>${u.nombre}</strong></td>
      <td style="font-size:.8rem">${u.email}</td>
      <td><strong style="color:var(--vino);font-size:1.1rem">💰 ${u.creditos}</strong></td>
      <td style="color:var(--verde)">+${u.creditos_ganados || 0}</td>
      <td style="color:var(--rojo)">−${u.creditos_gastados || 0}</td>
      <td>
        <button class="btn-xs btn-xs-gold"
          onclick="AdminActions.abrirCreditos('${u.id}','${u.nombre}',${u.creditos})">
          💰 Editar
        </button>
      </td>
    </tr>
  `)
}

/* ══════════════════════════════════════════════════════════════
   ARCHIVOS APROBADOS
══════════════════════════════════════════════════════════════ */
export async function cargarArchivos() {
  const { data } = await supabase
    .from('archivos')
    .select('*, usuarios(nombre)')
    .eq('estado', 'aprobado')
    .order('created_at', { ascending: false })

  renderTabla('tabla-archivos', data || [], a => `
    <tr>
      <td><strong>${a.titulo}</strong></td>
      <td><span class="estado-badge estado-aprobado">${a.tipo || '—'}</span></td>
      <td style="font-size:.8rem">${a.categoria || '—'}</td>
      <td><span class="estado-badge" style="background:rgba(201,147,58,.1);color:var(--dorado)">${a.nivel_calidad || 'bueno'}</span></td>
      <td style="font-size:.8rem">${a.usuarios?.nombre || '—'}</td>
      <td style="text-align:center">${a.descargas || 0}</td>
      <td><strong style="color:var(--vino)">💰 ${a.costo_descargar}</strong></td>
      <td>
        <div class="action-btns">
          <button class="btn-xs btn-xs-primary"
            onclick="AdminActions.editarPrecio('${a.id}',${a.costo_descargar})">
            ✏️ Precio
          </button>
          <button class="btn-xs btn-xs-red"
            onclick="AdminActions.rechazarArchivo('${a.id}')">
            🗑 Eliminar
          </button>
        </div>
      </td>
    </tr>
  `)
}

/* ══════════════════════════════════════════════════════════════
   ARCHIVOS PENDIENTES
══════════════════════════════════════════════════════════════ */
export async function cargarPendientes() {
  const { data } = await supabase
    .from('archivos')
    .select('*, usuarios(nombre, email)')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })

  renderTabla('tabla-pendientes', data || [], a => `
    <tr>
      <td>
        <strong>${a.titulo}</strong>
        ${a.descripcion ? `<br><span style="font-size:.75rem;color:var(--text-muted)">${a.descripcion.substring(0,80)}...</span>` : ''}
      </td>
      <td><span class="estado-badge estado-pendiente">${a.tipo || '—'}</span></td>
      <td style="font-size:.8rem">
        ${a.usuarios?.nombre || '—'}
        <br><span style="color:var(--text-muted)">${a.usuarios?.email || ''}</span>
      </td>
      <td style="font-size:.78rem;color:var(--text-muted)">${formatFecha(a.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-xs btn-xs-green"
            onclick="AdminActions.aprobarArchivo('${a.id}')">
            ✅ Aprobar
          </button>
          <button class="btn-xs btn-xs-red"
            onclick="AdminActions.rechazarArchivo('${a.id}')">
            ❌ Rechazar
          </button>
        </div>
      </td>
    </tr>
  `, 0, 'Sin archivos pendientes 🎉')
}

/* ══════════════════════════════════════════════════════════════
   TRANSACCIONES
══════════════════════════════════════════════════════════════ */
export async function cargarTransacciones() {
  const { data } = await supabase
    .from('transacciones')
    .select('*, usuarios(nombre)')
    .order('created_at', { ascending: false })
    .limit(100)

  const colores = {
    ganado:    'color:var(--verde)',
    gastado:   'color:var(--rojo)',
    recargado: 'color:var(--dorado)',
    admin:     'color:var(--purpura-mid)',
    bono:      'color:var(--purpura-mid)'
  }

  renderTabla('tabla-transacciones', data || [], t => `
    <tr>
      <td><strong>${t.usuarios?.nombre || '—'}</strong></td>
      <td><span style="${colores[t.tipo] || ''};font-weight:700">${t.tipo}</span></td>
      <td style="${t.cantidad > 0 ? 'color:var(--verde)' : 'color:var(--rojo)'}">
        <strong>${t.cantidad > 0 ? '+' : ''}${t.cantidad}</strong>
      </td>
      <td style="font-size:.8rem">${t.concepto || '—'}</td>
      <td><strong style="color:var(--vino)">💰 ${t.saldo_nuevo ?? '—'}</strong></td>
      <td style="font-size:.78rem;color:var(--text-muted)">${formatFecha(t.created_at)}</td>
    </tr>
  `)
}

/* ══════════════════════════════════════════════════════════════
   REPORTES
══════════════════════════════════════════════════════════════ */
export async function cargarReportes() {
  const { data } = await supabase
    .from('reportes')
    .select('*, usuarios(nombre), archivos(titulo)')
    .order('created_at', { ascending: false })

  renderTabla('tabla-reportes', data || [], r => `
    <tr>
      <td><strong>${r.archivos?.titulo || '—'}</strong></td>
      <td style="font-size:.8rem">${r.usuarios?.nombre || '—'}</td>
      <td style="font-size:.8rem">${r.motivo || '—'}</td>
      <td><span class="estado-badge estado-${r.estado}">${r.estado}</span></td>
      <td style="font-size:.78rem;color:var(--text-muted)">${formatFecha(r.created_at)}</td>
      <td>
        <button class="btn-xs btn-xs-green"
          onclick="AdminActions.resolverReporte('${r.id}')">
          ✅ Resolver
        </button>
      </td>
    </tr>
  `, 0, 'Sin reportes pendientes')
}

/* ══════════════════════════════════════════════════════════════
   ACCIONES ADMIN
══════════════════════════════════════════════════════════════ */
export const AdminActions = {

  /* ── APROBAR ARCHIVO ── */
  async aprobarArchivo(archivoId) {
    const { data, error } = await supabase.rpc('aprobar_archivo', {
      p_archivo_id: archivoId,
      p_admin_id:   (await supabase.auth.getUser()).data.user.id
    })
    if (error) { AdminToast.show('Error al aprobar: ' + error.message, 'error'); return }
    AdminToast.show('✅ Archivo aprobado y créditos enviados al autor', 'success')
    await cargarPendientes()
    await cargarDashboard()
  },

  /* ── RECHAZAR ARCHIVO ── */
  async rechazarArchivo(archivoId) {
    if (!confirm('¿Rechazar/eliminar este archivo?')) return
    const { error } = await supabase
      .from('archivos')
      .update({ estado: 'rechazado' })
      .eq('id', archivoId)
    if (error) { AdminToast.show('Error', 'error'); return }
    AdminToast.show('❌ Archivo rechazado', 'info')
    await cargarPendientes()
    await cargarArchivos()
  },

  /* ── CAMBIAR ROL ── */
  async cambiarRol(usuarioId, rolActual) {
    const roles = ['free', 'premium', 'admin']
    const idx = roles.indexOf(rolActual)
    const nuevoRol = roles[(idx + 1) % roles.length]
    if (!confirm(`¿Cambiar rol a: ${nuevoRol.toUpperCase()}?`)) return
    await supabase.from('usuarios').update({ rol: nuevoRol }).eq('id', usuarioId)
    AdminToast.show(`👑 Rol cambiado a ${nuevoRol}`, 'success')
    await cargarUsuarios()
  },

  /* ── SUSPENDER / ACTIVAR ── */
  async toggleEstado(usuarioId, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'suspendido' : 'activo'
    if (!confirm(`¿${nuevoEstado === 'suspendido' ? 'Suspender' : 'Activar'} este usuario?`)) return
    await supabase.from('usuarios').update({ estado: nuevoEstado }).eq('id', usuarioId)
    AdminToast.show(`Usuario ${nuevoEstado}`, nuevoEstado === 'activo' ? 'success' : 'info')
    await cargarUsuarios()
  },

  /* ── ABRIR MODAL CRÉDITOS ── */
  abrirCreditos(id, nombre, saldo) {
    document.getElementById('creditos-usuario-id').value = id
    document.getElementById('creditos-usuario-nombre').textContent = nombre
    document.getElementById('creditos-saldo-actual').textContent = saldo
    document.getElementById('creditos-cantidad').value = ''
    document.getElementById('creditos-motivo').value = ''
    document.getElementById('modal-creditos').classList.add('open')
  },

  /* ── APLICAR CRÉDITOS ── */
  async aplicarCreditos() {
    const id       = document.getElementById('creditos-usuario-id').value
    const op       = document.getElementById('creditos-operacion').value
    const cantidad = parseInt(document.getElementById('creditos-cantidad').value)
    const motivo   = document.getElementById('creditos-motivo').value || 'Ajuste manual admin'

    if (!cantidad || cantidad <= 0) {
      AdminToast.show('Ingresa una cantidad válida', 'error'); return
    }

    let delta = cantidad
    if (op === 'restar') delta = -cantidad
    if (op === 'establecer') {
      const saldoActual = parseInt(
        document.getElementById('creditos-saldo-actual').textContent
      )
      delta = cantidad - saldoActual
    }

    const { data, error } = await supabase.rpc('sumar_creditos', {
      p_usuario_id: id,
      p_cantidad:   delta,
      p_concepto:   `Admin: ${motivo}`
    })

    if (error) { AdminToast.show('Error: ' + error.message, 'error'); return }

    AdminToast.show(`💰 Créditos actualizados. Nuevo saldo: ${data.saldo_nuevo}`, 'success')
    document.getElementById('modal-creditos').classList.remove('open')
    await cargarUsuarios()
    await cargarDashboard()
  },

  /* ── EDITAR PRECIO ARCHIVO ── */
  async editarPrecio(archivoId, precioActual) {
    const nuevo = prompt(`Nuevo precio en créditos (actual: ${precioActual}):`)
    const num = parseInt(nuevo)
    if (isNaN(num) || num < 0) return
    await supabase
      .from('archivos')
      .update({ precio_override: num, costo_descargar: num })
      .eq('id', archivoId)
    AdminToast.show(`💰 Precio actualizado a ${num} créditos`, 'success')
    await cargarArchivos()
  },

  /* ── RESOLVER REPORTE ── */
  async resolverReporte(reporteId) {
    await supabase
      .from('reportes')
      .update({ estado: 'resuelto' })
      .eq('id', reporteId)
    AdminToast.show('✅ Reporte resuelto', 'success')
    await cargarReportes()
  }
}

/* ══════════════════════════════════════════════════════════════
   NAVEGACIÓN ENTRE SECCIONES
══════════════════════════════════════════════════════════════ */
export function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s =>
    s.classList.remove('active'))
  document.querySelectorAll('.sidebar-link').forEach(l =>
    l.classList.remove('active'))

  document.getElementById(`section-${id}`)?.classList.add('active')
  document.querySelector(`[onclick="showSection('${id}')"]`)
    ?.classList.add('active')

  const titulos = {
    dashboard:      'Dashboard',
    usuarios:       'Usuarios',
    creditos:       'Gestión de Créditos',
    archivos:       'Archivos Aprobados',
    pendientes:     'Pendientes de Revisión',
    transacciones:  'Transacciones',
    reportes:       'Reportes'
  }
  const titleEl = document.getElementById('section-title')
  if (titleEl) titleEl.textContent = titulos[id] || id
}

/* ══════════════════════════════════════════════════════════════
   BÚSQUEDA EN TABLAS
══════════════════════════════════════════════════════════════ */
export function filtrarTabla(tablaId, query) {
  const tbody = document.getElementById(tablaId)
  if (!tbody) return
  const q = query.toLowerCase()
  tbody.querySelectorAll('tr').forEach(fila => {
    fila.style.display =
      fila.textContent.toLowerCase().includes(q) ? '' : 'none'
  })
}

/* ══════════════════════════════════════════════════════════════
   TOAST DEL ADMIN
══════════════════════════════════════════════════════════════ */
export const AdminToast = {
  show(msg, type = 'info', duration = 3500) {
    let c = document.getElementById('toast-container')
    if (!c) {
      c = document.createElement('div')
      c.id = 'toast-container'
      document.body.appendChild(c)
    }
    const icons = { success: '✓', error: '⚠', info: '💎' }
    const el = document.createElement('div')
    el.className = `toast toast-${type}`
    el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${msg}</span>`
    c.appendChild(el)
    setTimeout(() => {
      el.classList.add('toast-out')
      setTimeout(() => el.remove(), 350)
    }, duration)
  }
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function setEl(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function formatFecha(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function renderTabla(tbodyId, data, rowFn, colCount = 0, emptyMsg = 'Sin datos') {
  const tbody = document.getElementById(tbodyId)
  if (!tbody) return

  if (!data.length) {
    const cols = colCount || tbody.closest('table')?.querySelectorAll('th').length || 5
    tbody.innerHTML = `<tr><td colspan="${cols}"
      style="text-align:center;padding:2rem;color:var(--text-muted)">
      ${emptyMsg}
    </td></tr>`
    return
  }

  tbody.innerHTML = data.map(rowFn).join('')
}

/* ── Exponer globalmente para los onclick del HTML ── */
window.AdminActions  = AdminActions
window.showSection   = showSection
window.filtrarTabla  = filtrarTabla
window.AdminToast    = AdminToast

/* ── Cerrar modal créditos ── */
window.cerrarModalCreditos = () => {
  document.getElementById('modal-creditos')?.classList.remove('open')
}
window.aplicarCreditos = () => AdminActions.aplicarCreditos()