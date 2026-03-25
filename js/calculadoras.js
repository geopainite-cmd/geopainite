/* ═══════════════════════════════════════════════════════════════
   GeoPainite — Calculadoras Geológicas v3.1 (LIMPIO)
   Incluye: Granulometría, Buzamiento, Espesor, Densidad, Ley Mineral, Conversor
   + Botón flotante Tienda
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   WIDGET CALCULADORAS
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ══ CSS DEL WIDGET ══════════════════════════════════════════ */
  var CSS = [
    "#geo-widget-root{--gv:#7a1a2e;--gp:#4b2060;--gpm:#6d3190;--gd:#c9933a;--gc:#fdfbf8;--gg:#f4f1ee;--gt:#5a4f4a;--gm:#9a8f8a;--gok:#1a7a3a;--gwn:#c0392b;--tr:all .3s cubic-bezier(.4,0,.2,1);font-family:'DM Sans',sans-serif}",
    "[data-theme='dark'] #geo-widget-root{--gc:#1e1520;--gg:#2a1f30;--gt:#c8b8b0;--gm:#7a6a64}",

    /* FAB button */
    "#geo-fab{position:fixed;bottom:7.5rem;right:2rem;z-index:8100;width:56px;height:56px;border-radius:50%;background:linear-gradient(145deg,#7a1a2e,#4b2060);border:2px solid rgba(255,255,255,.15);color:#fff;cursor:pointer;font-size:1.4rem;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(90,20,40,.45);transition:var(--tr);outline:none}",
    "#geo-fab:hover{transform:scale(1.1) rotate(10deg)}",
    "#geo-fab::after{content:'Calculadoras';position:absolute;right:64px;background:rgba(20,8,30,.88);color:#fff;font-size:.68rem;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;transition:var(--tr)}",
    "#geo-fab:hover::after{opacity:1}",
    "#geo-fab::before{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid rgba(122,26,46,.4);animation:calc-pulse 2.4s ease-out infinite}",
    "@keyframes calc-pulse{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}",

    /* Panel */
    "#geo-panel{position:fixed;bottom:14rem;right:2rem;z-index:8099;width:420px;max-height:80vh;background:var(--gc);border-radius:22px;border:1.5px solid rgba(122,26,46,.12);box-shadow:0 24px 64px rgba(90,20,40,.2),inset 0 1px 0 rgba(255,255,255,.6);display:flex;flex-direction:column;overflow:hidden;transform:scale(.88) translateY(20px);opacity:0;pointer-events:none;transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .28s ease}",
    "#geo-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}",

    /* Head */
    ".gw-head{background:linear-gradient(135deg,#5c0a1c,#4b2060);padding:1rem 1.3rem;display:flex;align-items:center;gap:.8rem;flex-shrink:0}",
    ".gw-head-ico{font-size:1.4rem;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}",
    ".gw-head-txt h3{font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.1rem;font-weight:700;margin:0}",
    ".gw-head-txt p{color:rgba(255,255,255,.55);font-size:.68rem;margin:.1rem 0 0}",
    ".gw-close{margin-left:auto;background:rgba(255,255,255,.12);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:var(--tr);flex-shrink:0}",
    ".gw-close:hover{background:rgba(255,255,255,.25)}",

    /* Tabs */
    ".gw-tabs{display:flex;background:var(--gg);border-bottom:1px solid rgba(122,26,46,.08);flex-shrink:0;padding:.25rem .4rem 0;gap:.15rem;overflow-x:auto}",
    ".gw-tabs::-webkit-scrollbar{height:0}",
    ".gw-tab{flex-shrink:0;padding:.44rem .55rem .38rem;background:none;border:none;cursor:pointer;font-size:.65rem;font-weight:700;color:var(--gm);text-align:center;border-radius:8px 8px 0 0;border-bottom:2.5px solid transparent;transition:var(--tr);outline:none;line-height:1.3;white-space:nowrap}",
    ".gw-tab .ti{font-size:1rem;display:block;margin-bottom:.1rem}",
    ".gw-tab:hover{color:var(--gv)}",
    ".gw-tab.active{color:var(--gv);border-bottom-color:var(--gv);font-weight:800;background:rgba(122,26,46,.04)}",

    /* Body */
    ".gw-body{overflow-y:auto;padding:1.2rem;flex:1;scroll-behavior:smooth}",
    ".gw-body::-webkit-scrollbar{width:3px}",
    ".gw-body::-webkit-scrollbar-thumb{background:rgba(122,26,46,.2);border-radius:99px}",

    /* Content panels */
    ".gw-cp{display:none;animation:cpIn .25s ease}",
    ".gw-cp.active{display:block}",
    "@keyframes cpIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}",

    /* Note box */
    ".gw-note{background:linear-gradient(135deg,rgba(122,26,46,.06),rgba(75,32,96,.04));border-left:3px solid var(--gv);border-radius:0 8px 8px 0;padding:.55rem .85rem;margin-bottom:.9rem;font-size:.74rem;color:var(--gt);line-height:1.55}",
    ".gw-note strong{color:var(--gv)}",

    /* Form groups */
    ".gw-g{margin-bottom:.75rem}",
    ".gw-g label{display:block;font-size:.67rem;font-weight:800;color:var(--gv);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.28rem}",
    ".gw-g input,.gw-g select{width:100%;padding:.54rem .8rem;background:var(--gc);border:1.5px solid rgba(122,26,46,.13);border-radius:9px;font-size:.86rem;color:var(--gt);transition:var(--tr);outline:none;-webkit-appearance:none;appearance:none}",
    ".gw-g input:focus,.gw-g select:focus{border-color:var(--gv);box-shadow:0 0 0 3px rgba(122,26,46,.08)}",
    ".gw-g input::placeholder{color:#ccc}",
    ".gwr2{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}",
    ".gwr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.45rem}",

    /* Calc button */
    ".gw-btn{width:100%;padding:.65rem;margin-top:.2rem;background:linear-gradient(135deg,var(--gv),var(--gp));color:#fff;border:none;border-radius:11px;font-weight:800;font-size:.85rem;cursor:pointer;transition:var(--tr);outline:none;box-shadow:0 4px 14px rgba(122,26,46,.28)}",
    ".gw-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(122,26,46,.38)}",

    /* Error msg */
    ".gw-err{font-size:.73rem;font-weight:700;color:var(--gwn);margin:.3rem 0;display:none;padding:.32rem .65rem;background:rgba(192,57,43,.07);border-radius:7px;border-left:3px solid var(--gwn)}",
    ".gw-err.show{display:block}",

    /* Results */
    ".gw-res{margin-top:.85rem;background:var(--gc);border:1.5px solid rgba(122,26,46,.09);border-radius:13px;overflow:hidden;display:none;animation:cpIn .28s ease;box-shadow:0 4px 14px rgba(90,20,40,.06)}",
    ".gw-res.show{display:block}",
    ".res-head{background:linear-gradient(135deg,rgba(122,26,46,.06),rgba(75,32,96,.05));padding:.48rem .9rem;border-bottom:1px solid rgba(122,26,46,.07)}",
    ".res-head span{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--gv)}",
    ".res-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem .9rem;border-bottom:1px solid rgba(122,26,46,.05)}",
    ".res-row:last-child{border-bottom:none}",
    ".res-lbl{font-size:.77rem;color:var(--gm);font-weight:600}",
    ".res-val{font-weight:800;font-size:.9rem;color:var(--gv)}",
    ".res-val.ok{color:var(--gok)}",
    ".res-val.gold{color:var(--gd)}",
    ".res-val.purp{color:var(--gpm)}",
    ".res-chip{display:inline-flex;align-items:center;padding:.2rem .65rem;border-radius:20px;font-size:.72rem;font-weight:800}",
    ".chip-ok{background:rgba(26,122,58,.1);color:var(--gok)}",
    ".chip-warn{background:rgba(192,57,43,.1);color:var(--gwn)}",
    ".chip-gold{background:rgba(201,147,58,.1);color:var(--gd)}",

    /* Conversor */
    ".cv-live{background:linear-gradient(135deg,rgba(122,26,46,.05),rgba(75,32,96,.04));border:1.5px solid rgba(122,26,46,.09);border-radius:13px;padding:.9rem;text-align:center;margin-top:.7rem}",
    ".cv-from{font-size:.7rem;color:var(--gm);font-weight:600;margin-bottom:.25rem}",
    ".cv-arrow{font-size:1.1rem;color:var(--gv);margin:.2rem 0;display:block}",
    ".cv-to-val{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:700;color:var(--gv);line-height:1.1}",
    ".cv-to-unit{font-size:.75rem;color:var(--gm);font-weight:600;margin-top:.15rem}",

    /* Separator */
    ".gw-sep{height:1px;margin:.8rem 0;background:linear-gradient(90deg,transparent,rgba(122,26,46,.14),transparent)}",

    /* Responsive */
    "@media(max-width:460px){#geo-panel{width:calc(100vw - 1.5rem);right:.75rem}#geo-fab{right:1rem}}"
  ].join('\n');

  /* ══ HTML DEL WIDGET ═════════════════════════════════════════ */
  var HTML = '<div id="geo-widget-root">' +
  '<button id="geo-fab" aria-label="Calculadoras">🧮</button>' +
  '<div id="geo-panel" role="dialog">' +

    /* Header */
    '<div class="gw-head">' +
      '<div class="gw-head-ico">🧮</div>' +
      '<div class="gw-head-txt"><h3>Calculadoras Geológicas</h3><p>GeoPainite · Campo y Laboratorio</p></div>' +
      '<button class="gw-close" id="geo-close">✕</button>' +
    '</div>' +

    /* Tabs */
    '<div class="gw-tabs">' +
      '<button class="gw-tab active" data-gtab="granu"><span class="ti">📊</span>Granu.</button>' +
      '<button class="gw-tab" data-gtab="buz"><span class="ti">🧭</span>Rumbo</button>' +
      '<button class="gw-tab" data-gtab="esp"><span class="ti">📐</span>Espesor</button>' +
      '<button class="gw-tab" data-gtab="dens"><span class="ti">⚖️</span>Densidad</button>' +
      '<button class="gw-tab" data-gtab="ley"><span class="ti">💎</span>Ley</button>' +
      '<button class="gw-tab" data-gtab="conv"><span class="ti">🔄</span>Conversor</button>' +
    '</div>' +

    '<div class="gw-body">' +

      /* === GRANULOMETRÍA === */
      '<div class="gw-cp active" id="gtab-granu">' +
        '<div class="gw-note">Ingresa <strong>D10</strong>, <strong>D30</strong> y <strong>D60</strong> de la curva granulométrica (en <strong>mm</strong>).</div>' +
        '<div class="gwr3">' +
          '<div class="gw-g"><label>D₁₀ (mm)</label><input type="number" id="g-d10" placeholder="0.10" step="any" min="0.001"></div>' +
          '<div class="gw-g"><label>D₃₀ (mm)</label><input type="number" id="g-d30" placeholder="0.50" step="any" min="0.001"></div>' +
          '<div class="gw-g"><label>D₆₀ (mm)</label><input type="number" id="g-d60" placeholder="2.00" step="any" min="0.001"></div>' +
        '</div>' +
        '<p class="gw-err" id="g-err">⚠ Verifica: D₁₀ &lt; D₃₀ &lt; D₆₀ y todos &gt; 0</p>' +
        '<button class="gw-btn" id="btn-granu">✦ Calcular parámetros</button>' +
        '<div class="gw-res" id="g-res">' +
          '<div class="res-head"><span>📊 Resultados granulométricos</span></div>' +
          '<div class="res-row"><span class="res-lbl">Coef. Uniformidad (Cu)</span><span class="res-val" id="g-cu">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Coef. Curvatura (Cc)</span><span class="res-val" id="g-cc">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">D₅₀ estimado</span><span class="res-val gold" id="g-d50">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Símbolo USCS</span><span class="res-val purp" id="g-sym">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Descripción</span><span class="res-val" id="g-desc">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Graduación</span><span id="g-chip">—</span></div>' +
        '</div>' +
      '</div>' +

      /* === BUZAMIENTO === */
      '<div class="gw-cp" id="gtab-buz">' +
        '<div class="gw-note">Ingresa <strong>rumbo</strong> (0–360°) y <strong>buzamiento</strong> (0–90°) del plano.</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Rumbo (°)</label><input type="number" id="b-r" placeholder="045" min="0" max="360" step="0.1"></div>' +
          '<div class="gw-g"><label>Buzamiento (°)</label><input type="number" id="b-b" placeholder="60" min="0" max="90" step="0.1"></div>' +
        '</div>' +
        '<div class="gw-g"><label>Sentido de buzamiento</label>' +
          '<select id="b-sent">' +
            '<option>N</option><option>NE</option><option selected>E</option><option>SE</option>' +
            '<option>S</option><option>SW</option><option>W</option><option>NW</option>' +
          '</select>' +
        '</div>' +
        '<p class="gw-err" id="b-err">⚠ Rumbo 0–360°, buzamiento 0–90°</p>' +
        '<button class="gw-btn" id="btn-buz">✦ Calcular orientación</button>' +
        '<div class="gw-res" id="b-res">' +
          '<div class="res-head"><span>🧭 Datos del plano estructural</span></div>' +
          '<div class="res-row"><span class="res-lbl">Notación azimut</span><span class="res-val purp" id="b-az">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Notación cuadrante</span><span class="res-val" id="b-cuad">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Dir. máx. pendiente</span><span class="res-val gold" id="b-mp">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Polo (trend/plunge)</span><span class="res-val ok" id="b-polo">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Normal Nx / Ny / Nz</span><span class="res-val" id="b-n">—</span></div>' +
        '</div>' +
      '</div>' +

      /* === ESPESOR === */
      '<div class="gw-cp" id="gtab-esp">' +
        '<div class="gw-note">Fórmula: <strong>e = d × sen(δ)</strong> — espesor verdadero de capa.</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Distancia d (m)</label><input type="number" id="e-d" placeholder="50" min="0" step="any"></div>' +
          '<div class="gw-g"><label>Buzamiento δ (°)</label><input type="number" id="e-buz" placeholder="45" min="0" max="90" step="any"></div>' +
        '</div>' +
        '<div class="gw-sep"></div>' +
        '<div class="gw-note">Corrección topográfica (dejar en 0 si terreno es horizontal).</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Ángulo terreno α (°)</label><input type="number" id="e-a" placeholder="0" min="-90" max="90" step="any"></div>' +
          '<div class="gw-g"><label>Relación δ y α</label>' +
            '<select id="e-rel"><option value="mas">Mismo sentido (+)</option><option value="menos">Opuesto (−)</option></select>' +
          '</div>' +
        '</div>' +
        '<p class="gw-err" id="e-err">⚠ Verifica los valores ingresados</p>' +
        '<button class="gw-btn" id="btn-esp">✦ Calcular espesor</button>' +
        '<div class="gw-res" id="e-res">' +
          '<div class="res-head"><span>📐 Resultados de espesor</span></div>' +
          '<div class="res-row"><span class="res-lbl">Espesor verdadero</span><span class="res-val" id="e-sv">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Con corrección topo</span><span class="res-val ok" id="e-ct">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Diferencia</span><span class="res-val gold" id="e-df">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Ángulo efectivo (δ±α)</span><span class="res-val purp" id="e-ae">—</span></div>' +
        '</div>' +
      '</div>' +

      /* === DENSIDAD === */
      '<div class="gw-cp" id="gtab-dens">' +
        '<div class="gw-note">Cálculo de <strong>densidad aparente</strong>, <strong>porosidad</strong> y <strong>relación de vacíos</strong>.</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Masa total (g)</label><input type="number" id="d-ms" placeholder="185" step="any" min="0"></div>' +
          '<div class="gw-g"><label>Volumen total (cm³)</label><input type="number" id="d-vt" placeholder="100" step="any" min="0"></div>' +
        '</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Volumen sólidos (cm³)</label><input type="number" id="d-vs" placeholder="60" step="any" min="0"></div>' +
          '<div class="gw-g"><label>Densidad sólidos (g/cm³)</label><input type="number" id="d-ds" placeholder="2.65" step="any" min="0"></div>' +
        '</div>' +
        '<p class="gw-err" id="d-err">⚠ Verifica: todos los valores deben ser positivos</p>' +
        '<button class="gw-btn" id="btn-dens">✦ Calcular propiedades</button>' +
        '<div class="gw-res" id="d-res">' +
          '<div class="res-head"><span>⚖️ Propiedades físicas</span></div>' +
          '<div class="res-row"><span class="res-lbl">Densidad aparente ρ (g/cm³)</span><span class="res-val" id="d-rho">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Porosidad n (%)</span><span class="res-val ok" id="d-n">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Relación de vacíos e</span><span class="res-val gold" id="d-e">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Saturación Sr (%)</span><span class="res-val purp" id="d-sr">—</span></div>' +
        '</div>' +
      '</div>' +

      /* === LEY MINERAL === */
      '<div class="gw-cp" id="gtab-ley">' +
        '<div class="gw-note">Conversión de <strong>ley mineral</strong> y estimación de <strong>metal contenido</strong>.</div>' +
        '<div class="gwr2">' +
          '<div class="gw-g"><label>Ley (g/t = ppm)</label><input type="number" id="l-ley" placeholder="5.5" step="any" min="0"></div>' +
          '<div class="gw-g"><label>Tonelaje (t)</label><input type="number" id="l-ton" placeholder="10000" step="any" min="0"></div>' +
        '</div>' +
        '<div class="gw-g"><label>Precio metal (USD/oz troy)</label><input type="number" id="l-precio" placeholder="1950" step="any" min="0"></div>' +
        '<p class="gw-err" id="l-err">⚠ Ingresa ley y tonelaje válidos</p>' +
        '<button class="gw-btn" id="btn-ley">✦ Calcular ley</button>' +
        '<div class="gw-res" id="l-res">' +
          '<div class="res-head"><span>💎 Resultados de ley mineral</span></div>' +
          '<div class="res-row"><span class="res-lbl">Ley en ppm (g/t)</span><span class="res-val" id="l-ppm">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Ley en oz/t (troy)</span><span class="res-val purp" id="l-ozt">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Ley en %</span><span class="res-val" id="l-pct">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Metal contenido (kg)</span><span class="res-val ok" id="l-kg">—</span></div>' +
          '<div class="res-row"><span class="res-lbl">Valor bruto (USD)</span><span class="res-val gold" id="l-usd">—</span></div>' +
        '</div>' +
      '</div>' +

      /* === CONVERSOR === */
      '<div class="gw-cp" id="gtab-conv">' +
        '<div class="gw-g"><label>Tipo de conversión</label>' +
          '<select id="cv-tipo">' +
            '<optgroup label="📏 Longitud">' +
              '<option value="m_ft">Metros → Pies</option>' +
              '<option value="ft_m">Pies → Metros</option>' +
              '<option value="km_mi">Kilómetros → Millas</option>' +
              '<option value="mi_km">Millas → Kilómetros</option>' +
            '</optgroup>' +
            '<optgroup label="📐 Área">' +
              '<option value="km2_ha">km² → Hectáreas</option>' +
              '<option value="ha_km2">Hectáreas → km²</option>' +
              '<option value="km2_ac">km² → Acres</option>' +
            '</optgroup>' +
            '<optgroup label="💎 Ley mineral">' +
              '<option value="ppm_pct">ppm → %</option>' +
              '<option value="pct_ppm">% → ppm</option>' +
              '<option value="gt_ozt">g/t → oz/t (troy)</option>' +
              '<option value="ozt_gt">oz/t → g/t</option>' +
            '</optgroup>' +
            '<optgroup label="🌡️ Temperatura">' +
              '<option value="c_f">°C → °F</option>' +
              '<option value="f_c">°F → °C</option>' +
            '</optgroup>' +
            '<optgroup label="📍 Coordenadas">' +
              '<option value="dec_dms">Decimal → Grados° Min\' Seg"</option>' +
              '<option value="dms_dec">Grados° Min\' Seg" → Decimal</option>' +
            '</optgroup>' +
          '</select>' +
        '</div>' +

        '<div id="cv-normal">' +
          '<div class="gw-g"><label id="cv-lbl">Valor a convertir</label>' +
            '<input type="number" id="cv-v" placeholder="Ingresa el valor" step="any">' +
          '</div>' +
        '</div>' +

        '<div id="cv-dms" style="display:none">' +
          '<div class="gwr3">' +
            '<div class="gw-g"><label>Grados °</label><input type="number" id="cv-deg" placeholder="12"></div>' +
            '<div class="gw-g"><label>Minutos \'</label><input type="number" id="cv-min" placeholder="30"></div>' +
            '<div class="gw-g"><label>Segundos "</label><input type="number" id="cv-sec" placeholder="15" step="any"></div>' +
          '</div>' +
        '</div>' +

        '<div class="cv-live">' +
          '<div class="cv-from" id="cv-from">Ingresa un valor para ver el resultado</div>' +
          '<span class="cv-arrow">↓</span>' +
          '<div class="cv-to-val" id="cv-out">—</div>' +
          '<div class="cv-to-unit" id="cv-unit"></div>' +
        '</div>' +
      '</div>' +

    '</div>' + /* /gw-body */
  '</div>' +   /* /geo-panel */
  '</div>';    /* /geo-widget-root */

  /* ══ INYECTAR EN EL DOM ═════════════════════════════════════ */
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  var wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  document.body.appendChild(wrapper);

  /* ══ CONTROLES UI ═══════════════════════════════════════════ */
  var fab   = document.getElementById('geo-fab');
  var panel = document.getElementById('geo-panel');
  var closeBtn = document.getElementById('geo-close');

  fab.addEventListener('click', function() { panel.classList.toggle('open'); });
  closeBtn.addEventListener('click', function() { panel.classList.remove('open'); });
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== fab) {
      panel.classList.remove('open');
    }
  });

  /* Tabs */
  document.querySelectorAll('.gw-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.gw-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.gw-cp').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('gtab-' + tab.getAttribute('data-gtab'));
      if (target) target.classList.add('active');
    });
  });

  /* Conversor: escuchar cambios */
  var cvTipo = document.getElementById('cv-tipo');
  var cvV    = document.getElementById('cv-v');
  var cvDeg  = document.getElementById('cv-deg');
  var cvMin  = document.getElementById('cv-min');
  var cvSec  = document.getElementById('cv-sec');

  if (cvTipo) cvTipo.addEventListener('change', function() { window.GeoCalc.cvUpdate(); });
  if (cvV)    cvV.addEventListener('input',     function() { window.GeoCalc.cvCalc(); });
  if (cvDeg)  cvDeg.addEventListener('input',   function() { window.GeoCalc.cvCalc(); });
  if (cvMin)  cvMin.addEventListener('input',   function() { window.GeoCalc.cvCalc(); });
  if (cvSec)  cvSec.addEventListener('input',   function() { window.GeoCalc.cvCalc(); });

  /* Botones calcular */
  document.getElementById('btn-granu').addEventListener('click', function() { window.GeoCalc.granulo(); });
  document.getElementById('btn-buz').addEventListener('click',   function() { window.GeoCalc.buzamiento(); });
  document.getElementById('btn-esp').addEventListener('click',   function() { window.GeoCalc.espesor(); });
  document.getElementById('btn-dens').addEventListener('click',  function() { window.GeoCalc.densidad(); });
  document.getElementById('btn-ley').addEventListener('click',   function() { window.GeoCalc.leyMineral(); });

  /* ══ FUNCIONES DE CÁLCULO ═══════════════════════════════════ */
  function val(id) { return parseFloat(document.getElementById(id).value) || 0; }
  function setVal(id, text) { var el = document.getElementById(id); if(el) el.textContent = text; }
  function showRes(resId) { document.getElementById(resId).classList.add('show'); }
  function hideRes(resId) { document.getElementById(resId).classList.remove('show'); }
  function showErr(errId) { document.getElementById(errId).classList.add('show'); }
  function hideErr(errId) { document.getElementById(errId).classList.remove('show'); }

  window.GeoCalc = {

    /* ── Granulometría ─────────────────────────────────────── */
    granulo: function() {
      var d10 = val('g-d10'), d30 = val('g-d30'), d60 = val('g-d60');
      if (!d10 || !d30 || !d60 || d10 <= 0 || d10 >= d30 || d30 >= d60) {
        showErr('g-err'); hideRes('g-res'); return;
      }
      hideErr('g-err');
      var Cu  = d60 / d10;
      var Cc  = (d30 * d30) / (d10 * d60);
      var d50 = Math.sqrt(d30 * d60);
      var sym, desc, chip, chipClass;

      if (d60 >= 4.75) {
        if (Cu >= 4 && Cc >= 1 && Cc <= 3) { sym='GW'; desc='Grava bien graduada';  chip='Bien graduada ✓'; chipClass='chip-ok'; }
        else                                { sym='GP'; desc='Grava mal graduada';   chip='Mal graduada';    chipClass='chip-warn'; }
      } else if (d60 < 0.075) {
        sym='ML'; desc='Material fino'; chip='Fino'; chipClass='chip-gold';
      } else {
        if (Cu >= 6 && Cc >= 1 && Cc <= 3) { sym='SW'; desc='Arena bien graduada'; chip='Bien graduada ✓'; chipClass='chip-ok'; }
        else                                { sym='SP'; desc='Arena mal graduada';  chip='Mal graduada';    chipClass='chip-warn'; }
      }

      setVal('g-cu',   Cu.toFixed(2));
      setVal('g-cc',   Cc.toFixed(3));
      setVal('g-d50',  d50.toFixed(3) + ' mm');
      setVal('g-sym',  sym);
      setVal('g-desc', desc);
      document.getElementById('g-chip').innerHTML = '<span class="res-chip ' + chipClass + '">' + chip + '</span>';
      showRes('g-res');
    },

    /* ── Buzamiento y Rumbo ────────────────────────────────── */
    buzamiento: function() {
      var rumbo = val('b-r'), buz = val('b-b');
      var sent  = document.getElementById('b-sent').value;
      if (isNaN(rumbo) || isNaN(buz) || rumbo < 0 || rumbo > 360 || buz < 0 || buz > 90) {
        showErr('b-err'); hideRes('b-res'); return;
      }
      hideErr('b-err');
      var rRad = rumbo * Math.PI / 180;
      var dRad = buz   * Math.PI / 180;
      var r = rumbo % 360, q = '';
      if (r === 0 || r === 360)        q = 'N';
      else if (r > 0   && r < 90)      q = 'N' + r.toFixed(0) + '°E';
      else if (r === 90)               q = 'E';
      else if (r > 90  && r < 180)     q = 'S' + (180 - r).toFixed(0) + '°E';
      else if (r === 180)              q = 'S';
      else if (r > 180 && r < 270)     q = 'S' + (r - 180).toFixed(0) + '°W';
      else if (r === 270)              q = 'W';
      else                             q = 'N' + (360 - r).toFixed(0) + '°W';

      var maxPend = (rumbo + 90) % 360;
      var nx =  Math.sin(rRad) * Math.cos(dRad);
      var ny =  Math.cos(rRad) * Math.cos(dRad);
      var nz = -Math.sin(dRad);
      var trend  = (rumbo + 180) % 360;
      var plunge = 90 - buz;

      setVal('b-az',   rumbo.toFixed(1) + '° / ' + buz.toFixed(1) + '° ' + sent);
      setVal('b-cuad', q + ' / ' + buz.toFixed(1) + '° ' + sent);
      setVal('b-mp',   maxPend.toFixed(0) + '° hacia ' + sent);
      setVal('b-polo', trend.toFixed(0) + '° / ' + plunge.toFixed(1) + '°');
      setVal('b-n',    nx.toFixed(3) + ' / ' + ny.toFixed(3) + ' / ' + nz.toFixed(3));
      showRes('b-res');
    },

    /* ── Espesor de Capa ───────────────────────────────────── */
    espesor: function() {
      var dist = val('e-d'), buz = val('e-buz');
      var topo = parseFloat(document.getElementById('e-a').value) || 0;
      var rel  = document.getElementById('e-rel').value;
      if (!dist || dist <= 0 || buz < 0 || buz > 90) {
        showErr('e-err'); hideRes('e-res'); return;
      }
      hideErr('e-err');
      var eSimple = dist * Math.sin(buz * Math.PI / 180);
      var angEfect = rel === 'mas' ? buz + topo : buz - topo;
      var eTopo   = Math.abs(dist * Math.sin(angEfect * Math.PI / 180));
      var diff    = Math.abs(eTopo - eSimple);

      setVal('e-sv', eSimple.toFixed(3) + ' m');
      setVal('e-ct', eTopo.toFixed(3) + ' m');
      setVal('e-df', diff.toFixed(3) + ' m');
      setVal('e-ae', angEfect.toFixed(1) + '°');
      showRes('e-res');
    },

    /* ── Densidad y Porosidad ──────────────────────────────── */
    densidad: function() {
      var ms = val('d-ms'), vt = val('d-vt');
      var vs = val('d-vs'), ds = val('d-ds');
      if (!ms || !vt || vt <= 0 || vs < 0 || vs > vt) {
        showErr('d-err'); hideRes('d-res'); return;
      }
      hideErr('d-err');
      var rho = ms / vt;
      var vv  = vt - vs;
      var n   = (vv / vt) * 100;
      var e   = vs > 0 ? vv / vs : 0;
      var mAgua = ms - (ds > 0 ? vs * ds : 0);
      var Sr  = vv > 0 && mAgua > 0 ? Math.min((mAgua / vv) * 100, 100) : 0;

      setVal('d-rho', rho.toFixed(3) + ' g/cm³');
      setVal('d-n',   n.toFixed(2) + ' %');
      setVal('d-e',   e.toFixed(4));
      setVal('d-sr',  Sr.toFixed(2) + ' %');
      showRes('d-res');
    },

    /* ── Ley Mineral ───────────────────────────────────────── */
    leyMineral: function() {
      var ley    = val('l-ley');
      var ton    = val('l-ton');
      var precio = val('l-precio');
      if (!ley || ley <= 0 || !ton || ton <= 0) {
        showErr('l-err'); hideRes('l-res'); return;
      }
      hideErr('l-err');
      var ppm  = ley;
      var pct  = ppm / 10000;
      var ozt  = ppm / 31.1035;
      var kg   = (ppm / 1000000) * ton * 1000;
      var usd  = precio > 0 ? kg * 32.1507 * precio / 1000 : 0;

      setVal('l-ppm', ppm.toFixed(2) + ' g/t');
      setVal('l-ozt', ozt.toFixed(4) + ' oz/t');
      setVal('l-pct', pct.toFixed(6) + ' %');
      setVal('l-kg',  kg.toFixed(2) + ' kg');
      setVal('l-usd', precio > 0 ? '$ ' + usd.toFixed(2) : 'Ingresa precio');
      showRes('l-res');
    },

    /* ── Conversor ─────────────────────────────────────────── */
    cvUpdate: function() {
      var tipo = document.getElementById('cv-tipo').value;
      var isDMS = tipo === 'dms_dec';
      document.getElementById('cv-normal').style.display = isDMS ? 'none' : 'block';
      document.getElementById('cv-dms').style.display    = isDMS ? 'block' : 'none';
      setVal('cv-out', '—');
      setVal('cv-unit', '');
      this.cvCalc();
    },

    cvCalc: function() {
      var tipo   = document.getElementById('cv-tipo').value;
      var outEl  = document.getElementById('cv-out');
      var unitEl = document.getElementById('cv-unit');
      var fromEl = document.getElementById('cv-from');
      if (!outEl || !unitEl || !fromEl) return;

      if (tipo === 'dms_dec') {
        var dg = parseFloat(document.getElementById('cv-deg').value) || 0;
        var mn = parseFloat(document.getElementById('cv-min').value) || 0;
        var sc = parseFloat(document.getElementById('cv-sec').value) || 0;
        var dec = dg + mn / 60 + sc / 3600;
        outEl.textContent  = dec.toFixed(6);
        unitEl.textContent = 'grados decimales';
        fromEl.textContent = dg + '\u00b0 ' + mn + '\' ' + sc + '"';
        return;
      }

      var vStr = document.getElementById('cv-v').value;
      if (!vStr || vStr === '') { outEl.textContent = '—'; unitEl.textContent = ''; return; }
      var v = parseFloat(vStr);
      if (isNaN(v)) { outEl.textContent = '—'; return; }

      var map = {
        m_ft:    function(x) { return [x * 3.28084,   'pies',         'metros']; },
        ft_m:    function(x) { return [x / 3.28084,   'metros',       'pies']; },
        km_mi:   function(x) { return [x * 0.621371,  'millas',       'km']; },
        mi_km:   function(x) { return [x / 0.621371,  'km',           'millas']; },
        km2_ha:  function(x) { return [x * 100,       'hectáreas',    'km²']; },
        ha_km2:  function(x) { return [x / 100,       'km²',          'hectáreas']; },
        km2_ac:  function(x) { return [x * 247.105,   'acres',        'km²']; },
        ppm_pct: function(x) { return [x / 10000,     '%',            'ppm']; },
        pct_ppm: function(x) { return [x * 10000,     'ppm',          '%']; },
        gt_ozt:  function(x) { return [x / 31.1035,   'oz/t (troy)',  'g/t']; },
        ozt_gt:  function(x) { return [x * 31.1035,   'g/t',          'oz/t']; },
        c_f:     function(x) { return [x * 9/5 + 32,  '\u00b0F',      '\u00b0C']; },
        f_c:     function(x) { return [(x-32)*5/9,    '\u00b0C',      '\u00b0F']; },
        dec_dms: function(x) {
          var d = Math.floor(x), mF = (x - d) * 60, m = Math.floor(mF), s = ((mF - m) * 60).toFixed(2);
          return [d + '\u00b0 ' + m + '\' ' + s + '"', '', 'grados decimales'];
        }
      };

      var fn = map[tipo];
      if (!fn) return;
      var result = fn(v);
      var res = result[0], unit = result[1], fromUnit = result[2];

      outEl.textContent  = (typeof res === 'string') ? res : parseFloat(res.toFixed(6)).toString();
      unitEl.textContent = unit;
      fromEl.textContent = v + ' ' + fromUnit;
    }
  };

  /* Inicializar conversor */
  window.GeoCalc.cvUpdate();

})();


