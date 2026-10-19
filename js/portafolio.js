/* Cálculos y formatos compartidos sobre js/data/copiloto-data.js.
   Todas las cifras de las pantallas salen de aquí, así cuadran entre vistas:
   saldo de producto → saldo de línea → saldo del cliente → saldo del grupo
   y de la cartera. */
window.Portafolio = (function () {
  var D = window.CopilotoData;
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var CLASES = [
    { id: 'conservador', nombre: 'Conservador' },
    { id: 'moderado', nombre: 'Moderado' },
    { id: 'mayor', nombre: 'Mayor riesgo' }
  ];

  // ── Formatos ───────────────────────────────────────────────────────
  function parse(iso) { var p = iso.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
  function dias(desde, hasta) { return Math.round((parse(hasta) - parse(desde)) / 864e5); }
  function fecha(iso) { var d = new Date(parse(iso)); return String(d.getUTCDate()).padStart(2, '0') + ' ' + MESES[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function fechaCorta(iso) {
    var d = new Date(parse(iso)), y = new Date(parse(D.corte)).getUTCFullYear();
    return String(d.getUTCDate()).padStart(2, '0') + ' ' + MESES[d.getUTCMonth()] + (d.getUTCFullYear() === y ? '' : ' ' + d.getUTCFullYear());
  }
  function num(v, dec) { return v.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function money(v) { var r = Math.round(v * 10) / 10; return '$' + num(r, r % 1 ? 1 : 0) + ' M'; }
  function signedMoney(v) { return (v >= 0 ? '+' : '−') + money(Math.abs(v)); }
  function pct(v, dec) { return num(v, dec == null ? 1 : dec) + ' %'; }
  function signedPct(v) { return (v >= 0 ? '+' : '−') + pct(Math.abs(v)); }
  function price(v) { return '$' + num(Math.round(v), 0); }
  function fmt(v, tipo) {
    if (v == null || v === '') return '—';
    switch (tipo) {
      case 'money': return money(v);
      case 'signedMoney': return signedMoney(v);
      case 'pct': return pct(v);
      case 'signedPct': return signedPct(v);
      case 'date': return fecha(v);
      case 'int': return num(v, 0);
      case 'price': return price(v);
      default: return String(v);
    }
  }

  // ── Riesgo de fuga ─────────────────────────────────────────────────
  function nivel(v) {
    return v >= 65 ? { label: 'Alto', bg: '#FDE8E6', fg: '#9A1F24', color: '#B3272D' }
      : v >= 40 ? { label: 'Medio', bg: '#FFF4DE', fg: '#8A5300', color: '#D57E00' }
      : { label: 'Bajo', bg: '#E1F5EF', fg: '#00664F', color: '#00A98E' };
  }

  // ── Productos ──────────────────────────────────────────────────────
  function rent(saldo, invertido) { return invertido ? (saldo - invertido) / invertido * 100 : 0; }

  function producto(p, titular) {
    var t = D.tiposProducto[p.tipo] || {};
    var out = Object.assign({}, p, { tag: t.tag || 'PRD', tipoNombre: t.nombre || p.tipo, clase: p.clase || t.clase || 'moderado', titular: titular });
    if (p.posiciones) {
      out.posiciones = p.posiciones.map(function (x) {
        var vc = x.cantidad * x.precioCompra / 1e6, vm = x.cantidad * x.precioMercado / 1e6;
        return Object.assign({}, x, {
          valorCompra: vc, valorMercado: vm, liquidacion: vm * 0.994, ganancia: vm - vc, rentPct: rent(vm, vc),
          precioCompraTxt: 'Precio prom. ' + price(x.precioCompra), precioMercadoTxt: 'Precio ' + price(x.precioMercado),
          rentPctTxt: signedPct(rent(vm, vc)),
          compras: x.compras.map(function (c) { return { fecha: c[0], cantidad: c[1], precio: c[2], valor: c[1] * c[2] / 1e6 }; })
        });
      });
      out.saldo = sum(out.posiciones, 'valorMercado');
      out.invertido = sum(out.posiciones, 'valorCompra');
      out.liquidacion = sum(out.posiciones, 'liquidacion');
    }
    if (p.titulos) {
      out.titulos = p.titulos.map(function (x) { return Object.assign({}, x, { rentPct: rent(x.valorMercado, x.valorCompra) }); });
      out.saldo = sum(out.titulos, 'valorMercado');
      out.invertido = sum(out.titulos, 'valorCompra');
    }
    out.ganancia = out.saldo - out.invertido;
    out.rentPct = rent(out.saldo, out.invertido);
    out.diasAlVencimiento = p.datos && p.datos.vencimiento ? dias(D.corte, p.datos.vencimiento) : null;
    return out;
  }

  function sum(arr, k) { return arr.reduce(function (a, x) { return a + x[k]; }, 0); }

  // Agrupa productos por línea (siempre las 4 líneas, aunque estén vacías).
  function lineas(productos) {
    var total = sum(productos, 'saldo');
    return D.lineasProducto.map(function (l) {
      var ps = productos.filter(function (p) { return p.linea === l.id; }).sort(function (a, b) { return b.saldo - a.saldo; });
      var s = sum(ps, 'saldo'), inv = sum(ps, 'invertido');
      return Object.assign({}, l, { productos: ps, saldo: s, invertido: inv, ganancia: s - inv, rentPct: rent(s, inv), pctTotal: total ? s / total * 100 : 0 });
    });
  }

  function alineacion(productos, perfil) {
    var total = sum(productos, 'saldo'), rangos = D.perfiles[perfil] || {};
    return CLASES.map(function (c) {
      var v = sum(productos.filter(function (p) { return p.clase === c.id; }), 'saldo');
      var r = rangos[c.id] || [0, 100], actual = total ? v / total * 100 : 0;
      return { id: c.id, nombre: c.nombre, saldo: v, actual: actual, lo: r[0], hi: r[1], ok: actual >= r[0] - 0.05 && actual <= r[1] + 0.05 };
    });
  }

  // ── Clientes ───────────────────────────────────────────────────────
  var cache = {};
  function cliente(id) {
    if (cache[id]) return cache[id];
    var c = D.clientes.find(function (x) { return x.id === id; });
    if (!c) return null;
    var productos = c.productos.map(function (p) { return producto(p, c.nombre); });
    var saldo = sum(productos, 'saldo'), invertido = sum(productos, 'invertido');
    var inter = (c.interacciones || []).slice().sort(function (a, b) { return parse(b.fecha) - parse(a.fecha); });
    var ult = inter[0];
    var retiros = (c.movimientos || []).filter(function (m) { return m.tipo === 'retiro' && dias(m.fecha, D.corte) <= 90; });
    var retiro = sum(retiros, 'monto');
    var out = Object.assign({}, c, {
      productos: productos, saldo: saldo, invertido: invertido, ganancia: saldo - invertido, rentPct: rent(saldo, invertido),
      lineas: lineas(productos), interacciones: inter,
      ultimoContacto: ult ? ult.fecha : null, diasSinContacto: ult ? dias(ult.fecha, D.corte) : 999,
      retiro90: retiro, retiroPct: retiro ? retiro / (saldo + retiro) * 100 : 0,
      diasPerfil: dias(c.perfilFecha, D.corte),
      alineacion: alineacion(productos, c.perfil),
      lineaNegocioNombre: D.lineasNegocio[c.lineaNegocio] || '',
      nivel: nivel(c.riesgo.d60)
    });
    out.alineado = out.alineacion.every(function (a) { return a.ok; });
    cache[id] = out;
    return out;
  }

  function clientes() { return D.clientes.map(function (c) { return cliente(c.id); }); }

  function grupo(id) {
    var g = D.grupos.find(function (x) { return x.id === id; });
    if (!g) return null;
    var miembros = clientes().filter(function (c) { return c.grupo === id; });
    var productos = [].concat.apply([], miembros.map(function (m) { return m.productos; }));
    var saldo = sum(productos, 'saldo'), invertido = sum(productos, 'invertido');
    return Object.assign({}, g, {
      miembros: miembros, productos: productos, saldo: saldo, invertido: invertido, ganancia: saldo - invertido, rentPct: rent(saldo, invertido),
      lineas: lineas(productos),
      patrimonio: sum(miembros.map(function (m) { return m.financiera; }), 'patrimonio'),
      ingresosMensuales: sum(miembros.map(function (m) { return m.financiera; }), 'ingresosMensuales'),
      personasJuridicas: miembros.filter(function (m) { return m.tipoPersona === 'PJ'; }).length
    });
  }

  function cartera() {
    var cs = clientes();
    return { clientes: cs, saldo: sum(cs, 'saldo'), invertido: sum(cs, 'invertido') };
  }

  // Procesos de setup (vinculación / actualización) con etapa actual y
  // pendientes calculados a partir de los documentos. Lo usan el módulo
  // Setup y la pestaña Setup de la Vista 360.
  function setupProcesos() {
    var etapas = D.setupEtapas;
    return D.setup.map(function (s) {
      var c = s.clienteId ? cliente(s.clienteId) : null;
      var tipo = c ? c.tipoPersona : s.tipoPersona;
      var docs = D.setupDocumentos.filter(function (d) { return d.aplica.indexOf(tipo) >= 0; }).map(function (d) {
        var r = s.docs[d.id] || ['pendiente', s.inicio];
        return Object.assign({}, d, { estado: r[0], fecha: r[1] });
      });
      var abiertos = docs.filter(function (d) { return d.estado !== 'completo'; });
      var etapa = abiertos.length ? Math.min.apply(null, abiertos.map(function (d) { return d.etapa; })) : etapas.length;
      return Object.assign({}, s, {
        cliente: c, nombre: c ? c.nombre : s.nombre, tipoPersona: tipo, segmento: c ? c.segmento : s.segmento,
        docs: docs, pendientes: abiertos.length, vencidos: abiertos.filter(function (d) { return d.estado === 'vencido'; }).length, etapa: etapa
      });
    });
  }
  function setupDe(clienteId) {
    return setupProcesos().find(function (p) { return p.clienteId === clienteId; }) || null;
  }

  // ── Pensiones ─────────────────────────────────────────────────────
  // Productos FPV con su permanencia (días al corte) y solicitudes en curso.
  var PLAN_TAG = { fpvi: 'FPV individual', fpve: 'FPV institucional', pap: 'PAP' };
  function nivelDias(d, alto, medio) { return d <= alto ? 'alto' : d <= medio ? 'medio' : 'bajo'; }
  function venceLabel(d) { return d < 0 ? 'Venció hace ' + (-d) + (d === -1 ? ' día' : ' días') : d === 0 ? 'Vence hoy' : 'Vence en ' + d + (d === 1 ? ' día' : ' días'); }
  function pensionesSolicitudes() {
    return D.pensionesSolicitudes.map(function (q) {
      var c = q.clienteId ? cliente(q.clienteId) : null, d = dias(D.corte, q.vence);
      return Object.assign({}, q, { nombre: c ? c.nombre : q.nombre, plan: PLAN_TAG[q.linea], dias: d, venceLabel: venceLabel(d), nivel: d < 0 ? 'alto' : nivelDias(d, 1, 3) });
    });
  }
  function pensionesDe(c) {
    var productos = c.productos.filter(function (p) { return p.tipo === 'fpv'; }).map(function (p) {
      var d = dias(D.corte, p.datos.permanenciaHasta);
      return Object.assign({}, p, { diasPermanencia: d, nivelPermanencia: nivelDias(d, 30, 90) });
    });
    var solicitudes = pensionesSolicitudes().filter(function (q) { return q.clienteId === c.id; });
    return { productos: productos, solicitudes: solicitudes };
  }

  function param(name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  }

  return {
    data: D, CLASES: CLASES,
    dias: dias, fecha: fecha, fechaCorta: fechaCorta, num: num, money: money, signedMoney: signedMoney,
    pct: pct, signedPct: signedPct, price: price, fmt: fmt, nivel: nivel, rent: rent, sum: sum,
    producto: producto, lineas: lineas, alineacion: alineacion,
    cliente: cliente, clientes: clientes, grupo: grupo, cartera: cartera, setupProcesos: setupProcesos, setupDe: setupDe, pensionesSolicitudes: pensionesSolicitudes, pensionesDe: pensionesDe, param: param
  };
})();
