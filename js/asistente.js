/* Botón flotante + panel lateral del "Asistente Alianza".
   El Asistente Alianza es un PROYECTO PARALELO: este panel solo ilustra el
   punto de integración dentro del Copiloto (antes era el bloque "Pregúntale
   al asistente" dentro de la Vista 360). No consulta ningún servicio.
   Se muestra u oculta con el flag `showAsistente` (js/feature-flags.js). */
(function () {
  var FONT = "'Open Sans', 'Segoe UI', system-ui, sans-serif";
  var btn = null, panel = null, log = null;

  function el(tag, css, html) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function bubble(text, mine, sources) {
    var b = el('div', 'max-width: 88%; padding: 10px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; ' +
      (mine ? 'align-self: flex-end; background: #E3F1FB; color: #003057' : 'align-self: flex-start; background: #F2F5F9; color: #1B2A3A'));
    b.textContent = text;
    if (sources) {
      var s = el('span', 'display: block; margin-top: 6px; font-size: 12px; color: #4F5D6B');
      s.textContent = sources;
      b.appendChild(s);
    }
    return b;
  }

  function build() {
    // Pestaña vertical pegada al borde derecho: no tapa el contenido de las tablas.
    btn = el('button', 'position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 2147483000; display: flex; align-items: center; gap: 10px; width: 44px; padding: 16px 0; border: none; border-radius: 12px 0 0 12px; writing-mode: vertical-rl; background: #003057; color: #FFFFFF; font-family: ' + FONT + '; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: -4px 4px 16px rgba(0,48,87,.3)',
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A3E0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"></path><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"></path></svg>Asistente Alianza');
    btn.type = 'button';
    btn.className = 'asistente-tab';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', open);
    document.body.appendChild(btn);

    panel = el('aside', 'position: fixed; top: 0; right: 0; bottom: 0; z-index: 2147483001; width: 400px; max-width: 100vw; box-sizing: border-box; display: none; flex-direction: column; background: #FFFFFF; box-shadow: -12px 0 32px rgba(0,0,0,.18); font-family: ' + FONT + '; color: #1B2A3A');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'asistente-titulo');
    panel.tabIndex = -1;

    var head = el('div', 'position: relative; overflow: hidden; background: #003057; color: #FFFFFF; padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 8px');
    head.appendChild(el('div', 'position: absolute; inset: 0; background: #0072CE; clip-path: polygon(70% 100%, 100% 30%, 100% 100%)'));
    var row = el('div', 'position: relative; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px');
    row.appendChild(el('div', 'display: flex; flex-direction: column; gap: 6px',
      '<h2 id="asistente-titulo" style="margin: 0; font-size: 18px">Asistente Alianza</h2>' +
      '<span style="align-self: flex-start; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: #D2D755; color: #003057">Integración · proyecto paralelo</span>'));
    var close = el('button', 'flex: none; width: 44px; height: 44px; border: none; border-radius: 10px; background: rgba(255,255,255,.14); color: #FFFFFF; font-size: 16px; cursor: pointer', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar Asistente Alianza');
    close.addEventListener('click', function () { window.AlianzaModal.close(); });
    row.appendChild(close);
    head.appendChild(row);
    head.appendChild(el('p', 'position: relative; margin: 0; font-size: 12.5px; line-height: 1.5; color: #D6E4F0',
      'El Asistente Alianza se desarrolla como un proyecto aparte. Este panel muestra dónde se integrará en el Copiloto; las respuestas son de ejemplo.'));
    panel.appendChild(head);

    log = el('div', 'flex: 1; overflow: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px');
    log.appendChild(bubble('¿Qué fondo de renta fija encaja con su perfil y cuánto rentó en el último año?', true));
    log.appendChild(bubble('Para perfil Moderado, la ficha permite fondos de renta fija de mediano plazo. La rentabilidad debe consultarse en la ficha técnica vigente del fondo.', false, 'Fuentes: [Ficha técnica FIC renta fija, sep-2026] · [Política de idoneidad, v4]'));
    panel.appendChild(log);

    var form = el('form', 'display: flex; gap: 8px; padding: 14px 20px 20px; border-top: 1px solid #E1E7EE');
    var label = el('label', 'position: absolute; left: -9999px', 'Pregunta al Asistente Alianza');
    label.htmlFor = 'asistente-pregunta';
    var input = el('input', 'flex: 1; min-width: 0; height: 44px; padding: 0 14px; border: 1px solid #C9D2DC; border-radius: 10px; font-family: inherit; font-size: 14px; color: #1B2A3A; background: #F8FAFC');
    input.id = 'asistente-pregunta';
    input.placeholder = 'Escribe una pregunta sobre productos o políticas';
    input.setAttribute('data-autofocus', '');
    var send = el('button', 'flex: none; height: 44px; padding: 0 16px; border: none; border-radius: 10px; background: #0072CE; color: #FFFFFF; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer', 'Enviar');
    send.type = 'submit';
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(send);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      log.appendChild(bubble(q, true));
      log.appendChild(bubble('Respuesta de ejemplo: aquí responderá el Asistente Alianza cuando se integre.', false));
      input.value = '';
      log.scrollTop = log.scrollHeight;
    });
    panel.appendChild(form);
    document.body.appendChild(panel);
  }

  function open() {
    panel.style.display = 'flex';
    panel.setAttribute('data-modal', '');
    btn.setAttribute('aria-expanded', 'true');
    window.AlianzaModal.open(function () {
      panel.style.display = 'none';
      panel.removeAttribute('data-modal');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function sync() {
    var on = window.AlianzaFlags.get('showAsistente');
    btn.style.display = on ? 'flex' : 'none';
    if (!on && panel.style.display !== 'none') window.AlianzaModal.close();
  }

  function init() {
    build();
    sync();
    window.addEventListener(window.AlianzaFlags.CHANGE_EVENT, sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
