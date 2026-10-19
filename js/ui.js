/* Piezas compartidas por todas las pantallas internas (pages/*.dc.html):
   - AlianzaNav: el menú lateral de módulos, definido en un solo lugar.
     Cada página lo pinta con un <sc-for list="{{nav.items}}"> y obtiene los
     ítems con AlianzaNav.build('<idModulo>') desde renderVals().
   - AlianzaUI: estilos reutilizables (botones, chips) y utilidades. */
window.AlianzaNav = (function () {
  var circle = function (cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0'; };
  var LAST_CLIENT_KEY = 'alianza360:ultimoCliente';

  // Orden y definición de los módulos del Copiloto.
  // flag: id en js/feature-flags.js que lo muestra u oculta (sin flag = siempre visible).
  // enDef: el módulo aún no tiene definición cerrada con Alianza → badge "En definición".
  // menu: false → no aparece en el menú lateral; se consulta como pestaña de la
  // Vista 360 (su página sigue disponible desde los enlaces de esa pestaña).
  var MODULOS = [
    { id: 'cartera', label: 'Mi cartera', href: 'Cartera.dc.html', icon: 'M3 7h18v13H3z M8 7V4h8v3' },
    { id: 'v360', label: 'Vista 360', href: 'Vista360.dc.html', icon: circle(12, 8, 4) + ' M4 21a8 8 0 0 1 16 0' },
    { id: 'alertas', label: 'Alertas de riesgo de fuga', href: 'Alertas.dc.html', flag: 'modAlertas', enDef: true, menu: false, icon: 'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8 M10 20a2 2 0 0 0 4 0' },
    { id: 'nba', label: 'Siguiente mejor acción', href: 'SiguienteAccion.dc.html', flag: 'modNBA', enDef: true, menu: false, icon: 'M4 12h14 M12 6l6 6-6 6' },
    { id: 'campanas', label: 'Campañas comerciales', href: 'Campanas.dc.html', flag: 'modCampanas', enDef: true, icon: 'M3 10v4h3l6 4V6L6 10z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12' },
    { id: 'setup', label: 'Setup del cliente', href: 'Setup.dc.html', flag: 'modSetup', enDef: true, menu: false, icon: 'M9 3h6v3H9z M7 4H5v17h14V4h-2 M9 13l2 2 4-4' },
    { id: 'pensiones', label: 'Pensiones', href: 'Pensiones.dc.html', flag: 'modPensiones', icon: 'M3 10h18 M12 2 3 7h18z M5 10v9 M9 10v9 M15 10v9 M19 10v9 M3 21h18' }
  ];

  function visible(id) {
    var m = MODULOS.find(function (x) { return x.id === id; });
    return !!m && (!m.flag || window.AlianzaFlags.get(m.flag));
  }

  function rememberClient(id) {
    try { sessionStorage.setItem(LAST_CLIENT_KEY, id); } catch (e) { /* noop */ }
  }
  function lastClient() {
    try { return sessionStorage.getItem(LAST_CLIENT_KEY); } catch (e) { return null; }
  }

  function build(current) {
    var P = window.Portafolio;
    var altas = P ? P.clientes().filter(function (c) { return c.riesgo.d60 >= 65; }).length : 0;
    var last = lastClient();
    var items = MODULOS.filter(function (m) { return m.menu !== false && visible(m.id); }).map(function (m) {
      var on = m.id === current;
      var href = m.id === 'v360' && last ? m.href + '?cliente=' + encodeURIComponent(last) : m.href;
      return {
        id: m.id, label: m.label, href: href, icon: m.icon, enDef: !!m.enDef,
        current: on ? 'page' : undefined,
        count: m.id === 'alertas' && altas ? String(altas) : '',
        countStyle: 'flex: none; min-width: 22px; height: 22px; padding: 0 6px; box-sizing: border-box; border-radius: 11px; background: ' + (on ? '#003057' : '#D2D755') + '; color: ' + (on ? '#FFFFFF' : '#003057') + '; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center',
        badgeStyle: 'align-self: flex-start; font-size: 10.5px; font-weight: 700; padding: 1px 7px; border-radius: 999px; ' + (on ? 'background: #EEF0D2; color: #3F410C' : 'background: #D2D755; color: #003057'),
        style: 'display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 6px 12px; box-sizing: border-box; border-radius: 10px; text-decoration: none; font-size: 14px; line-height: 1.3; ' +
          (on ? 'background: #FFFFFF; color: #003057; font-weight: 700' : 'color: #D6E4F0; font-weight: 600')
      };
    });
    var A = window.CopilotoData.asesor;
    return { items: items, asesor: A };
  }

  // Valores comunes que toda página de módulo pasa a su plantilla:
  // menú, fecha de corte y si el módulo está oculto por los flags (en ese
  // caso la página muestra un aviso en lugar del contenido).
  function shell(id) {
    var on = visible(id);
    return { nav: build(id), corte: window.Portafolio.fecha(window.CopilotoData.corte), visible: on, oculto: !on };
  }

  return { MODULOS: MODULOS, build: build, visible: visible, shell: shell, rememberClient: rememberClient, lastClient: lastClient };
})();

window.AlianzaUI = (function () {
  // Botón de un grupo segmentado (pestañas, periodos, alcance).
  function seg(on) {
    return 'min-height: 44px; padding: 0 14px; border-radius: 9px; border: none; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ' +
      (on ? 'background: #003057; color: #FFFFFF;' : 'background: transparent; color: #3D4C5B;');
  }
  // Chip de filtro (píldora).
  function pill(on) {
    return 'min-height: 44px; padding: 0 14px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ' +
      (on ? 'border: 1px solid #003057; background: #003057; color: #FFFFFF' : 'border: 1px solid #C9D2DC; background: #FFFFFF; color: #3D4C5B');
  }
  // Etiqueta de solo lectura.
  function chip(bg, fg, extra) {
    return 'display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 4px 9px; border-radius: 999px; white-space: nowrap; background: ' + bg + '; color: ' + fg + (extra ? '; ' + extra : '');
  }
  function rentChip(v) {
    return 'font-size: 13px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap; ' + (v >= 0 ? 'background: #E1F5EF; color: #00664F' : 'background: #FDE8E6; color: #9A1F24');
  }
  function riesgoChip(v) {
    var n = window.Portafolio.nivel(v);
    return chip(n.bg, n.fg, 'min-width: 76px; justify-content: center');
  }
  // Suscribe un Component a los cambios de flags (repinta sin recargar).
  function watchFlags(component) {
    var fn = function () { component.forceUpdate(); };
    window.addEventListener(window.AlianzaFlags.CHANGE_EVENT, fn);
    return function () { window.removeEventListener(window.AlianzaFlags.CHANGE_EVENT, fn); };
  }
  return { seg: seg, pill: pill, chip: chip, rentChip: rentChip, riesgoChip: riesgoChip, watchFlags: watchFlags };
})();

/* Menú desplegable en pantallas angostas (< 1024 px, ver css/app.css):
   el botón ☰ (data-nav-toggle) agrega la clase .nav-open a <html>.
   Se cierra con Esc, al volver a pulsar el botón o al pasar a escritorio. */
(function () {
  function toggle(btn, open) {
    document.documentElement.classList.toggle('nav-open', open);
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    if (open) {
      var first = document.querySelector('#app-nav-panel a');
      if (first) first.focus();
    }
  }
  function btn() { return document.querySelector('[data-nav-toggle]'); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nav-toggle]');
    if (b) toggle(b, !document.documentElement.classList.contains('nav-open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) {
      toggle(btn(), false);
      if (btn()) btn().focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && document.documentElement.classList.contains('nav-open')) toggle(btn(), false);
  });
})();
