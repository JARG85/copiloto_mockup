/* Mapea las dependencias que dc-runtime pide por CDN a las copias locales de
   /vendor. Debe cargarse antes que vendor/dc-runtime.js.
   La ruta base se calcula a partir de la propia URL de este script (en vez
   de usar "../vendor/..." fijo) porque tanto index.html (raíz) como
   pages/*.dc.html (un nivel más abajo) cargan este mismo archivo. */
(function () {
  var thisScript = document.currentScript.src;
  var base = thisScript.slice(0, thisScript.lastIndexOf('/js/') + 1);
  window.__resources = {
    'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js':
      base + 'vendor/react.production.min.js',
    'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js':
      base + 'vendor/react-dom.production.min.js',
  };
})();
