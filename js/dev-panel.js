/* Panel oculto de feature flags.
   No se ve ni se menciona en ningún lugar de la interfaz: se abre y se
   cierra con el atajo Ctrl + Shift + Alt + F (los tres modificadores a la
   vez evitan que se dispare sin querer mientras alguien escribe en un
   formulario). Si quieres cambiar la combinación, edita SHORTCUT abajo. */
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
    el.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;' +
      'width:300px;max-width:calc(100vw - 40px);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
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
    closeBtn.style.cssText = 'flex:none;width:26px;height:26px;border:none;border-radius:8px;' +
      'background:rgba(255,255,255,.12);color:#FFFFFF;cursor:pointer;font-size:13px;line-height:1;';
    closeBtn.addEventListener('click', hide);
    head.appendChild(closeBtn);
    el.appendChild(head);

    var list = document.createElement('div');
    list.id = 'alianza-dev-panel-list';
    list.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    el.appendChild(list);

    document.body.appendChild(el);
    return el;
  }

  function renderList() {
    var list = panel.querySelector('#alianza-dev-panel-list');
    list.innerHTML = '';
    window.AlianzaFlags.list().forEach(function (flag) {
      var row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;';

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = flag.value;
      input.style.cssText = 'width:16px;height:16px;accent-color:#00A3E0;flex:none;';
      input.addEventListener('change', function () {
        window.AlianzaFlags.set(flag.id, input.checked);
      });

      var span = document.createElement('span');
      span.textContent = flag.label;

      row.appendChild(input);
      row.appendChild(span);
      list.appendChild(row);
    });
  }

  function show() {
    if (!panel) panel = buildPanel();
    renderList();
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
