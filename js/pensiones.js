/* Consolidado de pensiones (FPV individual, FPV institucional y PAP).
   Lo usan la página pages/Pensiones.dc.html y el modal "Consolidado de
   pensiones" de la pestaña Pensiones de la Vista 360, así ambos muestran
   exactamente lo mismo.
     AlianzaPensiones.vals(filtro, setFiltro) → valores para la plantilla. */
window.AlianzaPensiones = (function () {
  var P = window.Portafolio;
  function money(v) { return '$' + v.toLocaleString('es-CO') + ' M'; }

  function vals(f, setF) {
    // ---- Líneas de producto ----
    const C = window.CopilotoData.pensionesConsolidado, LINES = C.lineas;
    const totalSaldo = LINES.reduce((s, l) => s + l.saldo, 0);
    const totalCount = LINES.reduce((s, l) => s + l.count, 0);
    const lines = LINES.map(l => ({
      name: l.name, saldo: money(l.saldo), count: l.count.toLocaleString('es-CO'),
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

    // Solicitudes y permanencias salen de js/data/copiloto-data.js (mismas
    // cifras que la pestaña Pensiones de la Vista 360).
    const Q = window.Portafolio.pensionesSolicitudes().map(q => ({ ...q, vence: q.venceLabel }));
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
        style: 'min-height: 44px; padding: 0 14px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; ' +
          (on ? 'border: 1px solid #003057; background: #003057; color: #FFFFFF' : 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #3D4C5B'),
        pick: () => setF(d.id)
      };
    });

    // ---- Vencimientos de permanencia / beneficio tributario (FPV) ----
    const NIVEL_LABEL = { alto: 'Vence pronto', medio: 'Por vencer', bajo: 'Sin urgencia' };
    const V = [].concat(...P.clientes().map(c => P.pensionesDe(c).productos.map(p => ({
      nombre: c.nombre, linea: p.datos.plan === 'FPV institucional' ? 'fpve' : 'fpvi', saldo: p.saldo,
      desde: P.fecha(p.apertura), dias: p.diasPermanencia, nivel: p.nivelPermanencia
    })))).sort((a, b) => a.dias - b.dias);
    const vencimientos = V.map(v => ({
      nombre: v.nombre, lineaTag: LINE_TAG[v.linea], saldo: money(v.saldo), desde: v.desde,
      diasLabel: v.dias + ' días', estadoLabel: NIVEL_LABEL[v.nivel], estadoStyle: venceChip(v.nivel)
    }));

    return {
      afiliados: totalCount.toLocaleString('es-CO'),
      saldoTotal: money(totalSaldo),
      aportesMes: money(C.aportesMes), aportesSub: C.aportesSub,
      solicitudesPendientes: String(C.solicitudesPendientes), vencenHoy: C.vencenHoy + ' vencen hoy',
      lines: lines, queue: queue, filters: filters, vencimientos: vencimientos
    };
  }

  return { vals: vals };
})();
