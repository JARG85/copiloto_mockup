/* Campañas comerciales — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Campanas.dc.html la monta con una línea puente.
   El área comercial lanza una campaña para impulsar un producto; una regla
   de negocio (copiloto-data.js → campanas[].prueba) decide qué clientes de
   la cartera encajan. Distinto de la recomendación general de productos.
   Las campañas transaccionales quedan para v2. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Campanas = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI;

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { open: null }; }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

  renderVals() {
    const D = window.CopilotoData, all = P.clientes();
    const camp = D.campanas.map(k => {
      const linea = D.lineasProducto.find(l => l.id === k.linea);
      const elegibles = all.filter(c => k.prueba(c)).sort((a, b) => b.saldo - a.saldo);
      const restan = P.dias(D.corte, k.hasta);
      return { ...k, linea, elegibles, restan };
    });
    const unicos = new Set([].concat(...camp.map(k => k.elegibles.map(c => c.id))));
    const cards = camp.map(k => ({
      nombre: k.nombre, producto: k.producto, area: k.area,
      lineaNombre: k.linea.nombre, lineaStyle: 'flex: none; width: 6px; align-self: stretch; border-radius: 3px; background: ' + k.linea.color,
      vigencia: P.fecha(k.desde) + ' – ' + P.fecha(k.hasta), restan: k.restan >= 0 ? 'Quedan ' + k.restan + ' días' : 'Finalizada',
      n: String(k.elegibles.length), nLabel: k.elegibles.length === 1 ? 'cliente elegible' : 'clientes elegibles',
      aria: 'Ver regla y clientes de ' + k.nombre,
      abrir: () => { this.setState({ open: k.id }); window.AlianzaModal.open(() => this.setState({ open: null })); }
    }));
    const sel = camp.find(k => k.id === this.state.open);
    const modal = sel ? {
      nombre: sel.nombre, producto: sel.producto, area: sel.area, regla: sel.regla,
      vigencia: P.fecha(sel.desde) + ' – ' + P.fecha(sel.hasta),
      n: sel.elegibles.length + (sel.elegibles.length === 1 ? ' cliente de tu cartera encaja' : ' clientes de tu cartera encajan'),
      vacio: sel.elegibles.length === 0,
      clientes: sel.elegibles.map(c => {
        const tel = c.contacto.telefonos.find(t => t.preferido) || c.contacto.telefonos[0];
        return {
          nombre: c.nombre, sub: c.segmento + ' · perfil ' + c.perfil, saldo: P.money(c.saldo), dato: sel.dato(c),
          contacto: tel.numero, telHref: 'tel:' + tel.numero.replace(/\s/g, ''), telAria: 'Llamar a ' + c.nombre,
          href: 'Vista360.dc.html?cliente=' + c.id, hrefAria: 'Abrir Vista 360 de ' + c.nombre
        };
      })
    } : null;
    return {
      ...window.AlianzaNav.shell('campanas'),
      kpi: { activas: String(camp.filter(k => k.restan >= 0).length), elegibles: String(unicos.size), saldo: P.money(P.sum(all.filter(c => unicos.has(c.id)), 'saldo')) },
      cards, modal, close: () => window.AlianzaModal.close()
    };
  }
}

  return Component;
};
