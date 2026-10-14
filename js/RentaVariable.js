/* 05 · Resumen renta variable — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/RentaVariable.dc.html la monta con una linea puente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.RentaVariable = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p) { super(p); this.state = { sel: 'A' }; }
  m(v) { return '$' + v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' M'; }
  p(v) { return '$' + Math.round(v).toLocaleString('es-CO'); }
  renderVals() {
    const H = [
      { id: 'A', name: 'Emisor A', sector: 'Energía', qty: 120000, pc: 1850, pm: 2410, lots: [['14 jun 2018', 60000, 1720], ['02 abr 2020', 40000, 1600], ['11 ene 2023', 20000, 2740]] },
      { id: 'B', name: 'Emisor B', sector: 'Sector bancario', qty: 7500, pc: 31200, pm: 36800, lots: [['20 sep 2018', 5000, 30100], ['15 mar 2022', 2500, 33400]] },
      { id: 'C', name: 'Emisor C', sector: 'Infraestructura', qty: 14000, pc: 17400, pm: 15900, lots: [['08 nov 2019', 8000, 16300], ['27 jul 2024', 6000, 18867]] },
      { id: 'D', name: 'Emisor D', sector: 'Holding', qty: 18000, pc: 11200, pm: 14150, lots: [['03 feb 2021', 10000, 10400], ['19 oct 2023', 8000, 12200]] },
      { id: 'E', name: 'Emisor E', sector: 'Seguros', qty: 6000, pc: 28900, pm: 26100, lots: [['12 may 2022', 6000, 28900]] },
      { id: 'F', name: 'Emisor F', sector: 'Alimentos', qty: 2500, pc: 30000, pm: 40760, lots: [['22 ago 2019', 1500, 28500], ['09 dic 2021', 1000, 32250]] }
    ];
    let tc = 0, tm = 0;
    H.forEach(h => { h.cost = h.qty * h.pc / 1e6; h.mkt = h.qty * h.pm / 1e6; h.liqv = h.mkt * 0.994; tc += h.cost; tm += h.mkt; });
    const maxV = Math.max(...H.map(h => Math.max(h.cost, h.mkt)));
    const sel = this.state.sel;
    const plS = (v, fs) => 'font-size: ' + fs + 'px; font-weight: 700; color: ' + (v >= 0 ? '#00806B' : '#9A1F24');
    const sgn = v => (v >= 0 ? '+' : '−');
    const rows = H.map(h => { const pl = h.mkt - h.cost, pct = pl / h.cost * 100, on = sel === h.id; return {
      name: h.name, sector: h.sector, qty: h.qty.toLocaleString('es-CO'), cost: this.m(h.cost), mkt: this.m(h.mkt), pm: this.p(h.pm), liq: this.m(h.liqv),
      pl: sgn(pl) + this.m(Math.abs(pl)).slice(0), plPct: sgn(pct) + Math.abs(pct).toFixed(1).replace('.', ',') + ' %',
      plStyle: plS(pl, 13), weight: Math.round(h.mkt / tm * 100) + ' %',
      wBar: 'height: 100%; background: #0072CE; width: ' + (h.mkt / tm * 100 / 25 * 100).toFixed(0) + '%',
      costBar: 'height: 10px; border-radius: 3px; background: #9FB4C8; width: ' + (h.cost / maxV * 100).toFixed(1) + '%',
      mktBar: 'height: 14px; border-radius: 3px; background: ' + (pl >= 0 ? '#0072CE' : '#D57E00') + '; width: ' + (h.mkt / maxV * 100).toFixed(1) + '%',
      pressed: on ? 'true' : 'false', tr: on ? 'background: #F2F8FD' : 'background: #FFFFFF',
      wrap: 'display: flex; align-items: center; gap: 16px; width: 100%; padding: 10px 12px; border-radius: 12px; font-family: inherit; text-align: left; cursor: pointer; ' + (on ? 'border: 2px solid #0072CE; background: #F2F8FD' : 'border: 1px solid #EEF1F5; background: #FFFFFF'),
      pick: () => this.setState({ sel: h.id }) }; });
    const h = H.find(x => x.id === sel), pl = h.mkt - h.cost;
    const d = { name: h.name, sector: h.sector, qty: h.qty.toLocaleString('es-CO'), weight: Math.round(h.mkt / tm * 100) + ' %',
      pc: this.p(h.pc), pm: this.p(h.pm), pl: sgn(pl) + this.m(Math.abs(pl)), plStyle: plS(pl, 15), liq: this.m(h.liqv),
      lots: h.lots.map(l => ({ date: l[0], qty: l[1].toLocaleString('es-CO'), price: this.p(l[2]), val: this.m(l[1] * l[2] / 1e6) })) };
    const tpl = tm - tc;
    const t = { cost: this.m(tc), mkt: this.m(tm), pl: '+' + this.m(tpl), plPct: '+' + (tpl / tc * 100).toFixed(1).replace('.', ',') + ' %', liq: this.m(tm * 0.994) };
    return { rows, d, t };
  }
}

  return Component;
};
