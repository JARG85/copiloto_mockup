/* 07 · Pensiones · consolidado operativo — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Pensiones.dc.html la monta con una linea puente.

   Consolida, para un operario de back-office, los tres productos de pensiones
   que administra Alianza Fiduciaria:
   - FPV individual: fondo de pensiones voluntarias de personas naturales.
   - FPV institucional: planes patrocinados por un empleador para sus empleados.
   - PAP: patrimonios autónomos de pensión (encargos fiduciarios con los que una
     empresa respalda su pasivo pensional / cálculo actuarial).
*/
window.AppLogic = window.AppLogic || {};
window.AppLogic.Pensiones = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { f: 'todas' }; }
  componentDidMount() { this._unwatch = window.AlianzaUI.watchFlags(this); }
  componentWillUnmount() { this._unwatch && this._unwatch(); }

  renderVals() {
    return {
      ...window.AlianzaNav.shell('pensiones'),
      ...window.AlianzaPensiones.vals(this.state.f, f => this.setState({ f }))
    };
  }
}

  return Component;
};
