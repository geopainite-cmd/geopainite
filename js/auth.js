import { supabase } from './supabase.js'

/* ══════════════════════════════════════════════
   AUTH — GeoPainite (versión final)
══════════════════════════════════════════════ */

export const Auth = {

  /* ── REGISTRO ── */
  async register(nombre, email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } }
      })
      if (error) throw error
      return { ok: true, data }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  /* ── LOGIN ── */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })
      if (error) throw error

      // Registrar sesión
      await registrarSesion(data.user.id)
      return { ok: true, data }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  /* ── LOGOUT ── */
  async logout() {
    await supabase.auth.signOut()
    updateAuthUI(null)
    Toast.show('Sesión cerrada', 'info')
    setTimeout(() => window.location.href = '/index.html', 800)
  },

  /* ── OBTENER PERFIL COMPLETO ── */
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()
    return data
  },

  /* ── SESIÓN ACTIVA ── */
  async isLogged() {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  /* ── ES ADMIN ── */
  async isAdmin() {
    const perfil = await this.getUser()
    return perfil?.rol === 'admin'
  },

  /* ── REQUERIR LOGIN ── */
  async requireLogin(callback) {
    const logged = await this.isLogged()
    if (logged) { callback && callback(); return true }
    Toast.show('Inicia sesión para continuar', 'info')
    ModalAuth.open()
    return false
  },

  /* ── REQUERIR ADMIN ── */
  async requireAdmin() {
    const admin = await this.isAdmin()
    if (!admin) {
      window.location.href = '/index.html'
      return false
    }
    return true
  },

  /* ── INICIALIZAR ── */
  init() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const perfil = await this.getUser()
        updateAuthUI(perfil)
      } else {
        updateAuthUI(null)
      }
    })
  }
}

/* ── Registrar sesión del dispositivo ── */
async function registrarSesion(usuarioId) {
  const deviceHash = await getDeviceHash()
  await supabase.from('sesiones').upsert({
    usuario_id:    usuarioId,
    device_hash:   deviceHash,
    ultimo_acceso: new Date().toISOString(),
    activa:        true
  }, { onConflict: 'usuario_id,device_hash' })
}

/* ── Hash simple del dispositivo ── */
async function getDeviceHash() {
  const str = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height
  ].join('|')
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(str)
  )
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').substring(0, 32)
}

/* ══════════════════════════════════════════════
   ACTUALIZAR UI
══════════════════════════════════════════════ */
export async function updateAuthUI(perfil) {
  const wrap = document.getElementById('auth-wrap')
  if (!wrap) return

  if (perfil) {
    const rolIcon = { admin: '👑', premium: '⭐', free: '💎' }
    wrap.innerHTML = `
      <div class="user-pill">
        <div class="avatar">
          ${perfil.nombre.charAt(0).toUpperCase()}
        </div>
        <span>${perfil.nombre.split(' ')[0]}</span>
        <span class="user-creditos">💰 ${perfil.creditos}</span>
        ${perfil.rol !== 'free'
          ? `<span style="font-size:.65rem">${rolIcon[perfil.rol]}</span>`
          : ''}
      </div>
      ${perfil.rol === 'admin'
        ? `<a href="/admin/index.html"
             style="padding:.28rem .65rem;border:1.5px solid var(--border);
             border-radius:30px;font-size:.73rem;font-weight:600;
             color:var(--vino);text-decoration:none">
             👑 Admin
           </a>`
        : ''}
      <button id="btn-logout" onclick="Auth.logout()">Salir</button>
    `
  } else {
    wrap.innerHTML = `
      <button id="btn-login" onclick="ModalAuth.open()">Ingresar</button>
    `
  }
}

/* ══════════════════════════════════════════════
   MODAL AUTH
══════════════════════════════════════════════ */
export const ModalAuth = {
  open(tab = 'login') {
    let modal = document.getElementById('modal-auth')
    if (!modal) {
      document.body.appendChild(crearModalAuth())
      modal = document.getElementById('modal-auth')
    }
    modal.classList.add('open')
    this.switchTab(tab)
  },

  close() {
    document.getElementById('modal-auth')?.classList.remove('open')
  },

  switchTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab))
    document.querySelectorAll('.auth-pane').forEach(p =>
      p.classList.toggle('active', p.id === `auth-${tab}`))
  }
}

