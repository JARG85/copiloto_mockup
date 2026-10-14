/* 04 · Consolidado grupo familiar y empresarial — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/GrupoFamiliar.dc.html la monta con una linea puente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.GrupoFamiliar = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { sel: 'all' }; }
  fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') + ' M'; }
  renderVals() {
    const classes = [
      { k: 'rf', name: 'Renta fija', color: '#0072CE' },
      { k: 'acc', name: 'Acciones', color: '#003057' },
      { k: 'liq', name: 'FIC Liquidez', color: '#00A3E0' },
      { k: 'bal', name: 'Balanceados', color: '#00A98E' },
      { k: 'alt', name: 'Alternativos', color: '#D2D755' }
    ];
    const acc = [
      { id: 'cm', ini: 'CM', name: 'Carlos Andrés Mejía', rel: 'Titular', type: 'Persona natural', profile: 'Moderado', ret: '+9,8 %', ok: false, churn: 72, c: { rf: 1639, acc: 1301, liq: 868, bal: 675, alt: 337 } },
      { id: 'ar', ini: 'AR', name: 'Ana María Rueda', rel: 'Cónyuge', type: 'Persona natural', profile: 'Conservador', ret: '+8,1 %', ok: true, churn: 35, c: { rf: 700, acc: 300, liq: 300, bal: 280, alt: 0 } },
      { id: 'sm', ini: 'SM', name: 'Santiago Mejía Rueda', rel: 'Hijo', type: 'Persona natural', profile: 'Mayor riesgo', ret: '+12,4 %', ok: true, churn: 20, c: { rf: 60, acc: 120, liq: 80, bal: 100, alt: 0 } },
      { id: 'im', ini: 'IM', name: 'Inversiones Mejía SAS', rel: 'Empresa del titular', type: 'Persona jurídica', profile: 'Moderado', ret: '+10,2 %', ok: true, churn: 48, c: { rf: 1500, acc: 529, liq: 650, bal: 300, alt: 1021 } },
      { id: 'ae', ini: 'AE', name: 'Agropecuaria La Esperanza SAS', rel: 'Empresa familiar', type: 'Persona jurídica', profile: 'Conservador', ret: '+7,6 %', ok: false, churn: 30, c: { rf: 311, acc: 100, liq: 222, bal: 65, alt: 302 } }
    ];
    acc.forEach(a => { a.total = classes.reduce((s, c) => s + a.c[c.k], 0); });
    const grand = acc.reduce((s, a) => s + a.total, 0);
    const maxT = Math.max(...acc.map(a => a.total));
    const sel = this.state.sel;
    const chCol = v => v >= 65 ? '#B3272D' : v >= 40 ? '#D57E00' : '#00A98E';

    const tabs = [{ id: 'all', initials: 'G', label: 'Posición global' }].concat(acc.map(a => ({ id: a.id, initials: a.ini, label: a.name.split(' ').slice(0, 2).join(' ') })))
      .map(t => { const on = sel === t.id; return { ...t, sel: on ? 'true' : 'false',
        style: 'display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px 0 6px; border-radius: 999px; font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #E3F1FB; color: #003057' : 'border: 1px solid #D5DDE6; background: #FFFFFF; color: #3D4C5B'),
        ini: 'width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; ' + (on ? 'background: #003057; color: #FFFFFF' : 'background: #EEF4FA; color: #003057'),
        pick: () => this.setState({ sel: t.id }) }; });

    const rows = acc.map(a => { const on = sel === a.id; return {
      name: a.name, rel: a.rel, type: a.type, profile: a.profile, ret: a.ret, total: this.fmt(a.total), share: Math.round(a.total / grand * 100) + ' %',
      align: a.ok ? 'Alineado' : 'Revisar',
      alStyle: 'font-size: 12.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; ' + (a.ok ? 'background: #E1F5EF; color: #00664F' : 'background: #FFF4DE; color: #8A5300'),
      churn: a.churn, chBar: 'height: 100%; width: ' + a.churn + '%; background: ' + chCol(a.churn),
      tr: on ? 'background: #F2F8FD' : 'background: #FFFFFF',
      wrap: 'display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left; padding: 12px; border-radius: 12px; font-family: inherit; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : (sel === 'all' ? 'border: 1px solid transparent; background: #FFFFFF' : 'border: 1px solid transparent; background: #FFFFFF; opacity: 0.55')),
      barWrap: 'display: flex; height: 100%; width: ' + (a.total / maxT * 100).toFixed(1) + '%',
      segs: classes.map(c => ({ style: 'display: block; height: 100%; width: ' + (a.c[c.k] / a.total * 100).toFixed(2) + '%; background: ' + c.color })),
      pick: () => this.setState({ sel: on ? 'all' : a.id }) }; });

    const C = 2 * Math.PI * 70;
    const mk = comp => { const t = classes.reduce((s, c) => s + comp[c.k], 0); let o = 0; return classes.filter(c => comp[c.k] > 0).map(c => { const len = comp[c.k] / t * C; const r = { color: c.color, dash: Math.max(len - 2, 0.5).toFixed(1) + ' ' + (C - len + 2).toFixed(1), offset: (-o).toFixed(1) }; o += len; return r; }); };
    let det;
    if (sel === 'all') {
      const g = {}; classes.forEach(c => { g[c.k] = acc.reduce((s, a) => s + a.c[c.k], 0); });
      det = { kicker: 'Posición global', name: 'Grupo Mejía Rueda', sub: '5 cuentas consolidadas', short: Math.round(grand).toLocaleString('es-CO'), donut: mk(g), profile: 'Mixto', ret: '+9,9 %', align: '2 por revisar', alStyle: 'font-size: 15px; color: #8A5300', churn: '64 · Medio-alto', chStyle: 'font-size: 15px; color: #8A5300' };
    } else {
      const a = acc.find(x => x.id === sel);
      det = { kicker: a.rel, name: a.name, sub: a.type + ' · ' + Math.round(a.total / grand * 100) + ' % del grupo', short: Math.round(a.total).toLocaleString('es-CO'), donut: mk(a.c), profile: a.profile, ret: a.ret,
        align: a.ok ? 'Alineado' : 'Revisar', alStyle: 'font-size: 15px; color: ' + (a.ok ? '#00664F' : '#8A5300'),
        churn: a.churn + (a.churn >= 65 ? ' · Alto' : a.churn >= 40 ? ' · Medio' : ' · Bajo'), chStyle: 'font-size: 15px; color: ' + (a.churn >= 65 ? '#9A1F24' : a.churn >= 40 ? '#8A5300' : '#00664F') };
    }
    return { tabs, rows, det, legend: classes.map(c => ({ name: c.name, sw: 'width: 12px; height: 12px; border-radius: 3px; background: ' + c.color })) };
  }
}

  return Component;
};
