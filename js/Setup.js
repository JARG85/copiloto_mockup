/* Setup del cliente — lógica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Setup.dc.html la monta con una línea puente.
   Control del proceso de vinculación / onboarding: en qué etapa va cada
   cliente y qué le falta. Etapas, documentos y estados en copiloto-data.js
   (setupEtapas, setupDocumentos, setup). */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Setup = function (DCLogic, StreamableLogic, React) {

const P = window.Portafolio, UI = window.AlianzaUI;
const ESTADO = {
  completo: { label: 'Completo', bg: '#E1F5EF', fg: '#00664F' },
  pendiente: { label: 'Pendiente', bg: '#FFF4DE', fg: '#8A5300' },
  vencido: { label: 'Vencido', bg: '#FDE8E6', fg: '#9A1F24' }
};

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { f: 'all', open: null }; }
  componentDidMount() { this._unwatch = UI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

  // Une el registro de setup con el cliente de la cartera (si existe) y
  // calcula etapa actual y pendientes a partir de los documentos.
  procesos() {
    const D = window.CopilotoData, etapas = D.setupEtapas;
    return D.setup.map(s => {
      const c = s.clienteId ? P.cliente(s.clienteId) : null;
      const tipo = c ? c.tipoPersona : s.tipoPersona;
      const docs = D.setupDocumentos.filter(d => d.aplica.includes(tipo)).map(d => {
        const r = s.docs[d.id] || ['pendiente', s.inicio];
        return { ...d, estado: r[0], fecha: r[1] };
      });
      const abiertos = docs.filter(d => d.estado !== 'completo');
      const etapa = abiertos.length ? Math.min(...abiertos.map(d => d.etapa)) : etapas.length;
      return {
        ...s, cliente: c, nombre: c ? c.nombre : s.nombre, tipoPersona: tipo, segmento: c ? c.segmento : s.segmento,
        docs, pendientes: abiertos.length, vencidos: abiertos.filter(d => d.estado === 'vencido').length, etapa
      };
    });
  }

  renderVals() {
    const st = this.state, etapas = window.CopilotoData.setupEtapas;
    const all = this.procesos();
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
      ...window.AlianzaNav.shell('setup'),
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

  return Component;
};
