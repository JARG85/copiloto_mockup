/* 06 · Mi cartera · Riesgo de fuga — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Cartera.dc.html la monta con una linea puente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Cartera = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { f: 'alto' }; }
  renderVals() {
    const col = v => v >= 65 ? '#B3272D' : v >= 40 ? '#D57E00' : '#00A98E';
    const chip = v => 'display: inline-flex; min-width: 64px; justify-content: center; font-size: 12.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; ' + (v >= 65 ? 'background: #FDE8E6; color: #9A1F24' : v >= 40 ? 'background: #FFF4DE; color: #8A5300' : 'background: #E1F5EF; color: #00664F');
    const lab = v => v + (v >= 65 ? ' · Alto' : v >= 40 ? ' · Medio' : ' · Bajo');
    const C = [
      { name: 'Carlos Andrés Mejía', seg: 'Patrimonial', prof: 'Moderado', aum: 4820, c30: 58, c60: 72, off: true, factor: 'Retiro de $310 M el 22 sep', nba: 'Llamada de retención' },
      { name: 'Constructora Altamar SAS', seg: 'Empresarial', prof: 'Conservador', aum: 6150, c30: 61, c60: 69, off: false, factor: 'Cotizó con otra fiduciaria', nba: 'Reunión con gerente' },
      { name: 'Lucía Fernanda Ospina', seg: 'Patrimonial', prof: 'Moderado', aum: 2310, c30: 49, c60: 67, off: false, factor: 'Saldo cae 4 meses seguidos', nba: 'Revisión de estrategia' },
      { name: 'Jorge Iván Castaño', seg: 'Preferente', prof: 'Mayor riesgo', aum: 980, c30: 52, c60: 66, off: true, factor: 'Rentabilidad bajo referencia', nba: 'Propuesta de rebalanceo' },
      { name: 'Comercializadora del Valle SAS', seg: 'Empresarial', prof: 'Conservador', aum: 3400, c30: 44, c60: 58, off: false, factor: 'Uso del portal en descenso', nba: 'Contacto de seguimiento' },
      { name: 'Marta Cecilia Arango', seg: 'Patrimonial', prof: 'Conservador', aum: 1760, c30: 31, c60: 47, off: true, factor: 'Exposición alta a acciones', nba: 'Suitability asistida' },
      { name: 'Andrés Felipe Rojas', seg: 'Preferente', prof: 'Moderado', aum: 640, c30: 22, c60: 35, off: true, factor: 'Perfil vencido', nba: 'Actualizar perfil' },
      { name: 'Familia Duarte Pinzón', seg: 'Patrimonial', prof: 'Moderado', aum: 5200, c30: 12, c60: 18, off: false, factor: 'Sin señales relevantes', nba: 'Profundizar: nuevo encargo' }
    ];
    const f = this.state.f;
    const keep = c => f === 'all' ? true : f === 'alto' ? c.c60 >= 65 : f === 'medio' ? (c.c60 >= 40 && c.c60 < 65) : c.off;
    const rows = C.filter(keep).sort((a, b) => b.c60 * b.aum - a.c60 * a.aum).map(c => ({ ...c, aum: '$' + c.aum.toLocaleString('es-CO') + ' M', s30: chip(c.c30), s60: chip(c.c60), c30: lab(c.c30), c60: lab(c.c60) }));
    const defs = [{ id: 'alto', label: 'Riesgo alto' }, { id: 'medio', label: 'Riesgo medio' }, { id: 'off', label: 'Fuera de perfil' }, { id: 'all', label: 'Todos' }];
    const filters = defs.map(d => { const on = d.id === f; return { label: d.label, pressed: on ? 'true' : 'false',
      style: 'height: 40px; padding: 0 14px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ' + (on ? 'border: 1px solid #003057; background: #003057; color: #FFFFFF' : 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #3D4C5B'),
      pick: () => this.setState({ f: d.id }) }; });

    const X = s => 60 + s / 100 * 564, Y = a => 296 - Math.min(a, 7000) / 7000 * 280;
    const dots = [];
    for (let i = 0; i < 60; i++) {
      const s = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1) * 100;
      const sc = Math.pow(s / 100, 1.6) * 100;
      const a = 150 + Math.abs((Math.sin(i * 78.233) * 12345.678) % 1) * 3800;
      dots.push({ x: X(sc).toFixed(1), y: Y(a).toFixed(1), r: (4 + a / 900).toFixed(1), c: col(sc) });
    }
    C.forEach(c => dots.push({ x: X(c.c60).toFixed(1), y: Y(c.aum).toFixed(1), r: (4 + c.aum / 900).toFixed(1), c: col(c.c60) }));
    const me = { x: X(72).toFixed(1), y: Y(4820).toFixed(1), tx: (X(72) - 16).toFixed(1), ty: (Y(4820) + 4).toFixed(1) };

    const R = [['Retiros parciales recientes', 5], ['Rentabilidad bajo referencia', 4], ['Menor interacción con el asesor', 4], ['Consulta de tasas en otra entidad', 3], ['Perfil de riesgo vencido', 2]];
    const reasons = R.map(r => ({ name: r[0], n: r[1], bar: 'height: 100%; border-radius: 4px; background: #0072CE; width: ' + (r[1] / 5 * 100) + '%' }));
    return { rows, filters, dots, me, reasons };
  }
}

  return Component;
};
