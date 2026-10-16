/* Mi cartera — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Cartera.dc.html la monta con una línea puente.
   Listado general de los clientes del asesor; desde aquí se entra a la
   Vista 360 de cada uno. Las cifras salen de js/portafolio.js. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Cartera = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI;

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { q: '', seg: 'all', sort: 'saldo' }; }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

  renderVals() {
    const st = this.state, D = window.CopilotoData;
    const cart = P.cartera(), all = cart.clientes;
    const fRiesgo = window.AlianzaFlags.get('carteraRiesgo');
    const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = norm(st.q.trim());
    const listed = all
      .filter(c => st.seg === 'all' || c.segmento === st.seg)
      .filter(c => !q || norm(c.nombre + ' ' + c.documento).includes(q))
      .sort((a, b) => st.sort === 'contacto' ? b.diasSinContacto - a.diasSinContacto : st.sort === 'nombre' ? a.nombre.localeCompare(b.nombre) : b.saldo - a.saldo);

    const segs = [{ id: 'all', label: 'Todos' }, { id: 'Patrimonial', label: 'Patrimonial' }, { id: 'Preferente', label: 'Preferente' }, { id: 'Empresarial', label: 'Empresarial' }]
      .map(s => ({ label: s.label + ' · ' + (s.id === 'all' ? all.length : all.filter(c => c.segmento === s.id).length), pressed: st.seg === s.id ? 'true' : 'false', style: UI.pill(st.seg === s.id), pick: () => this.setState({ seg: s.id }) }));
    const sorts = [{ id: 'saldo', label: 'Saldo' }, { id: 'contacto', label: 'Días sin contacto' }, { id: 'nombre', label: 'Nombre' }]
      .map(s => ({ label: s.label, pressed: st.sort === s.id ? 'true' : 'false', style: UI.seg(st.sort === s.id), pick: () => this.setState({ sort: s.id }) }));

    const grupos = {};
    D.grupos.forEach(g => { grupos[g.id] = g.nombre.replace('Grupo familiar ', ''); });
    const rows = listed.map(c => {
      const lin = c.lineas.map(l => ({ title: l.nombre + (l.productos.length ? ': ' + P.money(l.saldo) : ': sin productos'),
        style: 'width: 14px; height: 14px; border-radius: 4px; background: ' + (l.productos.length ? l.color : '#E1E7EE') }));
      return {
        nombre: c.nombre, iniciales: c.iniciales,
        sub: c.documento + ' · ' + c.segmento,
        grupo: c.grupo ? 'Grupo ' + grupos[c.grupo] + ' · ' + c.relacion : '',
        perfil: c.perfil, perfilVencido: c.diasPerfil > 365,
        saldo: P.money(c.saldo), rent: P.signedPct(c.rentPct), rentChip: UI.rentChip(c.rentPct),
        productos: c.productos.length + (c.productos.length === 1 ? ' producto' : ' productos'), lineas: lin,
        contacto: c.ultimoContacto ? P.fechaCorta(c.ultimoContacto) : '—',
        contactoSub: 'hace ' + c.diasSinContacto + ' días',
        contactoStyle: 'font-size: 12px; font-weight: 600; color: ' + (c.diasSinContacto >= 30 ? '#8A5300' : '#4F5D6B'),
        riesgo: c.riesgo.d60 + ' · ' + c.nivel.label, riesgoStyle: UI.riesgoChip(c.riesgo.d60),
        href: 'Vista360.dc.html?cliente=' + c.id, aria: 'Abrir Vista 360 de ' + c.nombre
      };
    });

    const invertido = cart.invertido;
    const sinContacto = all.filter(c => c.diasSinContacto >= 30).length;
    return {
      ...window.AlianzaNav.shell('cartera'),
      fRiesgo,
      gridCols: 'display: grid; grid-template-columns: minmax(260px, 2.6fr) 110px 110px 104px 96px 120px' + (fRiesgo ? ' 110px' : '') + ' 120px; gap: 14px; align-items: center',
      kpi: {
        clientes: String(all.length), clientesSub: D.grupos.length + ' grupo familiar · ' + all.filter(c => c.tipoPersona === 'PJ').length + ' personas jurídicas',
        saldo: P.money(cart.saldo), saldoSub: all.reduce((a, c) => a + c.productos.length, 0) + ' productos en 4 líneas',
        rent: P.signedPct(P.rent(cart.saldo, invertido)), rentSub: P.signedMoney(cart.saldo - invertido) + ' sobre lo invertido',
        sinContacto: String(sinContacto), sinContactoSub: 'clientes sin contacto en 30 días o más'
      },
      q: st.q, onSearch: e => this.setState({ q: e.target.value }),
      segs, sorts, rows, count: rows.length + ' de ' + all.length + ' clientes', empty: rows.length === 0
    };
  }
}

  return Component;
};
