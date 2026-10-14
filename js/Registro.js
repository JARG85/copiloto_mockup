/* 02 · Solicitud de registro — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Registro.dc.html la monta con una linea puente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Registro = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p){ super(p); this.state = { role: 'asesor' }; }
  renderVals() {
    const list = [
      { id: 'asesor', name: 'Asesor comercial', desc: 'Vista 360, alertas y copiloto sobre su cartera.' },
      { id: 'gerente', name: 'Gerente de oficina', desc: 'Carteras del equipo y tablero de riesgo de fuga.' },
      { id: 'admin', name: 'Administrador de portafolio', desc: 'Composición, renta variable y simulaciones.' },
      { id: 'riesgo', name: 'Riesgo y cumplimiento', desc: 'Consulta de suitability y bitácora de decisiones.' }
    ];
    const base = 'display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; padding: 16px; border-radius: 12px; font-family: inherit; cursor: pointer; min-height: 96px; ';
    return {
      roles: list.map(r => {
        const sel = this.state.role === r.id;
        return { ...r, selected: sel ? 'true' : 'false',
          style: base + (sel ? 'border: 2px solid #0072CE; background: #EEF4FA;' : 'border: 1px solid #D5DDE6; background: #FFFFFF;'),
          pick: () => this.setState({ role: r.id }) };
      })
    };
  }
}

  return Component;
};
