/* Feature flags del mockup — el equivalente a variables de entorno para un
   sitio estático sin build. Guardan su valor en localStorage (persisten por
   navegador) y notifican a quien esté escuchando cuando cambian, para que
   un Component de dc-runtime pueda forceUpdate() y reflejar el nuevo valor.

   Controlan qué módulos aparecen en el menú lateral y qué bloques se ven en
   cada pantalla. Se cambian desde el panel oculto de js/dev-panel.js
   (Ctrl + Shift + Alt + F), nunca desde la interfaz normal.

   Ajustes predefinidos (PRESETS):
     - presentacion: solo Mi cartera y Vista 360 (para enviar a Alianza).
     - todos: todo visible; los módulos sin definición cerrada muestran el
       badge "En definición".
   Sin nada guardado en el navegador se aplica "presentacion". */
window.AlianzaFlags = (function () {
  var STORAGE_KEY = 'alianza360:flags:v2';
  var CHANGE_EVENT = 'alianza:flags-changed';

  // Catálogo único de flags: id -> { group, label, presentacion }.
  // `presentacion` es su valor en el ajuste "Modo presentación" (y por
  // defecto). En "Todos los módulos" todas quedan en true.
  // Agregar una fila aquí la hace aparecer automáticamente en el panel.
  var REGISTRY = {
    modAlertas: { group: 'Módulos del menú', label: 'Señales de churn (pestaña en Vista 360)', presentacion: false },
    modNBA: { group: 'Módulos del menú', label: 'Next best action (pestaña en Vista 360)', presentacion: false },
    modCampanas: { group: 'Módulos del menú', label: 'Campañas comerciales', presentacion: false },
    modSetup: { group: 'Módulos del menú', label: 'Setup (pestaña en Vista 360)', presentacion: false },
    modPensiones: { group: 'Módulos del menú', label: 'Pensiones (consolidado back-office)', presentacion: false },

    showAsistente: { group: 'Global', label: 'Botón flotante "Asistente Alianza"', presentacion: true },

    v360Riesgo: { group: 'Vista 360', label: 'Indicador de riesgo de fuga en el encabezado', presentacion: true },
    v360Grupo: { group: 'Vista 360', label: 'Selector Cliente individual / Grupo familiar', presentacion: true },
    v360Contacto: { group: 'Vista 360', label: 'Datos de contactabilidad', presentacion: true },
    v360Financiera: { group: 'Vista 360', label: 'Información financiera (patrimonio e ingresos)', presentacion: true },
    v360Interacciones: { group: 'Vista 360', label: 'Historial de interacciones', presentacion: true },
    v360Evolucion: { group: 'Vista 360', label: 'Pestaña "Evolución histórica"', presentacion: true },

    carteraRiesgo: { group: 'Mi cartera', label: 'Columna de riesgo de fuga', presentacion: true },

    alertasSenales: { group: 'Alertas', label: 'Señales anticipadas', presentacion: true },
    alertasMapa: { group: 'Alertas', label: 'Mapa de prioridad y motivos', presentacion: true },

    nbaBriefing: { group: 'Siguiente mejor acción', label: 'Briefing antes del contacto', presentacion: true },
    nbaAlineacion: { group: 'Siguiente mejor acción', label: 'Alineación frente al perfil', presentacion: true },
    nbaRecomendacion: { group: 'Siguiente mejor acción', label: 'Recomendación de portafolio según perfil', presentacion: true }
  };

  var PRESETS = {
    presentacion: { label: 'Modo presentación', desc: 'Solo Mi cartera y Vista 360', value: function (id) { return REGISTRY[id].presentacion; } },
    todos: { label: 'Todos los módulos', desc: 'Todo visible, con badge "En definición"', value: function () { return true; } }
  };

  var state = {};
  Object.keys(REGISTRY).forEach(function (id) { state[id] = PRESETS.presentacion.value(id); });

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.keys(saved).forEach(function (id) {
      if (id in REGISTRY) state[id] = !!saved[id];
    });
  } catch (err) { /* localStorage no disponible (modo privado, etc.) */ }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* noop */ }
  }

  function notify(id) {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { id: id } }));
  }

  function get(id) {
    return !!state[id];
  }

  function set(id, value) {
    if (!(id in REGISTRY) || state[id] === !!value) return;
    state[id] = !!value;
    persist();
    notify(id);
  }

  function applyPreset(presetId) {
    var p = PRESETS[presetId];
    if (!p) return;
    Object.keys(REGISTRY).forEach(function (id) { state[id] = !!p.value(id); });
    persist();
    notify(null);
  }

  // Ajuste que coincide con el estado actual, o null si es personalizado.
  function activePreset() {
    var ids = Object.keys(PRESETS);
    for (var i = 0; i < ids.length; i++) {
      var p = PRESETS[ids[i]];
      if (Object.keys(REGISTRY).every(function (id) { return state[id] === !!p.value(id); })) return ids[i];
    }
    return null;
  }

  function list() {
    return Object.keys(REGISTRY).map(function (id) {
      return { id: id, group: REGISTRY[id].group, label: REGISTRY[id].label, value: state[id] };
    });
  }

  function presets() {
    return Object.keys(PRESETS).map(function (id) { return { id: id, label: PRESETS[id].label, desc: PRESETS[id].desc }; });
  }

  return { get: get, set: set, list: list, presets: presets, applyPreset: applyPreset, activePreset: activePreset, CHANGE_EVENT: CHANGE_EVENT };
})();