/* ─────────────────────────────────────────────────────────────
   BOTÓN FLOTANTE TIENDA
   Aparece en todas las páginas EXCEPTO tienda.html
───────────────────────────────────────────────────────────── */
(function () {
  if (window.location.pathname.includes('tienda')) return;

  var shopCSS = [
    '#shop-fab{position:fixed;bottom:2rem;left:2rem;z-index:8100;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;text-decoration:none}',
    '#shop-fab .sfb-circle{width:54px;height:54px;border-radius:50%;background:linear-gradient(145deg,#c9933a,#a0732b);border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 8px 24px rgba(201,147,58,.42);transition:all .32s cubic-bezier(.4,0,.2,1);position:relative}',
    '#shop-fab:hover .sfb-circle{transform:scale(1.1) translateY(-3px);box-shadow:0 14px 32px rgba(201,147,58,.55)}',
    '#shop-fab .sfb-label{background:rgba(20,8,30,.82);color:#fff;font-size:.67rem;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:3px 10px;border-radius:20px;white-space:nowrap;opacity:0;transform:translateY(4px);transition:all .28s ease}',
    '#shop-fab:hover .sfb-label{opacity:1;transform:translateY(0)}',
    '#shop-fab .sfb-circle::before{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid rgba(201,147,58,.35);animation:shopPulse 2.8s ease-out infinite}',
    '@keyframes shopPulse{0%{transform:scale(1);opacity:.8}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}',
    '#shop-fab .sfb-badge{position:absolute;top:-4px;right:-4px;background:linear-gradient(135deg,#c0392b,#922b21);color:#fff;font-size:.55rem;font-weight:900;padding:2px 6px;border-radius:10px;border:2px solid #fff;letter-spacing:.4px;animation:ofertaBlink 2s ease-in-out infinite}',
    '@keyframes ofertaBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.08)}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = shopCSS;
  document.head.appendChild(styleEl);

  var btn = document.createElement('a');
  btn.id   = 'shop-fab';
  btn.href  = 'tienda.html';
  btn.title = 'Ir a la Tienda de Minerales';
  btn.innerHTML = '<div class="sfb-circle">🛒<span class="sfb-badge">OFERTA</span></div><span class="sfb-label">Tienda</span>';
  document.body.appendChild(btn);

})();