/* Alertas de riesgo de fuga — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Alertas.dc.html la monta con una línea puente.
   Reúne lo que antes estaba en la Vista 360 y en Mi cartera: termómetro a
   30 y 60 días con sus factores, mapa de prioridad, motivos y clientes
   priorizados; y agrega señales anticipadas (reglas en copiloto-data.js).
   ?cliente=<id> abre el termómetro de ese cliente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Alertas = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI, F = id => window.AlianzaFlags.get(id);

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

class Component extends DCLogic {
  constructor(p) {
    super(p);
    const all = P.clientes().slice().sort((a, b) => b.riesgo.d60 - a.riesgo.d60);
    const pedido = P.param('cliente');
    this.state = { sel: all.some(c => c.id === pedido) ? pedido : all[0].id, f: 'alto' };
  }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

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
    const fSen = F('alertasSenales'), fMapa = F('alertasMapa'), nbaOn = window.AlianzaNav.visible('nba');

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
      title: x.nombre + ' · riesgo ' + x.riesgo.d60 + ' · ' + P.money(x.saldo) }));
    const me = { x: X(c.riesgo.d60).toFixed(1), y: Y(c.saldo).toFixed(1), tx: (X(c.riesgo.d60) - 16).toFixed(1), ty: (Y(c.saldo) + 4).toFixed(1), label: c.iniciales };
    const yTicks = [0, 0.5, 1].map(k => ({ y: Y(maxS * k).toFixed(1), ty: (Y(maxS * k) + 4).toFixed(1), label: P.money(Math.round(maxS * k / 100) * 100) }));
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
      ver: () => { this.setState({ sel: x.id }); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      verAria: 'Ver termómetro de ' + x.nombre,
      href: 'Vista360.dc.html?cliente=' + x.id, hrefAria: 'Abrir Vista 360 de ' + x.nombre
    }));
    const filters = [{ id: 'alto', label: 'Riesgo alto' }, { id: 'medio', label: 'Riesgo medio' }, { id: 'off', label: 'Fuera de perfil' }, { id: 'all', label: 'Todos' }]
      .map(d => ({ label: d.label, pressed: d.id === st.f ? 'true' : 'false', style: UI.pill(d.id === st.f), pick: () => this.setState({ f: d.id }) }));

    return {
      ...window.AlianzaNav.shell('alertas'),
      fSen, fMapa, nbaOn, kpi, termo, opts, sel: st.sel, pickSel: e => this.setState({ sel: e.target.value }),
      senales: senalesV, dots, me, yTicks, motivos, rows, filters, empty: rows.length === 0
    };
  }
}

  return Component;
};
