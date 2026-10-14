/* 03 · Vista Cliente 360 — logica del componente (dc-runtime).
   Se registra en window.AppLogic; pages/Vista360.dc.html la monta con una linea puente. */
window.AppLogic = window.AppLogic || {};
window.AppLogic.Vista360 = function (DCLogic, StreamableLogic, React) {

class Component extends DCLogic {
  constructor(p) {
    super(p);
    this.state = { period: 'all', group: false, hidden: {}, nba: {} };
    this.data = this.buildSeries();
    // Repinta cuando el panel oculto de feature flags cambia algo (p. ej.
    // showNBA), para que renderVals() vuelva a leer AlianzaFlags.get(...).
    this._onFlagsChanged = () => this.forceUpdate();
  }
  componentDidMount() {
    window.addEventListener(window.AlianzaFlags.CHANGE_EVENT, this._onFlagsChanged);
  }
  componentWillUnmount() {
    window.removeEventListener(window.AlianzaFlags.CHANGE_EVENT, this._onFlagsChanged);
  }
  buildSeries() {
    const n = 127, out = { months: [], s: {} };
    const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    for (let i = 0; i < n; i++) { const m = (2 + i) % 12, y = 2016 + Math.floor((2 + i) / 12); out.months.push({ m, y, label: names[m] }); }
    const nz = (i, k) => Math.sin(i * 0.7 + k) * 0.025 + Math.sin(i * 0.23 + k * 2) * 0.035;
    const ramp = (i, s) => i < s ? 0 : (i - s) / (n - 1 - s);
    const L = [], R = [], B = [], A = [], X = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), last = i === n - 1;
      const ret = (i >= 118 && i < 126) ? (i - 117) / 8 : 0;
      L.push(last ? 868 : 868 * (0.9 + 0.2 * Math.sin(i * 0.12) + 0.1 * t + nz(i, 1)) + 210 * ret);
      R.push(last ? 1639 : 1639 * (0.42 + 0.58 * Math.pow(t, 0.9) + nz(i, 2) * 0.6) + 100 * ret);
      B.push(i < 18 ? 0 : (last ? 675 : 675 * (0.3 + 0.7 * ramp(i, 18) + nz(i, 3))));
      const covid = 1 - 0.32 * Math.exp(-Math.pow((i - 48) / 3, 2));
      A.push(i < 30 ? 0 : (last ? 1301 : 1301 * (0.25 + 0.75 * ramp(i, 30) + nz(i, 4) * 2) * covid));
      X.push(i < 60 ? 0 : (last ? 337 : 337 * (0.6 + 0.4 * ramp(i, 60) + nz(i, 5) * 0.5)));
    }
    const T = L.map((v, i) => v + R[i] + B[i] + A[i] + X[i]);
    out.s = { total: T, liq: L, rf: R, bal: B, acc: A, alt: X };
    return out;
  }
  fmt(v) { return '$' + Math.round(v).toLocaleString('es-CO') + ' M'; }
  arc(a0, a1) {
    const cx = 110, cy = 110, r = 90;
    const p = a => [cx - r * Math.cos(a * Math.PI), cy - r * Math.sin(a * Math.PI)];
    const s = p(a0), e = p(a1);
    return 'M ' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A 90 90 0 0 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
  }
  renderVals() {
    const st = this.state, d = this.data;
    const btn = on => 'height: 40px; padding: 0 14px; border-radius: 9px; border: none; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ' + (on ? 'background: #003057; color: #FFFFFF;' : 'background: transparent; color: #3D4C5B;');

    const periodsDef = [{ id: '1y', label: '1A', n: 12 }, { id: '3y', label: '3A', n: 36 }, { id: '5y', label: '5A', n: 60 }, { id: 'all', label: 'Desde vinculación', n: 126 }];
    const cur = periodsDef.find(p => p.id === st.period);
    const N = d.months.length, from = N - 1 - cur.n;

    const seriesDef = [
      { id: 'total', name: 'Portafolio total', color: '#003057', w: 3 },
      { id: 'rf', name: 'Renta fija', color: '#0072CE', w: 2 },
      { id: 'acc', name: 'Acciones', color: '#D57E00', w: 2 },
      { id: 'liq', name: 'FIC Liquidez', color: '#00A3E0', w: 2 },
      { id: 'bal', name: 'Balanceados', color: '#00A98E', w: 2 },
      { id: 'alt', name: 'Alternativos', color: '#999B30', w: 2 }
    ];
    const vis = seriesDef.filter(s => !st.hidden[s.id]);
    let ymax = 0;
    vis.forEach(s => { for (let i = from; i < N; i++) ymax = Math.max(ymax, d.s[s.id][i]); });
    if (ymax === 0) ymax = 1000;
    const step = Math.pow(10, Math.floor(Math.log10(ymax))) / 2;
    ymax = Math.ceil(ymax / step) * step;
    const X0 = 56, PW = 688, Y0 = 16, PH = 228;
    const xs = i => X0 + (i - from) / (N - 1 - from) * PW;
    const ys = v => Y0 + PH - v / ymax * PH;
    const pathOf = arr => { let s = ''; let started = false; for (let i = from; i < N; i++) { if (arr[i] <= 0) { started = false; continue; } s += (started ? ' L ' : ' M ') + xs(i).toFixed(1) + ' ' + ys(arr[i]).toFixed(1); started = true; } return s.trim() || 'M 0 0'; };
    const lines = vis.slice().reverse().map(s => ({ d: pathOf(d.s[s.id]), color: s.color, w: s.w, dash: s.id === 'alt' ? '5 4' : 'none' }));
    let area = 'M 0 0';
    if (!st.hidden.total) { area = pathOf(d.s.total) + ' L ' + xs(N - 1).toFixed(1) + ' ' + (Y0 + PH) + ' L ' + xs(from).toFixed(1) + ' ' + (Y0 + PH) + ' Z'; }
    const grid = [0, 1, 2, 3, 4].map(k => { const v = ymax * k / 4, y = ys(v); return { y: y.toFixed(1), ty: (y + 4).toFixed(1), label: Math.round(v).toLocaleString('es-CO') }; });
    const xticks = [];
    for (let i = from; i < N; i++) {
      const m = d.months[i];
      if (cur.n <= 12) { if ((i - from) % 2 === 0) xticks.push({ x: xs(i).toFixed(1), label: m.label + ' ' + String(m.y).slice(2) }); }
      else if (cur.n <= 36) { if (m.m === 0 || m.m === 6) xticks.push({ x: xs(i).toFixed(1), label: m.label + ' ' + String(m.y).slice(2) }); }
      else if (m.m === 0) xticks.push({ x: xs(i).toFixed(1), label: String(m.y) });
    }
    const T = d.s.total;
    let mx = 0; for (let i = from; i < N; i++) mx = Math.max(mx, T[i]);
    const vr = (T[N - 1] / T[from] - 1) * 100;
    const fm = d.months[from];

    const comp = [
      { name: 'Renta fija', v: 1639, color: '#0072CE' },
      { name: 'Acciones', v: 1301, color: '#003057' },
      { name: 'FIC Liquidez', v: 868, color: '#00A3E0' },
      { name: 'Balanceados', v: 675, color: '#00A98E' },
      { name: 'Alternativos', v: 337, color: '#D2D755' }
    ];
    const compG = [
      { name: 'Renta fija', v: 4210, color: '#0072CE' },
      { name: 'Acciones', v: 2350, color: '#003057' },
      { name: 'FIC Liquidez', v: 2120, color: '#00A3E0' },
      { name: 'Balanceados', v: 1420, color: '#00A98E' },
      { name: 'Alternativos', v: 1660, color: '#D2D755' }
    ];
    const cset = st.group ? compG : comp;
    const tot = cset.reduce((a, c) => a + c.v, 0), C = 2 * Math.PI * 70;
    let acc = 0;
    const donut = cset.map(c => { const len = c.v / tot * C; const o = { name: c.name, color: c.color, val: this.fmt(c.v), pct: Math.round(c.v / tot * 100) + '%', dash: (len - 2).toFixed(1) + ' ' + (C - len + 2).toFixed(1), offset: (-acc).toFixed(1), sw: 'width: 14px; height: 14px; border-radius: 4px; flex: none; background: ' + c.color }; acc += len; return o; });

    const alignDef = [
      { name: 'Conservador', actual: 18, lo: 30, hi: 50 },
      { name: 'Moderado', actual: 48, lo: 30, hi: 50 },
      { name: 'Mayor riesgo', actual: 34, lo: 10, hi: 25 }
    ];
    const align = alignDef.map(a => { const ok = a.actual >= a.lo && a.actual <= a.hi; const col = ok ? '#003057' : '#D57E00'; return {
      name: a.name, actual: a.actual, range: a.lo + '–' + a.hi + ' %',
      valStyle: 'color: ' + (ok ? '#003057' : '#8A5300'),
      bandStyle: 'position: absolute; top: 0; bottom: 0; left: ' + a.lo + '%; width: ' + (a.hi - a.lo) + '%; background: #C9E3F6; border: 1px dashed #0072CE; border-radius: 6px; box-sizing: border-box',
      barStyle: 'position: absolute; top: 4px; height: 8px; left: 0; width: ' + a.actual + '%; background: ' + col + '; border-radius: 4px',
      markStyle: 'position: absolute; top: -4px; width: 4px; height: 24px; left: calc(' + a.actual + '% - 2px); background: ' + col + '; border-radius: 2px' }; });

    const g = 72 / 100;
    const nx = 110 - 70 * Math.cos(g * Math.PI), ny = 110 - 70 * Math.sin(g * Math.PI);
    const gauge = { low: this.arc(0.0, 0.40), mid: this.arc(0.40, 0.65), high: this.arc(0.65, 1.0), nx: nx.toFixed(1), ny: ny.toFixed(1) };

    const factorsDef = [
      { name: 'Retiro parcial de $310 M (22 sep)', v: 18 },
      { name: 'Saldo en caída 3 meses consecutivos', v: 12 },
      { name: 'Rentabilidad renta fija bajo referencia 2 trimestres', v: 9 },
      { name: 'Consulta a tasas de CDT en última llamada', v: 6 },
      { name: 'Relación de más de 10 años con Alianza', v: -7 },
      { name: 'Grupo familiar con 5 productos activos', v: -5 }
    ];
    const factors = factorsDef.map(f => ({ name: f.name, val: (f.v > 0 ? '+' : '') + f.v,
      valStyle: 'text-align: right; font-size: 13.5px; color: ' + (f.v > 0 ? '#9A1F24' : '#00806B'),
      bar: 'position: absolute; top: 0; bottom: 0; border-radius: 5px; ' + (f.v > 0 ? 'left: 50%; width: ' + (f.v / 20 * 50) + '%; background: #B3272D' : 'right: 50%; width: ' + (-f.v / 20 * 50) + '%; background: #00A98E') }));

    const nbaDef = [
      { id: 'a', title: 'Llamada de retención esta semana', tag: 'Retención', why: 'Riesgo de fuga alto y retiro reciente. Propón revisión de la estrategia de renta fija antes de que traslade más saldo.', ev: 'modelo de fuga, movimientos, CRM', conf: '86 %' },
      { id: 'b', title: 'Rebalanceo hacia el perfil Moderado', tag: 'Idoneidad', why: 'Reducir mayor riesgo de 34 % a máximo 25 % y subir la porción conservadora. Requiere tu validación en suitability.', ev: 'perfil oficial, extracto sep-2026', conf: '81 %' },
      { id: 'c', title: 'Renovación del encargo de la SAS', tag: 'Profundización', why: 'El encargo fiduciario de Inversiones Mejía SAS vence el 18 nov. Anticipa la renovación en la misma reunión.', ev: 'contratos, grupo familiar', conf: '74 %' }
    ];
    let done = 0;
    const nba = nbaDef.map((n, i) => {
      const s = st.nba[n.id]; if (s) done++;
      const tagCol = n.tag === 'Retención' ? 'background: #FDE8E6; color: #9A1F24' : n.tag === 'Idoneidad' ? 'background: #FFF4DE; color: #8A5300' : 'background: #E3F1FB; color: #004E8C';
      return { ...n, rank: i + 1, pending: !s, decided: !!s,
        status: s === 'ok' ? 'Aceptada · registrada en bitácora' : 'Descartada · motivo registrado',
        statusStyle: 'font-size: 13px; font-weight: 700; padding: 8px 12px; border-radius: 8px; ' + (s === 'ok' ? 'background: #E1F5EF; color: #00664F' : 'background: #F2F5F9; color: #4F5D6B'),
        card: 'border: 1px solid ' + (s ? '#E6EBF1' : '#D5DDE6') + '; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: ' + (s ? '#FAFBFC' : '#FFFFFF'),
        rankStyle: 'flex: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; ' + (i === 0 ? 'background: #003057; color: #FFFFFF' : 'background: #EEF4FA; color: #003057'),
        tagStyle: 'font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; ' + tagCol,
        accept: () => this.setState({ nba: { ...this.state.nba, [n.id]: 'ok' } }),
        discard: () => this.setState({ nba: { ...this.state.nba, [n.id]: 'no' } }) };
    });

    const k = st.group
      ? { aumLabel: 'Saldo administrado del grupo', aum: '$11.760 M', aumShort: '11.760', aumSub: '5 cuentas · 2 personas jurídicas', ret: '+52,1 %', retSub: 'Rentabilidad ponderada del grupo', flow: '−$290 M', flowSub: 'Retiro $310 M · aporte SAS $20 M', churn: '64' }
      : { aumLabel: 'Saldo total administrado', aum: '$4.820 M', aumShort: '4.820', aumSub: '7 productos · 4 alternativas', ret: '+58,4 %', retSub: 'Acumulada desde mar 2016', flow: '−$310 M', flowSub: 'Retiro FIC Liquidez · 22 sep', churn: '72' };

    const IC = { rf: { name: 'Renta fija', color: '#0072CE', tag: 'RF' }, acc: { name: 'Acciones', color: '#003057', tag: 'ACC' }, liq: { name: 'FIC Liquidez', color: '#00A3E0', tag: 'FIC' }, bal: { name: 'Balanceados', color: '#00A98E', tag: 'BAL' }, alt: { name: 'Alternativos', color: '#999B30', tag: 'ALT' } };
    const INS = [
      { c: 'rf', name: 'CDT Banco A · 180 días', detail: 'Vence 14 mar 2027 · 10,4 % E.A.', v: 420, cost: 416.5 },
      { c: 'rf', name: 'CDT Banco B · 360 días', detail: 'Vence 02 ago 2027 · 10,1 % E.A.', v: 380, cost: 374 },
      { c: 'rf', name: 'TES tasa fija 2031', detail: 'Deuda pública · cupón 7,0 %', v: 310, cost: 330 },
      { c: 'rf', name: 'Bono corporativo Emisor G 2029', detail: 'IPC + 4,1 % · calificación AAA', v: 279, cost: 265 },
      { c: 'rf', name: 'FIC Renta Fija Alianza', detail: 'Fondo abierto · pacto 30 días', v: 250, cost: 228 },
      { c: 'acc', name: 'Emisor A', detail: 'Energía · 120.000 acciones', v: 289.2, cost: 222 },
      { c: 'acc', name: 'Emisor B', detail: 'Bancario · 7.500 acciones', v: 276.0, cost: 234 },
      { c: 'acc', name: 'Emisor D', detail: 'Holding · 18.000 acciones', v: 254.7, cost: 201.6 },
      { c: 'acc', name: 'Emisor C', detail: 'Infraestructura · 14.000 acciones', v: 222.6, cost: 243.6 },
      { c: 'acc', name: 'Emisor E', detail: 'Seguros · 6.000 acciones', v: 156.6, cost: 173.4 },
      { c: 'acc', name: 'Emisor F', detail: 'Alimentos · 2.500 acciones', v: 101.9, cost: 75 },
      { c: 'liq', name: 'FIC Alianza Liquidez', detail: 'Fondo abierto · disponibilidad a la vista', v: 868, cost: 812 },
      { c: 'bal', name: 'FIC Balanceado Alianza', detail: 'Mezcla renta fija y variable', v: 675, cost: 590 },
      { c: 'alt', name: 'FCP Inmobiliario', detail: 'Fondo de capital privado · cerrado', v: 337, cost: 300 }
    ];
    const instF = st.instF || 'all', instSort = st.instSort || 'value';
    const iTot = INS.reduce((a, x) => a + x.v, 0);
    const clsTot = {}; INS.forEach(x => { clsTot[x.c] = (clsTot[x.c] || 0) + x.v; });
    const order = ['rf', 'acc', 'liq', 'bal', 'alt'];
    const pct1 = v => (v / iTot * 100).toFixed(1).replace('.', ',') + ' %';
    const money = v => '$' + (v % 1 ? v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : v.toLocaleString('es-CO')) + ' M';
    const byVal = INS.slice().sort((a, b) => b.v - a.v);
    const byCls = INS.slice().sort((a, b) => order.indexOf(a.c) - order.indexOf(b.c) || b.v - a.v);
    const listed = (instSort === 'value' ? byVal : byCls).filter(x => instF === 'all' || x.c === instF);
    const maxV = byVal[0].v;
    const shown = listed.reduce((a, x) => a + x.v, 0);
    const shownCost = listed.reduce((a, x) => a + x.cost, 0);
    const rp = (v, c) => (v - c) / c * 100;
    const fPct = r => (r >= 0 ? '+' : '−') + Math.abs(r).toFixed(1).replace('.', ',') + ' %';
    const fVal = d => (d >= 0 ? '+' : '−') + money(Math.round(Math.abs(d) * 10) / 10);
    const chipS = r => 'font-size: 13px; font-weight: 800; padding: 3px 8px; border-radius: 6px; ' + (r >= 0 ? 'background: #E1F5EF; color: #00664F' : 'background: #FDE8E6; color: #9A1F24');
    const byRet = INS.slice().sort((a, b) => rp(b.v, b.cost) - rp(a.v, a.cost));
    const totR = rp(shown, shownCost);
    const inst = {
      count: INS.length,
      top: byVal[0].name + ' · ' + pct1(byVal[0].v),
      top5: pct1(byVal.slice(0, 5).reduce((a, x) => a + x.v, 0)) + ' del saldo',
      stack: byCls.map(x => { const dim = instF !== 'all' && x.c !== instF; return { title: x.name + ': ' + money(x.v) + ' (' + pct1(x.v) + ')', style: 'display: block; height: 100%; width: ' + (x.v / iTot * 100).toFixed(2) + '%; background: ' + IC[x.c].color + '; box-shadow: inset -2px 0 0 #FFFFFF; opacity: ' + (dim ? '0.22' : '1') }; }),
      chips: [{ id: 'all', name: 'Todos', color: '#5B6876', v: iTot }].concat(order.map(k => ({ id: k, name: IC[k].name, color: IC[k].color, v: clsTot[k] }))).map(c => { const on = instF === c.id; return { name: c.name, val: money(c.v), pct: c.id === 'all' ? '100 %' : pct1(c.v), pressed: on ? 'true' : 'false',
        style: 'display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 12px; border-radius: 999px; font-family: inherit; font-size: 12.5px; cursor: pointer; ' + (on ? 'border: 1px solid #003057; background: #003057; color: #FFFFFF' : 'border: 1px solid #D5DDE6; background: #FFFFFF; color: #1B2A3A'),
        dot: 'width: 10px; height: 10px; border-radius: 3px; flex: none; background: ' + (on && c.id === 'all' ? '#FFFFFF' : c.color) + (on ? '; box-shadow: 0 0 0 2px #FFFFFF' : ''),
        pick: () => this.setState({ instF: c.id }) }; }),
      sorts: [{ id: 'value', label: 'Por saldo' }, { id: 'class', label: 'Por clase' }].map(o => ({ label: o.label, pressed: instSort === o.id ? 'true' : 'false', style: btn(instSort === o.id), pick: () => this.setState({ instSort: o.id }) })),
      rows: listed.map(x => ({ name: x.name, detail: x.detail, tag: IC[x.c].tag, val: money(x.v), pct: pct1(x.v),
        retPct: fPct(rp(x.v, x.cost)), retVal: fVal(x.v - x.cost), retChip: chipS(rp(x.v, x.cost)),
        retValStyle: 'font-size: 12px; font-weight: 600; color: ' + (x.v >= x.cost ? '#00664F' : '#9A1F24'),
        inClass: Math.round(x.v / clsTot[x.c] * 100) + ' %',
        badge: 'flex: none; width: 40px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 800; letter-spacing: 0.04em; ' + (x.c === 'alt' ? 'background: #EEF0D2; color: #5C5E14' : 'background: ' + IC[x.c].color + '; color: #FFFFFF'),
        bar: 'height: 100%; border-radius: 4px; background: ' + IC[x.c].color + '; width: ' + (x.v / maxV * 100).toFixed(1) + '%' })),
      footName: instF === 'all' ? 'Total portafolio' : 'Total ' + IC[instF].name,
      footVal: money(Math.round(shown * 10) / 10), footPct: pct1(shown),
      footRetPct: fPct(totR), footRetVal: fVal(shown - shownCost), footRetStyle: chipS(totR),
      retLabel: instF === 'all' ? 'Rentabilidad del portafolio actual' : 'Rentabilidad de ' + IC[instF].name,
      bestWorst: byRet[0].name + ' ' + fPct(rp(byRet[0].v, byRet[0].cost)) + ' · ' + byRet[byRet.length - 1].name + ' ' + fPct(rp(byRet[byRet.length - 1].v, byRet[byRet.length - 1].cost))
    };

    return {
      inst,
      k, nba, factors, gauge, align, donut,
      showNBA: window.AlianzaFlags.get('showNBA'),
      showBriefing: window.AlianzaFlags.get('showBriefing'),
      nbaDone: done + ' de 3 revisadas',
      scopeLabel: st.group ? 'grupo familiar' : 'cliente individual',
      indStyle: btn(!st.group) + ' height: 40px;', grpStyle: btn(st.group) + ' height: 40px;',
      indPressed: st.group ? 'false' : 'true', grpPressed: st.group ? 'true' : 'false',
      setInd: () => this.setState({ group: false }), setGrp: () => this.setState({ group: true }),
      periods: periodsDef.map(p => ({ label: p.label, pressed: p.id === st.period ? 'true' : 'false', style: btn(p.id === st.period), pick: () => this.setState({ period: p.id }) })),
      seriesBtns: seriesDef.map(s => { const on = !st.hidden[s.id]; return { name: s.name, pressed: on ? 'true' : 'false',
        style: 'display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 999px; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; ' + (on ? 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #1B2A3A' : 'border: 1px dashed #C9D2DC; background: #F7F9FB; color: #7A8794; text-decoration: line-through'),
        dot: 'width: 10px; height: 10px; border-radius: 50%; background: ' + (on ? s.color : '#C9D2DC'),
        toggle: () => this.setState({ hidden: { ...this.state.hidden, [s.id]: !this.state.hidden[s.id] } }) }; }),
      grid, xticks, lines, area,
      lastX: xs(N - 1).toFixed(1), lastY: st.hidden.total ? '-20' : ys(T[N - 1]).toFixed(1),
      rangeLabel: fm.label + ' ' + fm.y + ' – Sep 2026',
      sumStart: this.fmt(T[from]), sumEnd: this.fmt(T[N - 1]), sumMax: this.fmt(mx),
      sumVar: (vr >= 0 ? '+' : '') + vr.toFixed(1).replace('.', ',') + ' %'
    };
  }
}

  return Component;
};
