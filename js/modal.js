/* Comportamiento accesible compartido por todos los modales y paneles:
   - Esc cierra el modal superior;
   - Tab / Shift+Tab quedan atrapados dentro del modal abierto;
   - al abrir, el foco pasa al modal; al cerrar, vuelve a quien lo abrió.

   Uso desde un Component de dc-runtime:
     abrir:  AlianzaModal.open(() => this.setState({ modal: null }))
     cerrar: AlianzaModal.close()          (botón ✕, fondo, Esc)
   El contenedor del diálogo debe llevar el atributo data-modal y
   sc-camel-tab-index="-1" para poder recibir el foco. */
window.AlianzaModal = (function () {
  var stack = [];
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function topEl() {
    var els = document.querySelectorAll('[data-modal]');
    for (var i = els.length - 1; i >= 0; i--) {
      if (els[i].getClientRects().length) return els[i];
    }
    return null;
  }

  function focusables(el) {
    return Array.prototype.filter.call(el.querySelectorAll(FOCUSABLE), function (n) { return n.getClientRects().length; });
  }

  function focusTop(tries) {
    var el = topEl();
    if (!el) { if (tries > 0) setTimeout(function () { focusTop(tries - 1); }, 30); return; }
    var target = el.querySelector('[data-autofocus]') || el;
    target.focus();
  }

  function open(onClose) {
    stack.push({ onClose: onClose, opener: document.activeElement });
    setTimeout(function () { focusTop(10); }, 0);
  }

  function close() {
    var top = stack.pop();
    if (!top) return;
    top.onClose();
    setTimeout(function () {
      if (top.opener && document.contains(top.opener) && top.opener.focus) top.opener.focus();
    }, 30);
  }

  function isOpen() { return stack.length > 0; }

  document.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    var el = topEl();
    if (!el) return;
    var f = focusables(el);
    if (!f.length) { e.preventDefault(); el.focus(); return; }
    var first = f[0], last = f[f.length - 1];
    if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  return { open: open, close: close, isOpen: isOpen };
})();
