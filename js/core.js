/* ═══════════════════════════════════════════════════════════════
   GeoPainite — core.js (LIMPIO v3 — Supabase)
   Módulos: DarkMode, Toast, Buscador, ScrollReveal,
            PageProgress, BackTop, NavMobile, animateCounter, initStars
   Auth y ModalAuth se manejan en auth.js
═══════════════════════════════════════════════════════════════ */

import { Auth, ModalAuth } from './auth.js'

/* ── 1. DARK MODE ────────────────────────────────────────────── */
const DarkMode = (() => {
  const PREF = 'gp_theme'
  const html  = document.documentElement

  function apply(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light')
    const btn = document.getElementById('dark-toggle')
    if (btn) btn.textContent = dark ? '☀️' : '🌙'
  }

  function init() {
    const saved = localStorage.getItem(PREF)
    const dark  = saved ? saved === 'dark'
                        : window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(dark)
    const btn = document.getElementById('dark-toggle')
    if (btn) btn.addEventListener('click', toggle)
  }

  function toggle() {
    const isDark = html.getAttribute('data-theme') === 'dark'
    localStorage.setItem(PREF, isDark ? 'light' : 'dark')
    apply(!isDark)
  }

  return { init, toggle }
})()

/* ── 2. TOAST ────────────────────────────────────────────────── */
const Toast = (() => {
  function ensure() {
    let c = document.getElementById('toast-container')
    if (!c) {
      c = document.createElement('div')
      c.id = 'toast-container'
      document.body.appendChild(c)
    }
    return c
  }

  function show(msg, type = 'info', duration = 3500) {
    const c     = ensure()
    const icons = { success: '✓', error: '⚠', info: '💎' }
    const el    = document.createElement('div')
    el.className = `toast toast-${type}`
    el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${msg}</span>`
    c.appendChild(el)
    setTimeout(() => {
      el.classList.add('toast-out')
      setTimeout(() => el.remove(), 350)
    }, duration)
  }

  return { show }
})()

/* ── 3. BUSCADOR GLOBAL ──────────────────────────────────────── */
const Buscador = (() => {
  const INDEX = [
    // Cursos
    { t: 'Geología General',          icon: '🌍', type: 'Curso',   url: 'cursos.html' },
    { t: 'Cristalografía',            icon: '🔬', type: 'Curso',   url: 'cursos.html' },
    { t: 'Mineralogía',               icon: '💎', type: 'Curso',   url: 'cursos.html' },
    { t: 'Mineralogía Óptica',        icon: '🔭', type: 'Curso',   url: 'cursos.html' },
    { t: 'Petrología Ígnea',          icon: '🌋', type: 'Curso',   url: 'cursos.html' },
    { t: 'Petrología Sedimentaria',   icon: '🏜', type: 'Curso',   url: 'cursos.html' },
    { t: 'Petrología Metamórfica',    icon: '⛰', type: 'Curso',   url: 'cursos.html' },
    { t: 'Estratigrafía',             icon: '📚', type: 'Curso',   url: 'cursos.html' },
    { t: 'Paleontología',             icon: '🦕', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geología Estructural',      icon: '🗺', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geomorfología',             icon: '🏔', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geología del Perú',         icon: '🇵🇪', type: 'Curso',  url: 'cursos.html' },
    { t: 'Sedimentología',            icon: '🌊', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geoestadística',            icon: '📊', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geotecnia',                 icon: '🏗', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geomecánica',               icon: '⚙', type: 'Curso',   url: 'cursos.html' },
    { t: 'Hidrogeología',             icon: '💧', type: 'Curso',   url: 'cursos.html' },
    { t: 'Geología Ambiental',        icon: '🌿', type: 'Curso',   url: 'cursos.html' },
    { t: 'Cartografía Geológica',     icon: '🗺', type: 'Curso',   url: 'cursos.html' },
    { t: 'Yacimientos Minerales',     icon: '⛏', type: 'Curso',   url: 'cursos.html' },
    { t: 'Metalurgia',                icon: '🔩', type: 'Curso',   url: 'cursos.html' },
    { t: 'Prospección Geoquímica',    icon: '🧪', type: 'Curso',   url: 'cursos.html' },
    { t: 'Prospección Geofísica',     icon: '📡', type: 'Curso',   url: 'cursos.html' },
    { t: 'Ingeniería Geológica',      icon: '🏚', type: 'Curso',   url: 'cursos.html' },
    { t: 'Gestión de Riesgos',        icon: '⚠', type: 'Curso',   url: 'cursos.html' },
    { t: 'Investigación en Geología', icon: '📝', type: 'Curso',   url: 'cursos.html' },
    // Páginas
    { t: 'Galería de Campo',          icon: '📸', type: 'Página',  url: 'campo.html' },
    { t: 'Diagramas Técnicos',        icon: '📐', type: 'Página',  url: 'diagramas.html' },
    { t: 'Repositorio Académico',     icon: '📄', type: 'Página',  url: 'repositorio.html' },
    { t: 'Biblioteca',                icon: '📚', type: 'Página',  url: 'biblioteca.html' },
    { t: 'Recursos Académicos',       icon: '🛠', type: 'Página',  url: 'recursos.html' },
    { t: 'Comunidad',                 icon: '👥', type: 'Página',  url: 'comunidad.html' },
    { t: 'Tienda de Minerales',       icon: '🛒', type: 'Página',  url: 'tienda.html' },
    { t: 'Contacto',                  icon: '✉', type: 'Página',  url: 'contacto.html' },
    // Minerales
    { t: 'Pirita Peruana',            icon: '✨', type: 'Mineral', url: 'tienda.html' },
    { t: 'Amatista Geoda',            icon: '💜', type: 'Mineral', url: 'tienda.html' },
    { t: 'Lazurita Azul',             icon: '💙', type: 'Mineral', url: 'tienda.html' },
    { t: 'Malaquita Espejo',          icon: '💚', type: 'Mineral', url: 'tienda.html' },
    { t: 'Citrina Dorada',            icon: '🌟', type: 'Mineral', url: 'tienda.html' },
    { t: 'Turquesa Natural',          icon: '🔷', type: 'Mineral', url: 'tienda.html' },
  ]

  function init() {
    const input    = document.getElementById('header-search')
    const dropdown = document.getElementById('search-dropdown')
    if (!input || !dropdown) return

    input.addEventListener('input', () => render(input.value.trim()))
    input.addEventListener('focus', () => { if (input.value.trim()) render(input.value.trim()) })
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target))
        dropdown.classList.remove('open')
    })
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.classList.remove('open'); input.blur() }
    })
  }

  function render(q) {
    const dropdown = document.getElementById('search-dropdown')
    if (!q) { dropdown.classList.remove('open'); return }
    const ql  = q.toLowerCase()
    const res = INDEX.filter(i => i.t.toLowerCase().includes(ql)).slice(0, 7)
    if (!res.length) { dropdown.classList.remove('open'); return }
    dropdown.innerHTML = res.map(r =>
      `<a class="sd-item" href="${r.url}">
        <span class="sd-icon">${r.icon}</span>
        <span class="sd-text">${r.t}</span>
        <span class="sd-type">${r.type}</span>
       </a>`
    ).join('')
    dropdown.classList.add('open')
  }

  return { init }
})()

/* ── 4. SCROLL REVEAL ────────────────────────────────────────── */
const ScrollReveal = (() => {
  function init() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const siblings = [...(e.target.parentElement?.children || [])]
        const idx = siblings.indexOf(e.target)
        e.target.style.transitionDelay = (idx * 0.08) + 's'
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
  }
  return { init }
})()

/* ── 5. PAGE PROGRESS ────────────────────────────────────────── */
const PageProgress = (() => {
  function init() {
    const bar = document.getElementById('page-progress')
    if (!bar) return
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      bar.style.width = Math.min(pct, 100) + '%'
    }, { passive: true })
  }
  return { init }
})()

/* ── 6. BACK TO TOP ──────────────────────────────────────────── */
const BackTop = (() => {
  function init() {
    const btn = document.getElementById('back-top')
    if (!btn) return
    window.addEventListener('scroll', () =>
      btn.classList.toggle('show', window.scrollY > 320), { passive: true })
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
  return { init }
})()

/* ── 7. NAV MOBILE ───────────────────────────────────────────── */
const NavMobile = (() => {
  function init() {
    const toggle = document.getElementById('nav-toggle')
    const nav    = document.querySelector('.nav')
    if (!toggle || !nav) return
    toggle.addEventListener('click', () => nav.classList.toggle('open'))
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && e.target !== toggle) nav.classList.remove('open')
    })
  }
  return { init }
})()

/* ── 8. ANIMATE COUNTER ──────────────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
  let start
  const step = ts => {
    if (!start) start = ts
    const p = Math.min((ts - start) / duration, 1)
    el.textContent = Math.floor(p * target)
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = target
  }
  requestAnimationFrame(step)
}

function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      e.target.querySelectorAll('[data-target]').forEach(el =>
        animateCounter(el, +el.dataset.target))
      obs.unobserve(e.target)
    })
  }, { threshold: 0.4 })
  document.querySelectorAll('.hero-stats, .shop-stats').forEach(el => obs.observe(el))
}

/* ── 9. STAR RATING ──────────────────────────────────────────── */
function initStars(container) {
  const stars = container
    ? container.querySelectorAll('.star')
    : document.querySelectorAll('.star')

  stars.forEach((star, i, arr) => {
    star.addEventListener('mouseenter', () => {
      arr.forEach((s, j) => s.classList.toggle('hover', j <= i))
    })
    star.addEventListener('mouseleave', () => {
      arr.forEach(s => s.classList.remove('hover'))
    })
    star.addEventListener('click', () => {
      arr.forEach((s, j) => s.classList.toggle('filled', j <= i))
      star.closest('.post-card')?.setAttribute('data-rating', i + 1)
    })
  })
}

/* ── 10. BOOT ────────────────────────────────────────────────── */
/*-document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init()
  Auth.init()          // sistema Supabase (auth.js)
  Buscador.init()
  ScrollReveal.init()
  PageProgress.init()
  BackTop.init()
  NavMobile.init()
  initCounters()
  initStars()
})/*

/* ── 11. EXPORTS GLOBALES ────────────────────────────────────── */
/*window.GeoCore  = { DarkMode, Toast, Buscador, animateCounter }
window.Toast    = Toast
window.Auth     = Auth
window.ModalAuth = ModalAuth*/
import { Auth, ModalAuth } from './auth.js'

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init()   // ← esta línea es clave
  Auth.init()
  Buscador.init()
  ScrollReveal.init()
  PageProgress.init()
  BackTop.init()
  NavMobile.init()
  initCounters()
  initStars()

  const tema = localStorage.getItem('gp_theme')
  if (tema) document.documentElement.setAttribute('data-theme', tema)
})

window.Auth      = Auth
window.ModalAuth = ModalAuth