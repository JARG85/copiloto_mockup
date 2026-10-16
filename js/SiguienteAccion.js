/* Siguiente mejor acción — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/SiguienteAccion.dc.html la monta con una línea puente.
   Listado de todos los clientes del asesor con su acción sugerida; al
   elegir uno: briefing, tarjetas NBA (aceptar / descartar), alineación
   frente al perfil y recomendación de portafolio según perfil (en exploración).
   ?cliente=<id> abre directamente ese cliente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.SiguienteAccion = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI, F = id => window.AlianzaFlags.get(id);
const PRIORIDAD = { 'Retención': 0, 'Idoneidad': 1, 'Profundización': 2 };
const TAG_COLOR = { 'Retención': ['#FDE8E6', '#9A1F24'], 'Idoneidad': ['#FFF4DE', '#8A5300'], 'Profundización': ['#E3F1FB', '#004E8C'] };
// Vehículos sugeridos por clase de riesgo. TODO: confirmar con Alianza.
const VEHICULO = { conservador: 'FIC Alianza 1 o encargo fiduciario', moderado: 'FIC Alianza 2 (renta fija)', mayor: 'Renta variable o FIC Alianza 3' };

class Component extends DCLogic {
  constructor(p) {
    super(p);
    const ids = this.ordenados().map(c => c.id), pedido = P.param('cliente');
    this.state = { sel: ids.includes(pedido) ? pedido : ids[0], dec: {} };
  }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

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
    const decided = (cid, nid) => st.dec[cid + ':' + nid];

    const items = list.map(x => {
      const n = x.nba[0], on = x.id === st.sel, d = decided(x.id, n.id), col = TAG_COLOR[n.tag];
      const pend = x.nba.filter(a => !decided(x.id, a.id)).length;
      return {
        nombre: x.nombre, accion: n.titulo, tag: n.tag, tagStyle: UI.chip(col[0], col[1], 'font-size: 11px; padding: 2px 7px'),
        conf: 'Confianza ' + n.confianza + ' %', estado: pend ? pend + (pend === 1 ? ' pendiente' : ' pendientes') : 'Revisadas',
        estadoStyle: 'font-size: 11.5px; font-weight: 700; color: ' + (pend ? '#8A5300' : '#00664F'),
        pressed: on ? 'true' : 'false', pick: () => this.setState({ sel: x.id }),
        style: 'display: flex; flex-direction: column; gap: 4px; width: 100%; min-height: 48px; padding: 10px 12px; box-sizing: border-box; border-radius: 12px; font-family: inherit; text-align: left; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : 'border: 1px solid #E6EBF1; background: #FFFFFF')
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
        accept: () => this.setState({ dec: { ...this.state.dec, [c.id + ':' + n.id]: 'ok' } }),
        discard: () => this.setState({ dec: { ...this.state.dec, [c.id + ':' + n.id]: 'no' } }) };
    });

    const align = c.alineacion.map(a => { const col = a.ok ? '#003057' : '#D57E00', v = Math.min(100, a.actual); return {
      name: a.nombre, actual: P.pct(a.actual), range: a.lo + '–' + a.hi + ' %',
      valStyle: 'color: ' + (a.ok ? '#003057' : '#8A5300'),
      bandStyle: 'position: absolute; top: 0; bottom: 0; left: ' + a.lo + '%; width: ' + (a.hi - a.lo) + '%; background: #C9E3F6; border: 1px dashed #0072CE; border-radius: 6px; box-sizing: border-box',
      barStyle: 'position: absolute; top: 4px; height: 8px; left: 0; width: ' + v + '%; background: ' + col + '; border-radius: 4px',
      markStyle: 'position: absolute; top: -4px; width: 4px; height: 24px; left: calc(' + v + '% - 2px); background: ' + col + '; border-radius: 2px' }; });
    const fuera = c.alineacion.filter(a => !a.ok);

    return {
      ...window.AlianzaNav.shell('nba'),
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

  return Component;
};
