/* Vista Cliente 360 — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Vista360.dc.html la monta con una línea puente.

   Responde solo a: quién es el cliente y cómo está su portafolio por línea
   de producto y por producto. Es informativa (sin alertas, NBA ni campañas).
   Cliente: ?cliente=<id> (por defecto el último abierto o "cm").
   Alcance: ?vista=grupo abre directamente el consolidado del grupo familiar. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Vista360 = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI, F = id => window.AlianzaFlags.get(id);
const SVG_W = 760;
// Texto dentro de <text> SVG: el runtime envuelve el texto interpolado en un
// <span> HTML (que el SVG no dibuja); un <tspan> sí se muestra.
const svgText = v => React.createElement('tspan', null, String(v));

class Component extends DCLogic {
  constructor(p) {
    super(p);
    const pedido = P.param('cliente') || window.AlianzaNav.lastClient() || 'cm';
    this.clienteId = P.cliente(pedido) ? pedido : 'cm';
    window.AlianzaNav.rememberClient(this.clienteId);
    this.state = {
      scope: P.param('vista') === 'grupo' ? 'grp' : 'ind',
      tab: 'port', openLine: null, member: 'all', dec: {}, pensF: 'todas',
      modal: null, row: 0, period: 'all', hidden: {}
    };
    // Vistas de Alertas, Next best action y Setup que se abren en modal
    // (js/vistas-modulos.js); su estado vive en alv / nbv / stv.
    const V = window.AlianzaVistas;
    this.vistas = { alertas: new V.Alertas(this, 'alv'), nba: new V.SiguienteAccion(this, 'nbv'), setup: new V.Setup(this, 'stv') };
  }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

  openModal(modal) {
    this.setState({ modal, row: 0 });
    window.AlianzaModal.open(() => this.setState({ modal: null }));
  }

  // Abre en modal la vista completa de un módulo, enfocada en el cliente
  // (o integrante del grupo) que se está viendo.
  abrirModulo(tipo) {
    const key = { alertas: 'alv', nba: 'nbv', setup: 'stv' }[tipo];
    this.setState({ [key]: this.vistas[tipo].initial(this._targetId) });
    this.openModal({ type: tipo });
  }

  // ── Serie histórica por línea de producto (ilustrativa) ─────────────
  // Forma de cada línea normalizada a 1 en el último mes y escalada al
  // saldo actual de la línea, así el último punto cuadra con el portafolio.
  shapes() {
    if (this._shapes) return this._shapes;
    const n = 127, months = [];
    const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    for (let i = 0; i < n; i++) { const m = (2 + i) % 12, y = 2016 + Math.floor((2 + i) / 12); months.push({ m, y, label: names[m] }); }
    const nz = (i, k) => Math.sin(i * 0.7 + k) * 0.025 + Math.sin(i * 0.23 + k * 2) * 0.035;
    const ramp = (i, s) => i < s ? 0 : (i - s) / (n - 1 - s);
    const L = [], R = [], B = [], A = [], X = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const ret = (i >= 118 && i < 126) ? (i - 117) / 8 : 0;
      L.push(0.9 + 0.2 * Math.sin(i * 0.12) + 0.1 * t + nz(i, 1) + 0.24 * ret);
      R.push(0.42 + 0.58 * Math.pow(t, 0.9) + nz(i, 2) * 0.6 + 0.06 * ret);
      B.push(i < 18 ? 0 : 0.3 + 0.7 * ramp(i, 18) + nz(i, 3));
      const covid = 1 - 0.32 * Math.exp(-Math.pow((i - 48) / 3, 2));
      A.push(i < 30 ? 0 : (0.25 + 0.75 * ramp(i, 30) + nz(i, 4) * 2) * covid);
      X.push(i < 60 ? 0 : 0.6 + 0.4 * ramp(i, 60) + nz(i, 5) * 0.5);
    }
    const norm = arr => { const last = arr[n - 1] || 1; return arr.map((v, i) => i === n - 1 ? 1 : v / last); };
    const RA = R.map((v, i) => v * 1639 + A[i] * 1301);
    this._shapes = { n, months, fondos: norm(L), fiducia: norm(B), intermediacion: norm(RA), corp: norm(X) };
    return this._shapes;
  }

  renderVals() {
    const st = this.state;
    const c = P.cliente(this.clienteId);
    const g = c.grupo ? P.grupo(c.grupo) : null;
    const canGroup = !!g && F('v360Grupo');
    const isGrp = canGroup && st.scope === 'grp';
    const fRiesgo = F('v360Riesgo'), fContacto = F('v360Contacto'), fFin = F('v360Financiera'), fInter = F('v360Interacciones'), fEvo = F('v360Evolucion');
    const linkAlertas = F('modAlertas');

    // ── Encabezado ────────────────────────────────────────────────────
    const lvl = P.nivel(c.riesgo.d60);
    const hdr = isGrp ? {
      iniciales: 'GF', titulo: g.nombre,
      chips: [{ text: g.miembros.length + ' integrantes', style: UI.chip('#003057', '#FFFFFF') }, { text: g.personasJuridicas + ' personas jurídicas', style: UI.chip('#F2F5F9', '#3D4C5B') }],
      linea: 'Titular: ' + c.nombre + ' · Asesora: ' + window.CopilotoData.asesor.nombre + ' · Perfil oficial del titular: ' + c.perfil
    } : {
      iniciales: c.iniciales, titulo: c.nombre,
      chips: [
        { text: c.segmento, style: UI.chip('#003057', '#FFFFFF') },
        { text: 'Perfil oficial: ' + c.perfil, title: 'Perfil actualizado el ' + P.fecha(c.perfilFecha), style: UI.chip('#E3F1FB', '#004E8C') }
      ],
      linea: c.documento + ' · Cliente desde ' + P.fecha(c.vinculacion) + ' · Asesora: ' + window.CopilotoData.asesor.nombre + ' · Perfil act. ' + P.fecha(c.perfilFecha)
    };
    const riesgo = {
      show: fRiesgo && !isGrp, link: linkAlertas, noLink: !linkAlertas,
      text: 'Riesgo de fuga: ' + c.riesgo.d60 + ' · ' + lvl.label,
      style: 'display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 10px; border-radius: 999px; font-size: 12.5px; font-weight: 700; text-decoration: none; white-space: nowrap; background: ' + lvl.bg + '; color: ' + lvl.fg + '; border: 1px solid ' + lvl.color,
      linkStyle: 'display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 12px; border-radius: 999px; font-family: inherit; cursor: pointer; font-size: 12.5px; font-weight: 700; text-decoration: none; white-space: nowrap; background: ' + lvl.bg + '; color: ' + lvl.fg + '; border: 1px solid ' + lvl.color,
      dot: 'width: 8px; height: 8px; border-radius: 50%; background: ' + lvl.color
    };
    const scope = {
      show: canGroup,
      ind: { style: UI.seg(!isGrp), pressed: isGrp ? 'false' : 'true', pick: () => this.setState({ scope: 'ind', member: 'all' }) },
      grp: { style: UI.seg(isGrp), pressed: isGrp ? 'true' : 'false', pick: () => this.setState({ scope: 'grp', member: 'all' }), label: 'Grupo familiar · ' + (g ? g.miembros.length : 0) + ' cuentas' }
    };

    // ── Base de cifras: cliente, grupo o integrante seleccionado ──────
    const base = isGrp ? g : c;
    const members = isGrp ? g.miembros : [c];
    const memberSel = isGrp && st.member !== 'all' ? g.miembros.find(m => m.id === st.member) : null;
    const prods = memberSel ? memberSel.productos : base.productos;
    const lineasData = P.lineas(prods);
    const total = P.sum(prods, 'saldo');
    const nLineas = lineasData.filter(l => l.productos.length).length;

    // ── KPIs ─────────────────────────────────────────────────────────
    const patrimonio = isGrp ? g.patrimonio : c.financiera.patrimonio;
    const ingresos = isGrp ? g.ingresosMensuales : c.financiera.ingresosMensuales;
    const kpi = {
      saldo: P.money(base.saldo),
      saldoSub: (n => base.productos.length + (base.productos.length === 1 ? ' producto · ' : ' productos · ') + n + (n === 1 ? ' línea' : ' líneas'))(P.lineas(base.productos).filter(l => l.productos.length).length),
      rent: P.signedPct(base.rentPct),
      rentStyle: 'font-size: 22px; font-weight: 800; line-height: 1.25; color: ' + (base.rentPct >= 0 ? '#00806B' : '#9A1F24'),
      rentSub: P.signedMoney(base.ganancia) + ' sobre ' + P.money(base.invertido) + ' invertidos',
      patrimonio: P.money(patrimonio),
      patrimonioSub: 'En Alianza: ' + P.pct(base.saldo / patrimonio * 100) + ' del patrimonio',
      ingresos: P.money(ingresos),
      ingresosSub: isGrp ? 'Suma de ' + g.miembros.length + ' integrantes' : 'Declarados · act. ' + P.fecha(c.financiera.actualizado)
    };

    // ── Columna izquierda ────────────────────────────────────────────
    const contacto = {
      show: fContacto && !isGrp,
      canal: c.contacto.canal,
      telefonos: c.contacto.telefonos.map(t => ({ tipo: t.tipo, numero: t.numero, href: 'tel:' + t.numero.replace(/\s/g, ''), pref: !!t.preferido })),
      correos: c.contacto.correos.map(m => ({ tipo: m.tipo, correo: m.correo, href: 'mailto:' + m.correo, pref: !!m.preferido })),
      direccion: c.contacto.direccion
    };
    const integrantes = {
      show: isGrp,
      items: [{ id: 'all', nombre: 'Todo el grupo', rel: g ? g.miembros.length + ' cuentas' : '', saldo: g ? g.saldo : 0, ini: 'GF' }]
        .concat(isGrp ? g.miembros.map(m => ({ id: m.id, nombre: m.nombre, rel: m.relacion + ' · ' + (m.tipoPersona === 'PJ' ? 'Persona jurídica' : 'Persona natural'), saldo: m.saldo, ini: m.iniciales, d60: m.riesgo.d60 })) : [])
        .map(m => { const on = st.member === m.id; return {
          nombre: m.nombre, rel: m.rel, saldo: P.money(m.saldo), pct: isGrp ? P.pct(m.saldo / g.saldo * 100) : '',
          pressed: on ? 'true' : 'false', pick: () => this.setState({ member: m.id }),
          style: 'display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 10px; align-items: center; width: 100%; min-height: 48px; padding: 6px 10px; box-sizing: border-box; border-radius: 10px; font-family: inherit; text-align: left; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : 'border: 1px solid #EEF1F5; background: #FFFFFF'),
          ini: m.ini, iniStyle: 'width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 800; ' + (m.id === 'all' ? 'background: #003057; color: #FFFFFF' : 'background: #E3F1FB; color: #003057'),
          riesgo: fRiesgo && m.d60 != null ? m.d60 + ' · ' + P.nivel(m.d60).label : '', riesgoStyle: m.d60 != null ? UI.chip(P.nivel(m.d60).bg, P.nivel(m.d60).fg, 'font-size: 11px; padding: 1px 7px') : ''
        }; }),
      sel: memberSel ? { label: 'Abrir Vista 360 de ' + memberSel.nombre, href: 'Vista360.dc.html?cliente=' + memberSel.id } : null
    };
    const allInter = [].concat(...members.map(m => m.interacciones.map(x => ({ ...x, quien: m.nombre }))))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const interFmt = x => ({ fecha: P.fechaCorta(x.fecha), tipo: x.tipo, nota: x.nota, quien: isGrp ? x.quien : '' });
    const inter = {
      show: fInter, items: allInter.slice(0, 3).map(interFmt), all: allInter.map(interFmt),
      total: allInter.length, more: allInter.length > 3,
      verTodo: () => this.openModal({ type: 'inter' }),
      ultimo: allInter[0] ? 'Último contacto hace ' + P.dias(allInter[0].fecha, window.CopilotoData.corte) + ' días' : 'Sin interacciones registradas'
    };
    const showLeft = contacto.show || integrantes.show || inter.show;

    // ── Composición jerárquica: línea → producto ─────────────────────
    // Gráfico de torta: composición del portafolio por línea de producto
    // (recupera la dona de la primera versión, ahora por línea).
    const C = 2 * Math.PI * 70, conSaldo = lineasData.filter(l => l.saldo > 0);
    let acc = 0;
    const donut = {
      total: svgText(Math.round(total).toLocaleString('es-CO')),
      aria: 'Gráfico de torta del portafolio por línea de producto: ' + conSaldo.map(l => l.nombre + ' ' + P.pct(l.pctTotal)).join(', '),
      segs: conSaldo.map(l => { const len = l.saldo / total * C; const o = { color: l.color, title: svgText(l.nombre + ': ' + P.money(l.saldo) + ' (' + P.pct(l.pctTotal) + ')'),
        dash: Math.max(0, len - (conSaldo.length > 1 ? 2 : 0)).toFixed(1) + ' ' + (C - len + (conSaldo.length > 1 ? 2 : 0)).toFixed(1), offset: (-acc).toFixed(1) }; acc += len; return o; }),
      items: lineasData.map(l => { const has = l.productos.length > 0, open = has && st.openLine === l.id; return {
        nombre: l.nombre, val: has ? P.money(l.saldo) : 'Sin productos', pct: has ? P.pct(l.pctTotal, 0) : '—',
        pressed: open ? 'true' : 'false', disabled: !has, pick: () => has && this.setState({ openLine: open ? null : l.id }),
        aria: has ? (open ? 'Ocultar productos de ' : 'Ver productos de ') + l.nombre : l.nombre + ': sin productos',
        sw: 'width: 12px; height: 12px; border-radius: 3px; flex: none; background: ' + (has ? l.color : '#D5DDE6'),
        style: 'display: flex; align-items: center; gap: 8px; width: 100%; min-height: 44px; padding: 4px 10px; box-sizing: border-box; border-radius: 10px; font-family: inherit; text-align: left; color: #1B2A3A; ' +
          (open ? 'border: 2px solid #0072CE; background: #F2F8FD; cursor: pointer' : has ? 'border: 1px solid #EEF1F5; background: #FFFFFF; cursor: pointer' : 'border: 1px dashed #E1E7EE; background: #FAFBFC; cursor: default; opacity: 0.75') }; })
    };
    const lineas = lineasData.map(l => {
      const has = l.productos.length > 0, open = has && st.openLine === l.id;
      return {
        id: 'linea-' + l.id, nombre: l.nombre, desc: l.desc, has, empty: !has, open,
        expanded: open ? 'true' : 'false',
        count: has ? l.productos.length + (l.productos.length === 1 ? ' producto' : ' productos') : 'Sin productos',
        saldo: has ? P.money(l.saldo) : '—', pct: has ? P.pct(l.pctTotal) : '—',
        rent: has ? P.signedPct(l.rentPct) : '', rentChip: UI.rentChip(l.rentPct),
        toggle: () => this.setState({ openLine: open ? null : l.id }),
        sw: 'width: 12px; height: 28px; border-radius: 4px; flex: none; background: ' + (has ? l.color : '#D5DDE6'),
        chev: 'flex: none; transition: transform .15s; transform: rotate(' + (open ? '90' : '0') + 'deg)',
        rowStyle: 'display: grid; grid-template-columns: minmax(0, 1fr) 110px 70px 80px 120px; gap: 12px; align-items: center; width: 100%; min-height: 44px; padding: 4px 12px; box-sizing: border-box; border: none; border-radius: 10px; font-family: inherit; text-align: left; color: #1B2A3A; ' + (has ? 'cursor: pointer; background: ' + (open ? '#EEF4FA' : '#F7F9FB') : 'cursor: default; background: #FAFBFC; opacity: 0.75'),
        productos: l.productos.map(p => ({
          nombre: p.nombre, desc: p.descripcion + (isGrp ? ' · ' + p.titular : ''), tag: p.tag,
          tagStyle: 'flex: none; width: 40px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 800; letter-spacing: 0.04em; ' + (l.id === 'corp' ? 'background: #EEF0D2; color: #3F410C' : 'background: ' + l.color + '; color: ' + (l.id === 'fondos' ? '#002340' : '#FFFFFF')),
          saldo: P.money(p.saldo), pct: P.pct(p.saldo / total * 100), inLine: P.pct(p.saldo / l.saldo * 100),
          rent: P.signedPct(p.rentPct), rentChip: UI.rentChip(p.rentPct), rentVal: P.signedMoney(p.ganancia),
          rentValStyle: 'font-size: 11.5px; font-weight: 600; color: ' + (p.ganancia >= 0 ? '#00664F' : '#9A1F24'),
          aria: 'Ver detalle de ' + p.nombre + (isGrp ? ' de ' + p.titular : ''),
          open: () => this.openModal({ type: 'prod', id: p.id })
        }))
      };
    });
    const totalInv = P.sum(prods, 'invertido'), totalRent = P.rent(total, totalInv);
    const port = {
      scopeLabel: memberSel ? memberSel.nombre : isGrp ? 'Consolidado del grupo familiar' : 'Cliente individual',
      sub: prods.length + (prods.length === 1 ? ' producto · ' : ' productos · ') + nLineas + (nLineas === 1 ? ' línea' : ' líneas'),
      total: P.money(total), totalRent: P.signedPct(totalRent), totalRentChip: UI.rentChip(totalRent), totalRentVal: P.signedMoney(total - totalInv)
    };

    // ── Pestañas ─────────────────────────────────────────────────────
    // Pensiones, Señales de churn, Next best action y Setup aparecen solo si
    // se habilitan en el panel oculto (flags v360Pensiones, modAlertas,
    // modNBA, modSetup); las tres últimas llevan el punto de "En definición".
    const tabDefs = [{ id: 'port', label: 'Portafolio por línea', on: true },
      { id: 'evo', label: 'Evolución', on: fEvo },
      { id: 'pens', label: 'Pensiones', on: F('v360Pensiones') },
      { id: 'churn', label: 'Señales de churn', on: F('modAlertas'), endef: true },
      { id: 'nba', label: 'Next best action', on: F('modNBA'), endef: true },
      { id: 'setup', label: 'Setup', on: F('modSetup'), endef: true }].filter(t => t.on);
    const tab = tabDefs.some(t => t.id === st.tab) ? st.tab : 'port';
    const tabs = tabDefs.map(t => { const on = t.id === tab; return { label: t.label, id: 'tab-' + t.id, endef: !!t.endef, selected: on ? 'true' : 'false', style: UI.seg(on) + ' display: inline-flex; align-items: center; gap: 6px; padding: 0 11px; font-size: 12.5px;', pick: () => this.setState({ tab: t.id }) }; });
    const tabEvo = tab === 'evo';
    const targets = memberSel ? [memberSel] : isGrp ? g.miembros : [c];
    const churn = tab === 'churn' ? this.churnTab(targets) : null;
    const nba = tab === 'nba' ? this.nbaTab(targets, isGrp) : null;
    const setup = tab === 'setup' ? this.setupTab(targets) : null;
    const pens = tab === 'pens' ? this.pensionesTab(targets, isGrp) : null;

    // ── Evolución histórica ──────────────────────────────────────────
    const evo = tabEvo ? this.evolucion(lineasData, memberSel ? memberSel.vinculacion : isGrp ? g.miembros.reduce((a, m) => m.vinculacion < a ? m.vinculacion : a, '9999') : c.vinculacion) : null;

    // ── Modales ──────────────────────────────────────────────────────
    const close = () => window.AlianzaModal.close();
    const modalInter = st.modal && st.modal.type === 'inter';
    this._targetId = (memberSel || c).id;
    const mt = st.modal && st.modal.type;
    const alv = mt === 'alertas' ? this.vistas.alertas.renderVals() : null;
    const nbv = mt === 'nba' ? this.vistas.nba.renderVals() : null;
    const stv = mt === 'setup' ? this.vistas.setup.renderVals() : null;
    const pensCons = st.modal && st.modal.type === 'pensCons' ? window.AlianzaPensiones.vals(st.pensF, f => this.setState({ pensF: f })) : null;
    const prodModal = st.modal && st.modal.type === 'prod' ? this.detalle(base.productos.find(p => p.id === st.modal.id), isGrp) : null;

    return {
      nav: window.AlianzaNav.build('v360'),
      corte: P.fecha(window.CopilotoData.corte),
      hdr, riesgo, scope, kpi, fFin,
      kpiGrid: 'display: grid; grid-template-columns: repeat(' + (fFin ? 4 : 2) + ', minmax(0, 1fr)); gap: 12px',
      contacto, integrantes, inter, showLeft,
      bodyGrid: 'display: grid; grid-template-columns: ' + (showLeft ? '320px minmax(0, 1fr)' : 'minmax(0, 1fr)') + '; gap: 14px',
      tabs, tabPort: tab === 'port', tabEvo, evo, tabChurn: !!churn, churn, tabNba: !!nba, nba, tabSetup: !!setup, setup, tabPens: !!pens, pens,
      portHint: tab === 'port',
      donut, lineas, port,
      modalInter, prodModal, pensCons, alv, nbv, stv, close,
      abrirAlertas: () => this.abrirModulo('alertas'), abrirNba: () => this.abrirModulo('nba'), abrirSetup: () => this.abrirModulo('setup')
    };
  }

  // ── Pestaña "Señales de churn" ───────────────────────────────────────
  // Un cliente: medidores a 30 y 60 días, factores y señales anticipadas
  // que le aplican. Grupo sin integrante elegido: resumen por integrante.
  churnTab(targets) {
    const D = window.CopilotoData;
    const meter = (v, label) => { const n = P.nivel(v); return {
      label, v: String(v), nivel: n.label, chip: UI.chip(n.bg, n.fg),
      fill: 'position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; width: ' + v + '%; background: ' + n.color }; };
    const detalle = c => {
      const maxAbs = Math.max(20, ...c.riesgo.factores.map(f => Math.abs(f[1])));
      return {
        nombre: c.nombre,
        m30: meter(c.riesgo.d30, 'A 30 días'), m60: meter(c.riesgo.d60, 'A 60 días'),
        enRiesgo: P.money(c.riesgo.enRiesgo || c.saldo * c.riesgo.d60 / 100),
        factores: c.riesgo.factores.map(f => ({ name: f[0], val: (f[1] > 0 ? '+' : '−') + Math.abs(f[1]),
          valStyle: 'text-align: right; font-size: 13px; font-weight: 700; color: ' + (f[1] > 0 ? '#9A1F24' : '#00664F'),
          bar: 'position: absolute; top: 0; bottom: 0; border-radius: 4px; ' + (f[1] > 0 ? 'left: 50%; width: ' + (f[1] / maxAbs * 50) + '%; background: #B3272D' : 'right: 50%; width: ' + (-f[1] / maxAbs * 50) + '%; background: #00A98E') })),
        senales: D.senales.filter(x => x.prueba(c)).map(x => ({ nombre: x.nombre, regla: x.regla })),
        sinSenales: !D.senales.some(x => x.prueba(c))
      };
    };
    if (targets.length === 1) return { uno: detalle(targets[0]), varios: null };
    return { uno: null, varios: targets.slice().sort((a, b) => b.riesgo.d60 - a.riesgo.d60).map(m => ({
      nombre: m.nombre, rel: m.relacion,
      c30: m.riesgo.d30 + ' · ' + P.nivel(m.riesgo.d30).label, s30: UI.riesgoChip(m.riesgo.d30),
      c60: m.riesgo.d60 + ' · ' + m.nivel.label, s60: UI.riesgoChip(m.riesgo.d60),
      factor: (m.riesgo.factores.find(f => f[1] > 0) || ['Sin señales relevantes'])[0],
      ver: () => this.setState({ member: m.id }), aria: 'Ver señales de ' + m.nombre
    })) };
  }

  // ── Pestaña "Next best action" ───────────────────────────────────────
  nbaTab(targets, isGrp) {
    const TAG = { 'Retención': ['#FDE8E6', '#9A1F24'], 'Idoneidad': ['#FFF4DE', '#8A5300'], 'Profundización': ['#E3F1FB', '#004E8C'] };
    const dec = this.state.dec;
    const cards = [].concat(...targets.map(c => c.nba.map(n => ({ c, n })))).sort((a, b) => b.n.confianza - a.n.confianza).map(({ c, n }, i) => {
      const key = c.id + ':' + n.id, s = dec[key], col = TAG[n.tag] || ['#F2F5F9', '#3D4C5B'];
      return {
        titulo: n.titulo, tag: n.tag, tagStyle: UI.chip(col[0], col[1], 'font-size: 11.5px; border-radius: 6px'),
        porque: n.porque, meta: 'Evidencia: ' + n.evidencia + ' · Confianza ' + n.confianza + ' %',
        quien: isGrp ? c.nombre : '', pending: !s, decided: !!s,
        status: s === 'ok' ? 'Aceptada · registrada en bitácora' : 'Descartada · motivo registrado',
        statusStyle: 'font-size: 12.5px; font-weight: 700; padding: 8px 12px; border-radius: 8px; ' + (s === 'ok' ? 'background: #E1F5EF; color: #00664F' : 'background: #F2F5F9; color: #4F5D6B'),
        card: 'border: 1px solid ' + (s ? '#E6EBF1' : '#D5DDE6') + '; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; background: ' + (s ? '#FAFBFC' : '#FFFFFF'),
        rank: String(i + 1),
        rankStyle: 'flex: none; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; ' + (i === 0 ? 'background: #003057; color: #FFFFFF' : 'background: #EEF4FA; color: #003057'),
        accept: () => this.setState({ dec: { ...this.state.dec, [key]: 'ok' } }),
        discard: () => this.setState({ dec: { ...this.state.dec, [key]: 'no' } })
      };
    });
    const done = cards.filter(x => x.decided).length;
    return { cards, resumen: done + ' de ' + cards.length + ' revisadas' };
  }

  // ── Pestaña "Setup" ──────────────────────────────────────────────────
  // Qué documentos o firmas le faltan al cliente (responsable: Cliente);
  // lo que depende de Alianza se resume aparte.
  setupTab(targets) {
    const etapas = window.CopilotoData.setupEtapas;
    const EST = { pendiente: ['Pendiente', '#FFF4DE', '#8A5300'], vencido: ['Vencido', '#FDE8E6', '#9A1F24'] };
    const items = targets.map(c => {
      const p = P.setupDe(c.id);
      if (!p) return { nombre: c.nombre, sinProceso: true, conProceso: false };
      const falta = p.docs.filter(d => d.estado !== 'completo' && d.responsable === 'Cliente').sort((a, b) => (a.estado === 'vencido' ? -1 : 1) - (b.estado === 'vencido' ? -1 : 1));
      const alianza = p.docs.filter(d => d.estado !== 'completo' && d.responsable === 'Alianza');
      return {
        nombre: c.nombre, sinProceso: false, conProceso: true,
        proceso: p.proceso + ' · inicio ' + P.fecha(p.inicio),
        etapa: p.etapa >= etapas.length ? 'Proceso completo' : 'Etapa ' + (p.etapa + 1) + ' de ' + etapas.length + ': ' + etapas[p.etapa],
        segs: etapas.map((n, i) => ({ title: n, style: 'flex: 1; height: 8px; border-radius: 4px; background: ' + (i < p.etapa ? '#0072CE' : i === p.etapa ? '#D2D755' : '#E1E7EE') })),
        alDia: falta.length === 0, conFaltantes: falta.length > 0,
        resumen: falta.length ? 'Faltan ' + falta.length + (falta.length === 1 ? ' documento o firma' : ' documentos o firmas') + ' por parte del cliente' : 'El cliente no tiene documentos ni firmas pendientes',
        resumenStyle: UI.chip(falta.length ? (falta.some(d => d.estado === 'vencido') ? '#FDE8E6' : '#FFF4DE') : '#E1F5EF', falta.length ? (falta.some(d => d.estado === 'vencido') ? '#9A1F24' : '#8A5300') : '#00664F'),
        falta: falta.map(d => ({ nombre: d.nombre, firma: d.etapa === 3, fecha: 'Límite ' + P.fecha(d.fecha),
          estado: EST[d.estado][0], estadoStyle: UI.chip(EST[d.estado][1], EST[d.estado][2], 'min-width: 76px; justify-content: center') })),
        alianza: alianza.length ? 'Pendiente por parte de Alianza: ' + alianza.map(d => d.nombre.toLowerCase()).join(', ') : ''
      };
    });
    return { items };
  }

  // ── Pestaña "Pensiones" ──────────────────────────────────────────────
  // Detalle de pensiones voluntarias (antes en la página de Pensiones):
  // planes FPV del cliente, permanencia y beneficio tributario, y
  // solicitudes en curso en back-office.
  pensionesTab(targets, isGrp) {
    const NIVEL = { alto: ['#FDE8E6', '#9A1F24'], medio: ['#FFF4DE', '#8A5300'], bajo: ['#E1F5EF', '#00664F'] };
    const PERM = { alto: 'Vence pronto', medio: 'Por vencer', bajo: 'Sin urgencia' };
    const ESTADO = { 'Pendiente documentos': ['#FFF4DE', '#8A5300'], 'En validación': ['#E3F1FB', '#0B4A75'], 'Lista para aplicar': ['#E1F5EF', '#00664F'], 'Vencida': ['#FDE8E6', '#9A1F24'] };
    const planes = [], solicitudes = [];
    targets.forEach(c => {
      const pd = P.pensionesDe(c);
      pd.productos.forEach(p => planes.push({
        nombre: p.nombre, quien: isGrp ? c.nombre : '', plan: p.datos.plan,
        saldo: P.money(p.saldo), rent: P.signedPct(p.rentPct), rentChip: UI.rentChip(p.rentPct),
        apertura: P.fecha(p.apertura), aportes: P.money(p.datos.aportesAnio),
        permanencia: P.fecha(p.datos.permanenciaHasta),
        dias: p.diasPermanencia >= 0 ? 'faltan ' + p.diasPermanencia + ' días' : 'cumplida',
        permLabel: PERM[p.nivelPermanencia], permStyle: UI.chip(NIVEL[p.nivelPermanencia][0], NIVEL[p.nivelPermanencia][1]),
        aviso: p.nivelPermanencia === 'alto', beneficio: p.datos.beneficio,
        abrir: () => this.openModal({ type: 'prod', id: p.id }), aria: 'Ver detalle de ' + p.nombre
      }));
      pd.solicitudes.forEach(q => solicitudes.push({
        tipo: q.tipo, plan: q.plan, quien: isGrp ? c.nombre : '', detalle: q.detalle || '',
        estado: q.estado, estadoStyle: UI.chip(ESTADO[q.estado][0], ESTADO[q.estado][1]),
        vence: q.venceLabel, venceStyle: UI.chip(NIVEL[q.nivel][0], NIVEL[q.nivel][1])
      }));
    });
    return {
      planes, solicitudes, hayPlanes: planes.length > 0, sinPlanes: planes.length === 0,
      haySol: solicitudes.length > 0, sinSol: solicitudes.length === 0,
      total: P.money(targets.reduce((a, c) => a + P.pensionesDe(c).productos.reduce((b, p) => b + p.saldo, 0), 0)),
      verConsolidado: () => this.openModal({ type: 'pensCons' })
    };
  }

  // Gráfico de líneas por línea de producto (reutiliza el de la versión anterior).
  evolucion(lineasData, desde) {
    const st = this.state, sh = this.shapes(), N = sh.n;
    const d0 = new Date(Date.UTC(2016, 2, 1)), dv = new Date(desde + 'T00:00:00Z');
    const vincIdx = Math.max(0, (dv.getUTCFullYear() - d0.getUTCFullYear()) * 12 + dv.getUTCMonth() - d0.getUTCMonth());
    const S = {};
    lineasData.forEach(l => { S[l.id] = sh[l.id].map((v, i) => i < vincIdx ? 0 : v * l.saldo); });
    S.total = S.fondos.map((v, i) => v + S.fiducia[i] + S.intermediacion[i] + S.corp[i]);
    const periodsDef = [{ id: '1y', label: '1A', n: 12 }, { id: '3y', label: '3A', n: 36 }, { id: '5y', label: '5A', n: 60 }, { id: 'all', label: 'Desde vinculación', n: N - 1 - vincIdx }];
    const cur = periodsDef.find(p => p.id === st.period) || periodsDef[3];
    const from = N - 1 - Math.min(cur.n, N - 1 - vincIdx);
    const seriesDef = [{ id: 'total', name: 'Portafolio total', color: '#003057', w: 3 }]
      .concat(lineasData.filter(l => l.saldo > 0).map(l => ({ id: l.id, name: l.nombre, color: l.id === 'intermediacion' ? '#D57E00' : l.color, w: 2 })));
    const vis = seriesDef.filter(s => !st.hidden[s.id]);
    let ymax = 0;
    vis.forEach(s => { for (let i = from; i < N; i++) ymax = Math.max(ymax, S[s.id][i]); });
    if (ymax === 0) ymax = 1000;
    const step = Math.pow(10, Math.floor(Math.log10(ymax))) / 2;
    ymax = Math.ceil(ymax / step) * step;
    const X0 = 56, PW = 688, Y0 = 16, PH = 228;
    const xs = i => X0 + (i - from) / Math.max(1, N - 1 - from) * PW;
    const ys = v => Y0 + PH - v / ymax * PH;
    const pathOf = arr => { let s = ''; let started = false; for (let i = from; i < N; i++) { if (arr[i] <= 0) { started = false; continue; } s += (started ? ' L ' : ' M ') + xs(i).toFixed(1) + ' ' + ys(arr[i]).toFixed(1); started = true; } return s.trim() || 'M 0 0'; };
    const lines = vis.slice().reverse().map(s => ({ d: pathOf(S[s.id]), color: s.color, w: s.w, dash: s.id === 'corp' ? '5 4' : 'none' }));
    let area = 'M 0 0';
    if (!st.hidden.total) area = pathOf(S.total) + ' L ' + xs(N - 1).toFixed(1) + ' ' + (Y0 + PH) + ' L ' + xs(from).toFixed(1) + ' ' + (Y0 + PH) + ' Z';
    const grid = [0, 1, 2, 3, 4].map(k => { const v = ymax * k / 4, y = ys(v); return { y: y.toFixed(1), ty: (y + 4).toFixed(1), label: svgText(Math.round(v).toLocaleString('es-CO')) }; });
    const span = N - 1 - from, xticks = [];
    for (let i = from; i < N; i++) {
      const m = sh.months[i];
      if (span <= 12) { if ((i - from) % 2 === 0) xticks.push({ x: xs(i).toFixed(1), label: svgText(m.label + ' ' + String(m.y).slice(2)) }); }
      else if (span <= 36) { if (m.m === 0 || m.m === 6) xticks.push({ x: xs(i).toFixed(1), label: svgText(m.label + ' ' + String(m.y).slice(2)) }); }
      else if (m.m === 0) xticks.push({ x: xs(i).toFixed(1), label: svgText(String(m.y)) });
    }
    const T = S.total;
    let mx = 0; for (let i = from; i < N; i++) mx = Math.max(mx, T[i]);
    const first = T[from] || T.find((v, i) => i >= from && v > 0) || 1;
    const vr = (T[N - 1] / first - 1) * 100;
    const fm = sh.months[from];
    return {
      periods: periodsDef.map(p => ({ label: p.label, pressed: p.id === cur.id ? 'true' : 'false', style: UI.seg(p.id === cur.id), pick: () => this.setState({ period: p.id }) })),
      seriesBtns: seriesDef.map(s => { const on = !st.hidden[s.id]; return { name: s.name, pressed: on ? 'true' : 'false',
        style: 'display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 12px; border-radius: 999px; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; ' + (on ? 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #1B2A3A' : 'border: 1px dashed #C9D2DC; background: #F7F9FB; color: #5B6876; text-decoration: line-through'),
        dot: 'width: 10px; height: 10px; border-radius: 50%; background: ' + (on ? s.color : '#C9D2DC'),
        toggle: () => this.setState({ hidden: { ...this.state.hidden, [s.id]: !this.state.hidden[s.id] } }) }; }),
      grid, xticks, lines, area,
      lastX: xs(N - 1).toFixed(1), lastY: st.hidden.total ? '-20' : ys(T[N - 1]).toFixed(1),
      rangeLabel: fm.label + ' ' + fm.y + ' – Sep 2026',
      sumStart: P.money(first), sumEnd: P.money(T[N - 1]), sumMax: P.money(mx),
      sumVar: (vr >= 0 ? '+' : '') + vr.toFixed(1).replace('.', ',') + ' %'
    };
  }

  // Modal de detalle dirigido por js/data/detalle-schema.js.
  detalle(p, isGrp) {
    if (!p) return null;
    const S = window.DetalleSchema, sch = S[p.tipo];
    const definido = !!sch && sch.definido !== false;
    const def = definido ? sch : S.default;
    const linea = window.CopilotoData.lineasProducto.find(l => l.id === p.linea);
    const get = (o, k) => (o[k] !== undefined ? o[k] : (o.datos || {})[k]);
    const signed = f => f === 'signedMoney' || f === 'signedPct';
    const valStyle = (v, f, size) => 'font-size: ' + size + 'px; font-weight: 800; color: ' + (signed(f) ? (v >= 0 ? '#00806B' : '#9A1F24') : '#003057');
    const campos = def.campos.map(f => { const v = get(p, f.key); return { label: f.label, val: P.fmt(v, f.fmt), style: valStyle(v, f.fmt, 18) }; });
    const mkTable = (t, rows, selectable) => {
      const cols = t.columnas;
      const tpl = 'display: grid; grid-template-columns: ' + cols.map((c, i) => i === 0 ? 'minmax(150px, 1.6fr)' : 'minmax(90px, 1fr)').join(' ') + '; gap: 12px; align-items: center';
      return {
        titulo: t.titulo,
        head: cols.map(c => ({ label: c.label, style: 'font-size: 12px; font-weight: 700; color: #4F5D6B; text-align: ' + (c.align || 'left') })),
        headStyle: tpl + '; padding: 0 12px 8px; border-bottom: 1px solid #E1E7EE',
        rows: rows.map((r, i) => {
          const on = selectable && i === this.state.row;
          return {
            pressed: on ? 'true' : 'false', pick: () => this.setState({ row: i }),
            aria: 'Ver compras de ' + (r[cols[0].key] || ''),
            style: tpl + '; width: 100%; min-height: 48px; padding: 8px 12px; box-sizing: border-box; font-family: inherit; text-align: left; color: #1B2A3A; ' +
              (selectable ? 'cursor: pointer; border-radius: 10px; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : 'border: 1px solid #EEF1F5; background: #FFFFFF') : 'border: none; border-bottom: 1px solid #F0F3F7; background: transparent'),
            cells: cols.map((c, ci) => { const v = r[c.key]; return {
              val: P.fmt(v, c.fmt), sub: c.sub ? r[c.sub] : '',
              wrap: 'display: flex; flex-direction: column; gap: 2px; min-width: 0; align-items: ' + (c.align === 'right' ? 'flex-end' : 'flex-start'),
              style: 'font-size: 13.5px; ' + (ci === 0 ? 'font-weight: 700; color: #003057' : signed(c.fmt) ? 'font-weight: 700; color: ' + (v >= 0 ? '#00664F' : '#9A1F24') : 'color: #1B2A3A')
            }; })
          };
        })
      };
    };
    let tabla = null, sub = null;
    if (def.tabla && p[def.tabla.fuente]) {
      const rows = p[def.tabla.fuente];
      tabla = mkTable(def.tabla, rows, !!def.subtabla);
      if (def.subtabla) {
        const r = rows[Math.min(this.state.row, rows.length - 1)];
        sub = mkTable(def.subtabla, r[def.subtabla.fuente] || [], false);
        sub.titulo = def.subtabla.titulo + ' · ' + (r.emisor || r.nombre || '');
      }
    }
    return {
      nombre: p.nombre, tag: p.tag, ruta: (linea ? linea.nombre : '') + ' › ' + p.nombre,
      desc: p.descripcion + (isGrp ? ' · Titular: ' + p.titular : ''),
      tagStyle: 'flex: none; width: 48px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; ' + (p.linea === 'corp' ? 'background: #EEF0D2; color: #3F410C' : 'background: ' + (linea ? linea.color : '#003057') + '; color: ' + (p.linea === 'fondos' ? '#002340' : '#FFFFFF')),
      campos, tabla, hasTabla: !!tabla, sub, hasSub: !!sub,
      selectable: !!(tabla && sub), plain: !!(tabla && !sub),
      pendiente: !definido, nota: def.nota || ''
    };
  }
}

  return Component;
};
