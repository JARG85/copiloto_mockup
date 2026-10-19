/* Vistas de Señales de churn (alertas), Next best action y Setup que se
   abren como MODALES desde la Vista 360 (antes eran páginas propias:
   Alertas.dc.html, SiguienteAccion.dc.html y Setup.dc.html).

   Cada vista guarda su estado dentro del estado del Component de la
   Vista 360 (host.state[key]) y expone renderVals() con los valores que
   usa su bloque en pages/Vista360.dc.html. Uso:
     const v = new AlianzaVistas.Alertas(this, 'alv');
     this.state.alv = v.initial(clienteId);
     ... v.renderVals() ... */
window.AlianzaVistas = (function () {

class Base {
  constructor(host, key) { this.host = host; this.key = key; }
  get state() { return this.host.state[this.key] || {}; }
  setState(partial) { this.host.setState({ [this.key]: { ...this.state, ...partial } }); }
}

// ── Señales de churn (Alertas de riesgo de fuga) ─────────────────────
const Alertas = (function () {
const P = window.Portafolio, UI = window.AlianzaUI, F = id => window.AlianzaFlags.get(id);
// Texto dentro de <text>/<title> SVG: un <tspan> sí se muestra (el runtime usa <span>).
const svgText = v => window.React.createElement('tspan', null, String(v));

// Agrupa los factores explicativos en motivos. TODO: confirmar con el área comercial.
const MOTIVOS = [
  { name: 'Retiros recientes', re: /retiro/i },
  { name: 'Falta de contacto o respuesta', re: /contacto|respuesta|recordatorio/i },
  { name: 'Rentabilidad bajo referencia o reclamos', re: /rentabilidad|reclam/i },
  { name: 'Cotización con otras entidades', re: /cotiz|tasas/i },
  { name: 'Vencimientos próximos', re: /vence/i },
  { name: 'Saldo en caída', re: /saldo/i },
  { name: 'Perfil o datos desactualizados', re: /perfil|estados financieros/i }
];

class Alertas extends Base {
  initial(clienteId) {
    const all = P.clientes().slice().sort((a, b) => b.riesgo.d60 - a.riesgo.d60);
    return { sel: all.some(c => c.id === clienteId) ? clienteId : all[0].id, f: 'alto' };
  }

  arc(a0, a1) {
    const cx = 110, cy = 110, r = 90;
    const p = a => [cx - r * Math.cos(a * Math.PI), cy - r * Math.sin(a * Math.PI)];
    const s = p(a0), e = p(a1);
    return 'M ' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A 90 90 0 0 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
  }
  gauge(v, horizonte) {
    const g = v / 100, n = P.nivel(v);
    return {
      v: String(v), label: horizonte + ' · ' + n.label, horizonte,
      aria: 'Riesgo de fuga ' + v + ' sobre 100 a ' + horizonte,
      low: this.arc(0, 0.40), mid: this.arc(0.40, 0.65), high: this.arc(0.65, 1),
      nx: (110 - 70 * Math.cos(g * Math.PI)).toFixed(1), ny: (110 - 70 * Math.sin(g * Math.PI)).toFixed(1),
      valStyle: 'font-size: 30px; font-weight: 800; color: ' + n.fg, chip: UI.chip(n.bg, n.fg)
    };
  }

  renderVals() {
    const st = this.state, D = window.CopilotoData;
    const all = P.clientes().slice().sort((a, b) => b.riesgo.d60 - a.riesgo.d60);
    const c = P.cliente(st.sel);
    const fSen = F('alertasSenales'), fMapa = F('alertasMapa'), nbaOn = F('modNBA');

    // KPIs
    const altos = all.filter(x => x.riesgo.d60 >= 65);
    const senales = D.senales.map(s => ({ ...s, clientes: all.filter(x => s.prueba(x)) }));
    const kpi = {
      enRiesgo: P.money(P.sum(altos, 'saldo')), enRiesgoSub: altos.length + ' clientes con riesgo alto a 60 días',
      altos: String(altos.length), medios: String(all.filter(x => x.riesgo.d60 >= 40 && x.riesgo.d60 < 65).length),
      senales: String(senales[0].clientes.length), senalesSub: 'retiro 30–50 % sin contacto en 30 días',
      sinContacto: String(all.filter(x => x.diasSinContacto >= 30).length)
    };

    // Termómetro del cliente seleccionado
    const maxAbs = Math.max(20, ...c.riesgo.factores.map(f => Math.abs(f[1])));
    const termo = {
      nombre: c.nombre, sub: c.segmento + ' · perfil ' + c.perfil + ' · saldo ' + P.money(c.saldo),
      g30: this.gauge(c.riesgo.d30, '30 días'), g60: this.gauge(c.riesgo.d60, '60 días'),
      enRiesgo: P.money(c.riesgo.enRiesgo || c.saldo * c.riesgo.d60 / 100),
      href: 'Vista360.dc.html?cliente=' + c.id, hrefLabel: 'Abrir Vista 360 de ' + c.nombre,
      factores: c.riesgo.factores.map(f => ({ name: f[0], val: (f[1] > 0 ? '+' : '−') + Math.abs(f[1]),
        valStyle: 'text-align: right; font-size: 13.5px; font-weight: 700; color: ' + (f[1] > 0 ? '#9A1F24' : '#00664F'),
        bar: 'position: absolute; top: 0; bottom: 0; border-radius: 5px; ' + (f[1] > 0 ? 'left: 50%; width: ' + (f[1] / maxAbs * 50) + '%; background: #B3272D' : 'right: 50%; width: ' + (-f[1] / maxAbs * 50) + '%; background: #00A98E') }))
    };
    const opts = all.map(x => ({ id: x.id, label: x.nombre + ' · ' + x.riesgo.d60 + ' (' + x.nivel.label + ')' }));

    // Señales anticipadas
    const senalesV = senales.map((s, i) => ({
      nombre: s.nombre, regla: s.regla, n: s.clientes.length + (s.clientes.length === 1 ? ' cliente' : ' clientes'),
      anticipa: i === 0, none: s.clientes.length === 0,
      tagStyle: UI.chip(i === 0 ? '#FDE8E6' : '#E3F1FB', i === 0 ? '#9A1F24' : '#004E8C'), tag: i === 0 ? 'Señal anticipada' : 'Seguimiento',
      clientes: s.clientes.map(x => ({ nombre: x.nombre, pick: () => this.setState({ sel: x.id }), style: UI.pill(x.id === st.sel) + '; font-size: 12.5px' }))
    }));

    // Mapa de prioridad (riesgo a 60 días vs. saldo) — solo clientes reales de la cartera
    const maxS = Math.max(...all.map(x => x.saldo)) * 1.1;
    const X = s => 60 + s / 100 * 564, Y = a => 296 - a / maxS * 280;
    const dots = all.map(x => ({ x: X(x.riesgo.d60).toFixed(1), y: Y(x.saldo).toFixed(1), r: (6 + x.saldo / 700).toFixed(1), c: x.nivel.color,
      title: svgText(x.nombre + ' · riesgo ' + x.riesgo.d60 + ' · ' + P.money(x.saldo)) }));
    const me = { x: X(c.riesgo.d60).toFixed(1), y: Y(c.saldo).toFixed(1), tx: (X(c.riesgo.d60) - 16).toFixed(1), ty: (Y(c.saldo) + 4).toFixed(1), label: svgText(c.iniciales) };
    const yTicks = [0, 0.5, 1].map(k => ({ y: Y(maxS * k).toFixed(1), ty: (Y(maxS * k) + 4).toFixed(1), label: svgText(P.money(Math.round(maxS * k / 100) * 100)) }));
    const enRiesgoMedio = all.filter(x => x.riesgo.d60 >= 40);
    const motivos = MOTIVOS.map(m => ({ name: m.name, n: enRiesgoMedio.filter(x => x.riesgo.factores.some(f => f[1] > 0 && m.re.test(f[0]))).length }))
      .filter(m => m.n > 0).sort((a, b) => b.n - a.n);
    const maxM = Math.max(1, ...motivos.map(m => m.n));
    motivos.forEach(m => { m.bar = 'height: 100%; border-radius: 4px; background: #0072CE; width: ' + (m.n / maxM * 100) + '%'; });

    // Clientes priorizados
    const keep = x => st.f === 'all' ? true : st.f === 'alto' ? x.riesgo.d60 >= 65 : st.f === 'medio' ? (x.riesgo.d60 >= 40 && x.riesgo.d60 < 65) : !x.alineado;
    const rows = all.filter(keep).sort((a, b) => b.riesgo.d60 * b.saldo - a.riesgo.d60 * a.saldo).map(x => ({
      nombre: x.nombre, sub: x.segmento + ' · perfil ' + x.perfil, saldo: P.money(x.saldo),
      c30: x.riesgo.d30 + ' · ' + P.nivel(x.riesgo.d30).label, s30: UI.riesgoChip(x.riesgo.d30),
      c60: x.riesgo.d60 + ' · ' + x.nivel.label, s60: UI.riesgoChip(x.riesgo.d60),
      factor: (x.riesgo.factores.find(f => f[1] > 0) || ['Sin señales relevantes'])[0],
      accion: x.nba[0] ? x.nba[0].titulo : '—',
      ver: () => { this.setState({ sel: x.id }); const m = document.getElementById('modal-alertas'); if (m) m.scrollTo({ top: 0, behavior: 'smooth' }); },
      verAria: 'Ver termómetro de ' + x.nombre,
      href: 'Vista360.dc.html?cliente=' + x.id, hrefAria: 'Abrir Vista 360 de ' + x.nombre
    }));
    const filters = [{ id: 'alto', label: 'Riesgo alto' }, { id: 'medio', label: 'Riesgo medio' }, { id: 'off', label: 'Fuera de perfil' }, { id: 'all', label: 'Todos' }]
      .map(d => ({ label: d.label, pressed: d.id === st.f ? 'true' : 'false', style: UI.pill(d.id === st.f), pick: () => this.setState({ f: d.id }) }));

    return {
      fSen, fMapa, nbaOn, kpi, termo, opts, sel: st.sel, pickSel: e => this.setState({ sel: e.target.value }),
      senales: senalesV, dots, me, yTicks, motivos, rows, filters, empty: rows.length === 0
    };
  }
}
  return Alertas;
})();

// ── Next best action (Siguiente mejor acción) ───────────────────────────
const SiguienteAccion = (function () {
const P = window.Portafolio, UI = window.AlianzaUI, F = id => window.AlianzaFlags.get(id);
const PRIORIDAD = { 'Retención': 0, 'Idoneidad': 1, 'Profundización': 2 };
const TAG_COLOR = { 'Retención': ['#FDE8E6', '#9A1F24'], 'Idoneidad': ['#FFF4DE', '#8A5300'], 'Profundización': ['#E3F1FB', '#004E8C'] };
// Vehículos sugeridos por clase de riesgo. TODO: confirmar con Alianza.
const VEHICULO = { conservador: 'FIC Alianza 1 o encargo fiduciario', moderado: 'FIC Alianza 2 (renta fija)', mayor: 'Renta variable o FIC Alianza 3' };

class SiguienteAccion extends Base {
  // Las decisiones (aceptar / descartar) viven en host.state.dec: son las
  // mismas de la pestaña "Next best action" de la Vista 360.
  initial(clienteId) {
    const ids = this.ordenados().map(c => c.id);
    return { sel: ids.includes(clienteId) ? clienteId : ids[0] };
  }

  ordenados() {
    return P.clientes().slice().sort((a, b) => (PRIORIDAD[a.nba[0].tag] - PRIORIDAD[b.nba[0].tag]) || (b.nba[0].confianza - a.nba[0].confianza));
  }

  // Mezcla objetivo: cada clase llevada a su rango y el residuo repartido
  // primero en moderado y luego en conservador, sin salir de los rangos.
  recomendacion(c) {
    const al = c.alineacion, clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const t = {};
    al.forEach(a => { t[a.id] = clamp(a.actual, a.lo, a.hi); });
    ['moderado', 'conservador', 'mayor'].forEach(id => {
      const a = al.find(x => x.id === id), res = 100 - al.reduce((s, x) => s + t[x.id], 0);
      t[id] = clamp(t[id] + res, a.lo, a.hi);
    });
    return al.map(a => {
      const mov = (t[a.id] - a.actual) / 100 * c.saldo;
      return {
        nombre: a.nombre, actual: P.pct(a.actual), rango: a.lo + '–' + a.hi + ' %', objetivo: P.pct(t[a.id]),
        mov: Math.abs(mov) < 0.5 ? 'Sin cambio' : (mov > 0 ? 'Aumentar ' : 'Reducir ') + P.money(Math.abs(mov)),
        movStyle: 'font-size: 13px; font-weight: 700; white-space: nowrap; color: ' + (Math.abs(mov) < 0.5 ? '#4F5D6B' : mov > 0 ? '#00664F' : '#9A1F24'),
        vehiculo: mov > 0.5 ? VEHICULO[a.id] : '—'
      };
    });
  }

  renderVals() {
    const st = this.state;
    const list = this.ordenados();
    const c = P.cliente(st.sel);
    const decided = (cid, nid) => (this.host.state.dec || {})[cid + ':' + nid];

    const items = list.map(x => {
      const n = x.nba[0], on = x.id === st.sel, d = decided(x.id, n.id), col = TAG_COLOR[n.tag];
      const pend = x.nba.filter(a => !decided(x.id, a.id)).length;
      return {
        nombre: x.nombre, accion: n.titulo, tag: n.tag, tagStyle: UI.chip(col[0], col[1], 'font-size: 11px; padding: 2px 7px'),
        conf: 'Confianza ' + n.confianza + ' %', estado: pend ? pend + (pend === 1 ? ' pendiente' : ' pendientes') : 'Revisadas',
        estadoStyle: 'font-size: 11.5px; font-weight: 700; color: ' + (pend ? '#8A5300' : '#00664F'),
        pressed: on ? 'true' : 'false', pick: () => this.setState({ sel: x.id }),
        style: 'flex: none; display: flex; flex-direction: column; gap: 4px; width: 100%; min-height: 48px; padding: 10px 12px; box-sizing: border-box; border-radius: 12px; font-family: inherit; text-align: left; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : 'border: 1px solid #E6EBF1; background: #FFFFFF')
      };
    });

    let done = 0;
    const nba = c.nba.map((n, i) => {
      const s = decided(c.id, n.id); if (s) done++;
      const col = TAG_COLOR[n.tag];
      return { ...n, rank: i + 1, pending: !s, decided: !!s, conf: n.confianza + ' %',
        status: s === 'ok' ? 'Aceptada · registrada en bitácora' : 'Descartada · motivo registrado',
        statusStyle: 'font-size: 13px; font-weight: 700; padding: 8px 12px; border-radius: 8px; ' + (s === 'ok' ? 'background: #E1F5EF; color: #00664F' : 'background: #F2F5F9; color: #4F5D6B'),
        card: 'border: 1px solid ' + (s ? '#E6EBF1' : '#D5DDE6') + '; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; background: ' + (s ? '#FAFBFC' : '#FFFFFF'),
        rankStyle: 'flex: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; ' + (i === 0 ? 'background: #003057; color: #FFFFFF' : 'background: #EEF4FA; color: #003057'),
        tagStyle: UI.chip(col[0], col[1], 'font-size: 11.5px; border-radius: 6px'),
        accept: () => this.host.setState({ dec: { ...this.host.state.dec, [c.id + ':' + n.id]: 'ok' } }),
        discard: () => this.host.setState({ dec: { ...this.host.state.dec, [c.id + ':' + n.id]: 'no' } }) };
    });

    const align = c.alineacion.map(a => { const col = a.ok ? '#003057' : '#D57E00', v = Math.min(100, a.actual); return {
      name: a.nombre, actual: P.pct(a.actual), range: a.lo + '–' + a.hi + ' %',
      valStyle: 'color: ' + (a.ok ? '#003057' : '#8A5300'),
      bandStyle: 'position: absolute; top: 0; bottom: 0; left: ' + a.lo + '%; width: ' + (a.hi - a.lo) + '%; background: #C9E3F6; border: 1px dashed #0072CE; border-radius: 6px; box-sizing: border-box',
      barStyle: 'position: absolute; top: 4px; height: 8px; left: 0; width: ' + v + '%; background: ' + col + '; border-radius: 4px',
      markStyle: 'position: absolute; top: -4px; width: 4px; height: 24px; left: calc(' + v + '% - 2px); background: ' + col + '; border-radius: 2px' }; });
    const fuera = c.alineacion.filter(a => !a.ok);

    return {
      items, count: list.length + ' clientes',
      cli: { nombre: c.nombre, sub: c.segmento + ' · perfil oficial ' + c.perfil + ' · saldo ' + P.money(c.saldo), href: 'Vista360.dc.html?cliente=' + c.id, hrefLabel: 'Abrir Vista 360 de ' + c.nombre },
      fBrief: F('nbaBriefing') && !!c.briefing, briefing: c.briefing || [],
      nba, nbaDone: done + ' de ' + c.nba.length + ' revisadas',
      fAlign: F('nbaAlineacion'), align, alineado: fuera.length === 0, desalineado: fuera.length > 0,
      alignMsg: fuera.length ? fuera.map(a => a.nombre + ' en ' + P.pct(a.actual) + ' (rango ' + a.lo + '–' + a.hi + ' %)').join(' · ') + '. Revisión de idoneidad sugerida; la decisión y su registro son del asesor.' : 'La mezcla actual está dentro de los rangos de su perfil.',
      fReco: F('nbaRecomendacion'), reco: this.recomendacion(c)
    };
  }
}
  return SiguienteAccion;
})();

// ── Setup del cliente ───────────────────────────────────────────────────
const Setup = (function () {
const P = window.Portafolio, UI = window.AlianzaUI;
const ESTADO = {
  completo: { label: 'Completo', bg: '#E1F5EF', fg: '#00664F' },
  pendiente: { label: 'Pendiente', bg: '#FFF4DE', fg: '#8A5300' },
  vencido: { label: 'Vencido', bg: '#FDE8E6', fg: '#9A1F24' }
};

class Setup extends Base {
  initial() { return { f: 'all', open: null }; }

  renderVals() {
    const st = this.state, etapas = window.CopilotoData.setupEtapas;
    const all = P.setupProcesos();
    const keep = p => st.f === 'all' ? true : st.f === 'pend' ? p.pendientes > 0 : st.f === 'ok' ? p.pendientes === 0 : p.proceso === 'Vinculación nueva';
    const filters = [{ id: 'all', label: 'Todos' }, { id: 'pend', label: 'Con pendientes' }, { id: 'ok', label: 'Al día' }, { id: 'new', label: 'Vinculaciones nuevas' }]
      .map(d => ({ label: d.label, pressed: d.id === st.f ? 'true' : 'false', style: UI.pill(d.id === st.f), pick: () => this.setState({ f: d.id }) }));

    const estadoChip = p => p.pendientes === 0 ? { text: 'Al día', style: UI.chip('#E1F5EF', '#00664F') }
      : { text: 'Documentos pendientes: ' + p.pendientes + (p.vencidos ? ' (' + p.vencidos + ' vencido' + (p.vencidos > 1 ? 's' : '') + ')' : ''), style: p.vencidos ? UI.chip('#FDE8E6', '#9A1F24') : UI.chip('#FFF4DE', '#8A5300') };

    const rows = all.filter(keep).sort((a, b) => b.vencidos - a.vencidos || b.pendientes - a.pendientes).map(p => {
      const e = estadoChip(p);
      return {
        nombre: p.nombre, sub: p.proceso + ' · ' + (p.tipoPersona === 'PJ' ? 'Persona jurídica' : 'Persona natural') + ' · ' + p.segmento,
        prospecto: !p.cliente, inicio: 'Inicio ' + P.fecha(p.inicio),
        etapaLabel: p.etapa >= etapas.length ? 'Proceso completo' : 'Etapa ' + (p.etapa + 1) + ' de ' + etapas.length + ': ' + etapas[p.etapa],
        segs: etapas.map((n, i) => ({ title: n + (i < p.etapa ? ' · completa' : i === p.etapa ? ' · en curso' : ' · por iniciar'),
          style: 'flex: 1; height: 8px; border-radius: 4px; background: ' + (i < p.etapa ? '#0072CE' : i === p.etapa ? '#D2D755' : '#E1E7EE') })),
        estado: e.text, estadoStyle: e.style,
        aria: 'Ver checklist de ' + p.nombre,
        abrir: () => { this.setState({ open: p.id }); window.AlianzaModal.open(() => this.setState({ open: null })); }
      };
    });

    const sel = all.find(p => p.id === st.open);
    const modal = sel ? {
      nombre: sel.nombre, sub: sel.proceso + ' · ' + (sel.tipoPersona === 'PJ' ? 'Persona jurídica' : 'Persona natural') + ' · inicio ' + P.fecha(sel.inicio),
      estado: estadoChip(sel).text, estadoStyle: estadoChip(sel).style,
      href: sel.cliente ? 'Vista360.dc.html?cliente=' + sel.cliente.id : '', tieneVista: !!sel.cliente,
      grupos: etapas.map((n, i) => ({ etapa: (i + 1) + '. ' + n, docs: sel.docs.filter(d => d.etapa === i).map(d => ({
        nombre: d.nombre, responsable: 'Responsable: ' + (d.responsable === 'Alianza' ? 'Alianza' : 'el cliente'),
        estado: ESTADO[d.estado].label, estadoStyle: UI.chip(ESTADO[d.estado].bg, ESTADO[d.estado].fg, 'min-width: 84px; justify-content: center'),
        fecha: (d.estado === 'completo' ? 'Cumplido ' : 'Límite ') + P.fecha(d.fecha),
        icon: d.estado === 'completo' ? 'M5 12l5 5L20 7' : d.estado === 'vencido' ? 'M12 7v6 M12 17h.01' : 'M12 7v5l3 2',
        iconStyle: 'flex: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ' + ESTADO[d.estado].bg + '; color: ' + ESTADO[d.estado].fg
      })) })).filter(g => g.docs.length)
    } : null;

    return {
      kpi: {
        total: String(all.length), nuevos: String(all.filter(p => p.proceso === 'Vinculación nueva').length),
        alDia: String(all.filter(p => p.pendientes === 0).length), pend: String(all.filter(p => p.pendientes > 0).length),
        vencidos: String(all.reduce((a, p) => a + p.vencidos, 0))
      },
      filters, rows, empty: rows.length === 0, etapas: etapas.map((n, i) => (i + 1) + '. ' + n).join('  ·  '),
      modal, close: () => window.AlianzaModal.close()
    };
  }
}
  return Setup;
})();

return { Alertas, SiguienteAccion, Setup };
})();
