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
pages/Pensiones.dc.html     Pensiones · consolidado operativo (FPV, PAP)
css/fonts.css               @font-face de Open Sans (compartido)
css/<Pantalla>.css          Estilos propios de cada pantalla
js/<Pantalla>.js            Lógica (class Component) de cada pantalla
js/resources.js             Mapea los CDN de React a las copias de vendor/
js/feature-flags.js         Flags para mostrar/ocultar secciones a voluntad
js/dev-panel.js             Panel oculto para activar esos flags (ver abajo)
vendor/                     dc-runtime.js, react, react-dom
assets/                     Logo, favicon y fuentes .woff2
original-bundle.html        Bundle original de 2,6 MB (respaldo, se puede borrar)
```

## Navegación

Las pantallas se enlazan entre sí con `<a href>` normales, como una web real:

- `index.html` → "Ingresar" / "Continuar con Microsoft" llevan a
  `pages/Vista360.dc.html`; "Solicitar registro" lleva a
  `pages/Registro.dc.html`.
- Dentro de `pages/`, el menú lateral navega entre `Vista360.dc.html`,
  `GrupoFamiliar.dc.html`, `RentaVariable.dc.html`, `Pensiones.dc.html` y
  `Cartera.dc.html`.
- "Volver al ingreso" (en Registro y en el menú de Vista360) regresa a
  `../index.html`.

Si renombras un archivo de `pages/` o el propio `index.html`, actualiza los
`href` correspondientes en las demás pantallas (`grep -rn "nombre.dc.html"`).

## Pensiones · consolidado operativo

`pages/Pensiones.dc.html` consolida, para un operario de back-office (no para
un asesor comercial), los tres productos de pensiones que administra Alianza
Fiduciaria:

- **FPV individual** — fondo de pensiones voluntarias de personas naturales.
- **FPV institucional** — planes patrocinados por un empleador.
- **PAP** — patrimonios autónomos de pensión (encargos fiduciarios con los
  que una empresa respalda su pasivo pensional / cálculo actuarial).

Incluye KPIs consolidados (afiliados, saldo, aportes del mes, solicitudes
pendientes), una **bandeja de solicitudes** filtrable (retiros, certificados,
cambios de perfil, otras gestiones) con estados accionables, el desglose de
saldo por línea de producto, y una tabla de **vencimientos de permanencia y
beneficio tributario** (retirar antes de tiempo en una FPV hace perder el
beneficio tributario). Los datos de `js/Pensiones.js` son ilustrativos.

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

## Flags para mostrar/ocultar secciones (panel oculto)

El sitio no tiene build, así que no hay `.env` real: el equivalente es
`js/feature-flags.js`, un registro de flags booleanos (por defecto todos
en `false`) que se guardan en `localStorage` del navegador y se leen desde
`renderVals()` de cada pantalla.

Están pensados para quedar **ocultos de cualquier usuario normal**: no hay
ningún botón ni menú visible que los exponga. Se activan así:

1. En cualquier pantalla, presiona **Ctrl + Shift + Alt + F**. Abre un panel
   flotante en la esquina inferior derecha, visible solo para quien conoce
   el atajo.
2. Marca o desmarca el flag que quieras. El cambio se aplica al instante
   (sin recargar) y queda guardado en ese navegador.
3. Vuelve a presionar el mismo atajo (o `Esc`) para cerrar el panel.

Flags incluidos hoy (ambos en Vista Cliente 360, ocultos por defecto):

- `showNBA` — sección **"Siguiente mejor acción"**.
- `showBriefing` — sección **"Briefing antes del contacto"**.

### Cómo agregar un flag nuevo

1. Agrega una entrada al objeto `REGISTRY` en `js/feature-flags.js`
   (`id`, `label`, `default`) — aparece sola en el panel.
2. En el `.js` de la pantalla, agrega `miFlag: window.AlianzaFlags.get('miFlag')`
   al objeto que retorna `renderVals()`.
3. En el `.dc.html` de esa pantalla, envuelve la sección con
   `<sc-if value="{{miFlag}}" hint-placeholder-val="{{ true }}"> … </sc-if>`.
4. Si el Component de esa pantalla no lo tiene aún, agrega el
   `componentDidMount`/`componentWillUnmount` que escucha
   `window.AlianzaFlags.CHANGE_EVENT` y llama `this.forceUpdate()` (cópialo
   de `js/Vista360.js`) — es lo que hace que el toggle se refleje sin
   recargar la página.

El atajo de teclado se puede cambiar editando `SHORTCUT` al inicio de
`js/dev-panel.js`.

## Cómo verlo

```bash
python3 -m http.server 8000   # luego abrir http://localhost:8000
```

También funciona abriendo `index.html` directamente con doble clic
(`file://`); las fuentes latinas, React y el runtime son locales, así que
no necesita conexión.