function crearModalAuth() {
  const div = document.createElement('div')
  div.innerHTML = `
    <div class="modal-overlay" id="modal-auth">
      <div class="modal-box">
        <div class="modal-head">
          <h3>💎 GeoPainite</h3>
          <button class="modal-close" onclick="ModalAuth.close()">✕</button>
        </div>

        <div style="display:flex;gap:.3rem;padding:.8rem 1.8rem 0;
          border-bottom:2px solid var(--border)">
          <button class="auth-tab-btn active" data-tab="login"
            onclick="ModalAuth.switchTab('login')"
            style="flex:1;padding:.5rem;background:none;border:none;
            border-bottom:2.5px solid transparent;font-weight:700;
            font-size:.88rem;cursor:pointer;color:var(--text-muted);
            transition:var(--tr)">
            Iniciar Sesión
          </button>
          <button class="auth-tab-btn" data-tab="registro"
            onclick="ModalAuth.switchTab('registro')"
            style="flex:1;padding:.5rem;background:none;border:none;
            border-bottom:2.5px solid transparent;font-weight:700;
            font-size:.88rem;cursor:pointer;color:var(--text-muted);
            transition:var(--tr)">
            Registrarse
          </button>
        </div>

        <div class="modal-body">

          <div class="auth-pane active" id="auth-login">
            <div class="form-field">
              <label>Correo electrónico</label>
              <input type="email" id="login-email"
                placeholder="correo@ejemplo.com">
            </div>
            <div class="form-field">
              <label>Contraseña</label>
              <input type="password" id="login-pass"
                placeholder="Tu contraseña"
                onkeydown="if(event.key==='Enter') handleLogin()">
            </div>
            <p id="login-error"
              style="color:var(--rojo);font-size:.8rem;
              display:none;margin-bottom:.5rem"></p>
            <button class="btn" id="btn-login-submit"
              style="width:100%;justify-content:center"
              onclick="handleLogin()">
              Iniciar Sesión
            </button>
            <p style="text-align:center;font-size:.8rem;
              margin-top:.8rem;color:var(--text-muted)">
              ¿No tienes cuenta?
              <a href="#" onclick="ModalAuth.switchTab('registro')"
                style="color:var(--vino);font-weight:700">
                Regístrate gratis
              </a>
            </p>
          </div>

          <div class="auth-pane" id="auth-registro">
            <div class="form-field">
              <label>Nombre completo</label>
              <input type="text" id="reg-nombre"
                placeholder="Ej. Ana Quispe">
            </div>
            <div class="form-field">
              <label>Correo electrónico</label>
              <input type="email" id="reg-email"
                placeholder="correo@ejemplo.com">
            </div>
            <div class="form-field">
              <label>Contraseña</label>
              <input type="password" id="reg-pass"
                placeholder="Mínimo 6 caracteres"
                onkeydown="if(event.key==='Enter') handleRegister()">
            </div>
            <p id="reg-error"
              style="color:var(--rojo);font-size:.8rem;
              display:none;margin-bottom:.5rem"></p>
            <button class="btn" id="btn-reg-submit"
              style="width:100%;justify-content:center"
              onclick="handleRegister()">
              Crear cuenta gratis
            </button>
            <p style="text-align:center;font-size:.8rem;
              margin-top:.8rem;color:var(--text-muted)">
              Al registrarte recibes
              <strong style="color:var(--vino)">
                10 créditos gratis
              </strong> 🎉
            </p>
          </div>

        </div>
      </div>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    .auth-tab-btn.active {
      color: var(--vino) !important;
      border-bottom-color: var(--vino) !important;
    }
    .auth-pane { display: none; }
    .auth-pane.active {
      display: block;
      animation: fadeUp .3s ease;
    }
    .user-creditos {
      background: var(--dorado-bg);
      color: var(--dorado);
      font-size: .68rem;
      font-weight: 800;
      padding: .15rem .5rem;
      border-radius: 20px;
      border: 1px solid rgba(201,147,58,.2);
    }
  `
  document.head.appendChild(style)

  div.querySelector('#modal-auth').addEventListener('click', e => {
    if (e.target.id === 'modal-auth') ModalAuth.close()
  })

  return div.firstElementChild
}

/* ── Handlers globales ── */
window.handleLogin = async function() {
  const email = document.getElementById('login-email')?.value.trim()
  const pass  = document.getElementById('login-pass')?.value
  const errEl = document.getElementById('login-error')
  const btn   = document.getElementById('btn-login-submit')
  if (!email || !pass) {
    errEl.textContent = 'Completa todos los campos'
    errEl.style.display = 'block'
    return
  }
  btn.textContent = 'Ingresando...'
  btn.disabled = true
  const result = await Auth.login(email, pass)
  if (result.ok) {
    ModalAuth.close()
    Toast.show('¡Bienvenido de vuelta! 👋', 'success')
  } else {
    errEl.textContent = 'Correo o contraseña incorrectos'
    errEl.style.display = 'block'
    btn.textContent = 'Iniciar Sesión'
    btn.disabled = false
  }
}

window.handleRegister = async function() {
  const nombre = document.getElementById('reg-nombre')?.value.trim()
  const email  = document.getElementById('reg-email')?.value.trim()
  const pass   = document.getElementById('reg-pass')?.value
  const errEl  = document.getElementById('reg-error')
  const btn    = document.getElementById('btn-reg-submit')
  if (!nombre || !email || !pass) {
    errEl.textContent = 'Completa todos los campos'
    errEl.style.display = 'block'
    return
  }
  if (pass.length < 6) {
    errEl.textContent = 'Contraseña mínimo 6 caracteres'
    errEl.style.display = 'block'
    return
  }
  btn.textContent = 'Creando cuenta...'
  btn.disabled = true
  const result = await Auth.register(nombre, email, pass)
  if (result.ok) {
    ModalAuth.close()
    Toast.show(
      `¡Bienvenido/a ${nombre}! Revisa tu correo 📧`,
      'success', 5000
    )
  } else {
    errEl.textContent = result.error
    errEl.style.display = 'block'
    btn.textContent = 'Crear cuenta gratis'
    btn.disabled = false
  }
}

window.Auth     = Auth
window.ModalAuth = ModalAuth