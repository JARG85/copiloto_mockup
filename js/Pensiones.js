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

  money(v) { return '$' + v.toLocaleString('es-CO') + ' M'; }

  renderVals() {
    // ---- Líneas de producto ----
    const LINES = [
      { id: 'fpvi', tag: 'FPV individual', name: 'FPV individual', color: '#0072CE', saldo: 102400, count: 3180 },
      { id: 'fpve', tag: 'FPV institucional', name: 'FPV institucional (empresas)', color: '#00A3E0', saldo: 58900, count: 1046 },
      { id: 'pap', tag: 'PAP', name: 'Patrimonios autónomos de pensión (PAP)', color: '#9AA300', saldo: 25100, count: 86 }
    ];
    const totalSaldo = LINES.reduce((s, l) => s + l.saldo, 0);
    const totalCount = LINES.reduce((s, l) => s + l.count, 0);
    const lines = LINES.map(l => ({
      name: l.name, saldo: this.money(l.saldo), count: l.count.toLocaleString('es-CO'),
      pct: Math.round(l.saldo / totalSaldo * 100) + ' %',
      dot: 'width: 10px; height: 10px; border-radius: 50%; background: ' + l.color + '; flex: none',
      bar: 'height: 100%; border-radius: 4px; background: ' + l.color + '; width: ' + (l.saldo / totalSaldo * 100).toFixed(1) + '%'
    }));

    // ---- Bandeja de solicitudes (vista de un operario) ----
    const ESTADO_STYLE = {
      'Pendiente documentos': 'background: #FFF4DE; color: #8A5300',
      'En validación': 'background: #E3F1FB; color: #0B4A75',
      'Lista para aplicar': 'background: #E1F5EF; color: #00664F',
      'Vencida': 'background: #FDE8E6; color: #9A1F24'
    };
    const estadoChip = e => 'display: inline-flex; min-width: 150px; justify-content: center; font-size: 12.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; ' + ESTADO_STYLE[e];
    const NIVEL_STYLE = { alto: 'background: #FDE8E6; color: #9A1F24', medio: 'background: #FFF4DE; color: #8A5300', bajo: 'background: #E1F5EF; color: #00664F' };
    const venceChip = n => 'display: inline-flex; min-width: 108px; justify-content: center; font-size: 12.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; ' + NIVEL_STYLE[n];
    const LINE_TAG = { fpvi: 'FPV individual', fpve: 'FPV institucional', pap: 'PAP' };

    const Q = [
      { nombre: 'Carlos Andrés Mejía', linea: 'fpvi', tipoKey: 'retiro', tipo: 'Retiro parcial', estado: 'Pendiente documentos', vence: 'Vence hoy', nivel: 'alto' },
      { nombre: 'Constructora Altamar SAS', linea: 'pap', tipoKey: 'otras', tipo: 'Certificado de cálculo actuarial', estado: 'En validación', vence: 'Vence en 2 días', nivel: 'medio' },
      { nombre: 'Lucía Fernanda Ospina', linea: 'fpvi', tipoKey: 'perfil', tipo: 'Cambio de perfil de riesgo', estado: 'Lista para aplicar', vence: 'Vence en 1 día', nivel: 'alto' },
      { nombre: 'Comercializadora del Valle SAS', linea: 'fpve', tipoKey: 'otras', tipo: 'Vinculación de nuevo beneficiario', estado: 'Pendiente documentos', vence: 'Vence hoy', nivel: 'alto' },
      { nombre: 'Jorge Iván Castaño', linea: 'fpvi', tipoKey: 'retiro', tipo: 'Retiro total (traslado de entidad)', estado: 'En validación', vence: 'Vence en 3 días', nivel: 'medio' },
      { nombre: 'Textiles Andinos SAS', linea: 'pap', tipoKey: 'otras', tipo: 'Aporte extraordinario patronal', estado: 'Lista para aplicar', vence: 'Vence en 4 días', nivel: 'bajo' },
      { nombre: 'Marta Cecilia Arango', linea: 'fpvi', tipoKey: 'certificado', tipo: 'Certificado para declaración de renta', estado: 'Vencida', vence: 'Venció hace 1 día', nivel: 'alto' },
      { nombre: 'Andrés Felipe Rojas', linea: 'fpve', tipoKey: 'retiro', tipo: 'Retiro parcial', estado: 'Pendiente documentos', vence: 'Vence en 2 días', nivel: 'medio' },
      { nombre: 'Familia Jaramillo Soto', linea: 'fpvi', tipoKey: 'certificado', tipo: 'Certificado de aportes y rendimientos', estado: 'Lista para aplicar', vence: 'Vence en 5 días', nivel: 'bajo' }
    ];
    const f = this.state.f;
    const queue = Q.filter(q => f === 'todas' ? true : q.tipoKey === f)
      .map(q => ({ ...q, lineaTag: LINE_TAG[q.linea], estadoStyle: estadoChip(q.estado), venceStyle: venceChip(q.nivel) }));
    const filterDefs = [
      { id: 'todas', label: 'Todas' }, { id: 'retiro', label: 'Retiros' },
      { id: 'certificado', label: 'Certificados' }, { id: 'perfil', label: 'Cambios de perfil' },
      { id: 'otras', label: 'Otras gestiones' }
    ];
    const filters = filterDefs.map(d => {
      const on = d.id === f;
      return {
        label: d.label, pressed: on ? 'true' : 'false',
        style: 'height: 40px; padding: 0 14px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; ' +
          (on ? 'border: 1px solid #003057; background: #003057; color: #FFFFFF' : 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #3D4C5B'),
        pick: () => this.setState({ f: d.id })
      };
    });

    // ---- Vencimientos de permanencia / beneficio tributario (FPV) ----
    const NIVEL_LABEL = { alto: 'Vence pronto', medio: 'Por vencer', bajo: 'Sin urgencia' };
    const V = [
      { nombre: 'Carlos Andrés Mejía', linea: 'fpvi', saldo: 420, desde: 'mar 2016', dias: 18, nivel: 'alto' },
      { nombre: 'Lucía Fernanda Ospina', linea: 'fpvi', saldo: 210, desde: 'ene 2017', dias: 46, nivel: 'medio' },
      { nombre: 'Jorge Iván Castaño', linea: 'fpvi', saldo: 95, desde: 'jul 2019', dias: 7, nivel: 'alto' },
      { nombre: 'Marta Cecilia Arango', linea: 'fpvi', saldo: 180, desde: 'sep 2014', dias: 128, nivel: 'bajo' },
      { nombre: 'Andrés Felipe Rojas', linea: 'fpve', saldo: 64, desde: 'nov 2020', dias: 61, nivel: 'medio' }
    ];
    const vencimientos = V.map(v => ({
      nombre: v.nombre, lineaTag: LINE_TAG[v.linea], saldo: this.money(v.saldo), desde: v.desde,
      diasLabel: v.dias + ' días', estadoLabel: NIVEL_LABEL[v.nivel], estadoStyle: venceChip(v.nivel)
    }));

    return {
      afiliados: totalCount.toLocaleString('es-CO'),
      saldoTotal: this.money(totalSaldo),
      aportesMes: this.money(5230),
      solicitudesPendientes: '38',
      lines, queue, filters, vencimientos
    };
  }
}

  return Component;
};
