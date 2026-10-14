# copiloto_mockup

Mockup de la **Plataforma Asesor 360** de Alianza Fiduciaria. Es una web
multipágina de verdad (sin iframes ni tableros de diseño): cada pantalla es
un `.html` navegable con enlaces reales, renderizada con `dc-runtime`
(React 18 UMD) desde plantillas con binding `{{ }}`.

## Estructura

```
index.html                  Pantalla de login (raíz / punto de entrada)
pages/Registro.dc.html      Solicitud de registro
pages/Vista360.dc.html      Vista Cliente 360
pages/GrupoFamiliar.dc.html Consolidado grupo familiar y empresarial
pages/RentaVariable.dc.html Resumen renta variable
pages/Cartera.dc.html       Mi cartera · riesgo de fuga
css/fonts.css               @font-face de Open Sans (compartido)
css/<Pantalla>.css          Estilos propios de cada pantalla
js/<Pantalla>.js            Lógica (class Component) de cada pantalla
js/resources.js             Mapea los CDN de React a las copias de vendor/
vendor/                     dc-runtime.js, react, react-dom
assets/                     Logo y fuentes .woff2
original-bundle.html        Bundle original de 2,6 MB (respaldo, se puede borrar)
```

## Navegación

Las pantallas se enlazan entre sí con `<a href>` normales, como una web real:

- `index.html` → "Ingresar" / "Continuar con Microsoft" llevan a
  `pages/Vista360.dc.html`; "Solicitar registro" lleva a
  `pages/Registro.dc.html`.
- Dentro de `pages/`, el menú lateral navega entre `Vista360.dc.html`,
  `GrupoFamiliar.dc.html`, `RentaVariable.dc.html` y `Cartera.dc.html`.
- "Volver al ingreso" (en Registro y en el menú de Vista360) regresa a
  `../index.html`.

Si renombras un archivo de `pages/` o el propio `index.html`, actualiza los
`href` correspondientes en las demás pantallas (`grep -rn "nombre.dc.html"`).

## Cómo editar

- **Maquetado y contenido** → el `.html` de cada pantalla, dentro de
  `<x-dc>`. Los valores entre `{{ }}` vienen de `renderVals()`.
- **Estilos** → `css/<Pantalla>.css` (reglas globales de la pantalla) o los
  `style="…"` en línea del marcado.
- **Datos y comportamiento** → `js/<Pantalla>.js`: expone
  `window.AppLogic.<Pantalla>` con la clase `Component extends DCLogic`.
  El HTML solo la engancha con una línea en el `<script type="text/x-dc">`
  final, que es la forma en que `dc-runtime` recibe la lógica (no acepta
  `<script src>` para el componente).

## Cómo verlo

```bash
python3 -m http.server 8000   # luego abrir http://localhost:8000
```

También funciona abriendo `index.html` directamente con doble clic
(`file://`); las fuentes latinas, React y el runtime son locales, así que
no necesita conexión.
