/* Feature flags del mockup — el equivalente a variables de entorno para un
   sitio estático sin build. Guardan su valor en localStorage (persisten por
   navegador) y notifican a quien esté escuchando cuando cambian, para que
   un Component de dc-runtime pueda forceUpdate() y reflejar el nuevo valor.

   Todas ocultas por defecto. Se activan desde el panel oculto de
   js/dev-panel.js (atajo de teclado), nunca desde la interfaz normal. */
window.AlianzaFlags = (function () {
  var STORAGE_KEY = 'alianza360:flags';
  var CHANGE_EVENT = 'alianza:flags-changed';

  // Catálogo único de flags disponibles: id -> { label, default }.
  // Agregar una fila aquí la hace aparecer automáticamente en el panel.
  var REGISTRY = {
    showNBA: {
      label: 'Vista 360 · Sección "Siguiente mejor acción"',
      default: false
    },
    showBriefing: {
      label: 'Vista 360 · Sección "Briefing antes del contacto"',
      default: false
    }
  };

  var state = {};
  Object.keys(REGISTRY).forEach(function (id) { state[id] = REGISTRY[id].default; });

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.keys(saved).forEach(function (id) {
      if (id in REGISTRY) state[id] = !!saved[id];
    });
  } catch (err) { /* localStorage no disponible (modo privado, etc.) */ }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* noop */ }
  }

  function get(id) {
    return !!state[id];
  }

  function set(id, value) {
    if (!(id in REGISTRY) || state[id] === !!value) return;
    state[id] = !!value;
    persist();
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { id: id, value: state[id] } }));
  }

  function list() {
    return Object.keys(REGISTRY).map(function (id) {
      return { id: id, label: REGISTRY[id].label, value: state[id] };
    });
  }

  return { get: get, set: set, list: list, CHANGE_EVENT: CHANGE_EVENT };
})();
