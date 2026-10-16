/* Panel oculto de feature flags.
   No se ve ni se menciona en ningún lugar de la interfaz: se abre y se
   cierra con el atajo Ctrl + Shift + Alt + F (los tres modificadores a la
   vez evitan que se dispare sin querer mientras alguien escribe en un
   formulario). Si quieres cambiar la combinación, edita SHORTCUT abajo.

   Arriba ofrece los ajustes predefinidos ("Modo presentación" y "Todos los
   módulos"); debajo, cada flag agrupado por módulo para afinar a mano.
   Se ubica en la esquina inferior izquierda: la derecha es del botón
   flotante del Asistente Alianza. */
(function () {
  var SHORTCUT = { ctrl: true, shift: true, alt: true, key: 'f' };
  var panel = null;

  function matchesShortcut(e) {
    return e.ctrlKey === SHORTCUT.ctrl &&
      e.shiftKey === SHORTCUT.shift &&
      e.altKey === SHORTCUT.alt &&
      e.key.toLowerCase() === SHORTCUT.key;
  }

  function buildPanel() {
    var el = document.createElement('div');
    el.id = 'alianza-dev-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Panel de control de secciones');
    el.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:2147483647;' +
      'width:340px;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);overflow:auto;box-sizing:border-box;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
      'background:#0B2239;color:#FFFFFF;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.35);' +
      'padding:16px 18px;display:none;flex-direction:column;gap:12px;';

    var head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;';
    head.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:2px">' +
      '<strong style="font-size:13.5px;letter-spacing:.02em">Panel de control</strong>' +
      '<span style="font-size:11.5px;color:#9FB8CF">Solo visible para ti · Ctrl+Shift+Alt+F para cerrar</span>' +
      '</div>';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Cerrar panel');
    closeBtn.style.cssText = 'flex:none;width:32px;height:32px;border:none;border-radius:8px;' +
      'background:rgba(255,255,255,.12);color:#FFFFFF;cursor:pointer;font-size:13px;line-height:1;';
    closeBtn.addEventListener('click', hide);
    head.appendChild(closeBtn);
    el.appendChild(head);

    var body = document.createElement('div');
    body.id = 'alianza-dev-panel-body';
    body.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
    el.appendChild(body);

    document.body.appendChild(el);
    return el;
  }

  function sectionTitle(text) {
    var t = document.createElement('span');
    t.textContent = text;
    t.style.cssText = 'font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9FB8CF;margin-top:4px;';
    return t;
  }

  function render() {
    var body = panel.querySelector('#alianza-dev-panel-body');
    body.innerHTML = '';
    var active = window.AlianzaFlags.activePreset();

    body.appendChild(sectionTitle('Ajustes predefinidos'));
    var presetsRow = document.createElement('div');
    presetsRow.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
    window.AlianzaFlags.presets().forEach(function (p) {
      var on = active === p.id;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = '<strong style="font-size:13px">' + p.label + (on ? ' · activo' : '') + '</strong>' +
        '<span style="font-size:11.5px;opacity:.85">' + p.desc + '</span>';
      b.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:44px;padding:6px 12px;' +
        'border-radius:10px;cursor:pointer;text-align:left;font-family:inherit;' +
        (on ? 'background:#D2D755;color:#003057;border:1px solid #D2D755;' : 'background:transparent;color:#FFFFFF;border:1px solid rgba(255,255,255,.3);');
      b.addEventListener('click', function () { window.AlianzaFlags.applyPreset(p.id); render(); });
      presetsRow.appendChild(b);
    });
    body.appendChild(presetsRow);
    if (!active) {
      var custom = document.createElement('span');
      custom.textContent = 'Ajuste personalizado';
      custom.style.cssText = 'font-size:11.5px;color:#D2D755;';
      body.appendChild(custom);
    }

    var lastGroup = null;
    window.AlianzaFlags.list().forEach(function (flag) {
      if (flag.group !== lastGroup) {
        body.appendChild(sectionTitle(flag.group));
        lastGroup = flag.group;
      }
      var row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;min-height:28px;';

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = flag.value;
      input.style.cssText = 'width:16px;height:16px;accent-color:#00A3E0;flex:none;';
      input.addEventListener('change', function () {
        window.AlianzaFlags.set(flag.id, input.checked);
        render();
        var again = panel.querySelector('input[data-flag="' + flag.id + '"]');
        if (again) again.focus();
      });
      input.setAttribute('data-flag', flag.id);

      var span = document.createElement('span');
      span.textContent = flag.label;

      row.appendChild(input);
      row.appendChild(span);
      body.appendChild(row);
    });
  }

  function show() {
    if (!panel) panel = buildPanel();
    render();
    panel.style.display = 'flex';
  }

  function hide() {
    if (panel) panel.style.display = 'none';
  }

  function isOpen() {
    return !!panel && panel.style.display !== 'none';
  }

  document.addEventListener('keydown', function (e) {
    if (matchesShortcut(e)) {
      e.preventDefault();
      isOpen() ? hide() : show();
      return;
    }
    if (e.key === 'Escape' && isOpen()) hide();
  });
})();
