# copiloto_mockup

Mockup del **Copiloto Comercial** de Alianza Fiduciaria (plataforma para los
asesores comerciales). Es una web multipágina de verdad (sin iframes ni
tableros de diseño): cada pantalla es un `.html` navegable con enlaces
reales, renderizada con `dc-runtime` (React 18 UMD) desde plantillas con
binding `{{ }}`. **Todos los datos son ilustrativos**; las fuentes reales aún
no están definidas y no se conecta ninguna API.

Estructura acordada en la revisión con Alianza del 15 oct 2026: la Vista 360
es solo informativa y compacta; alertas, siguiente mejor acción, campañas y
setup viven en módulos propios.

## Estructura

```
index.html                     Login (raíz / punto de entrada) → Mi cartera
pages/Registro.dc.html         Solicitud de registro
pages/Cartera.dc.html          Mi cartera: listado general de clientes
pages/Vista360.dc.html         Vista Cliente 360 (?cliente=<id>, ?vista=grupo)
pages/Campanas.dc.html         Campañas comerciales
pages/Pensiones.dc.html        Pensiones · consolidado back-office (oculto por defecto)

js/data/copiloto-data.js       ÚNICO archivo de datos de ejemplo (ver abajo)
js/data/detalle-schema.js      Campos del modal de detalle por tipo de producto
js/portafolio.js               Cálculos (saldos, rentabilidad, líneas) y formatos
js/ui.js                       Menú lateral de módulos (AlianzaNav) y estilos comunes
js/modal.js                    Modales accesibles: Esc, foco atrapado, foco de regreso
js/asistente.js                Botón flotante "Asistente Alianza" (proyecto paralelo)
js/feature-flags.js            Flags para mostrar/ocultar módulos y bloques
js/dev-panel.js                Panel oculto para esos flags (Ctrl+Shift+Alt+F)
js/<Pantalla>.js               Lógica (class Component) de cada pantalla
js/resources.js                Mapea los CDN de React a las copias de vendor/
css/fonts.css                  @font-face de Open Sans (compartido)
css/<Pantalla>.css             Estilos propios de cada pantalla
vendor/                        dc-runtime.js, react, react-dom
assets/                        Logo, favicon y fuentes .woff2
original-bundle.html           Bundle original de 2,6 MB (respaldo, se puede borrar)
```

Las antiguas páginas `RentaVariable` y `GrupoFamiliar` se eliminaron: la
renta variable es un producto de la línea Intermediación (su detalle se abre
en un modal de la Vista 360) y el grupo familiar es un selector dentro de la
Vista 360.

## Módulos y navegación

El menú lateral se define en un solo lugar: `MODULOS` en `js/ui.js`. Cada
página lo pinta con `<sc-for list="{{nav.items}}">` y obtiene los ítems con
`AlianzaNav.shell('<id>')` desde `renderVals()`.

1. **Mi cartera** — listado de los clientes del asesor (búsqueda, segmento,
   orden). Desde cada fila se entra a su Vista 360.
2. **Vista 360** — quién es el cliente y cómo está su portafolio. Diseñada
   para caber en 1440×900 sin scroll de página:
   - encabezado (documento, segmento, asesor, vinculación, perfil oficial)
     con un badge pequeño de riesgo de fuga que enlaza a Alertas;
   - totales (saldo y rentabilidad), patrimonio e ingresos;
   - contactabilidad (teléfonos, correos, dirección) y últimas 3
     interacciones, con "Ver todo" en un modal;
   - pestaña **Portafolio por línea**: gráfico de torta por línea de
     producto (su leyenda abre la línea) y acordeón Línea → Producto con saldo,
     % total, % de su línea y rentabilidad; clic en un producto abre su
     **modal de detalle**; pestaña **Evolución histórica**;
   - selector **Cliente individual / Grupo familiar**: consolidado del
     grupo con filtro por integrante.
   - **pestañas adicionales** (ocultas por defecto; se habilitan una a una
     desde el panel `Ctrl+Shift+Alt+F`, grupo "Vista 360 · pestañas
     adicionales", o todas con "Todos los módulos"):
     - **Pensiones** (`v360Pensiones`): planes FPV del cliente con saldo,
       rentabilidad, aportes del año, permanencia y beneficio tributario, y
       sus solicitudes en curso. El botón **"Ver consolidado de pensiones"**
       abre en un modal la misma información de `Pensiones.dc.html` (KPIs,
       bandeja de solicitudes, saldo por línea y permanencias), calculada en
       `js/pensiones.js`;
     - **Señales de churn** (`modAlertas`), **Next best action** (`modNBA`)
       y **Setup** (`modSetup`: qué documentos o firmas le faltan al cliente).
3. **Campañas comerciales** — campañas activas; al abrir una, la regla en
   lenguaje natural y los clientes de la cartera que encajan.

Señales de churn, Next best action y Setup **no tienen página ni entrada en
el menú lateral**: se consultan como pestañas de la Vista 360, y su vista
completa se abre en un **modal** desde cada pestaña (lógica en
`js/vistas-modulos.js`, plantilla al final de `pages/Vista360.dc.html`):

- *Ver alertas de toda la cartera* (también desde el indicador de riesgo
  del encabezado): termómetro a 30 y 60 días con factores, señales
  anticipadas, mapa de prioridad, motivos y clientes priorizados.
- *Ver todos los clientes* (Next best action): acción sugerida de cada
  cliente, briefing, tarjetas NBA, alineación frente al perfil y
  recomendación de portafolio. Las decisiones de aceptar / descartar son
  las mismas de la pestaña.
- *Ver setup de toda la cartera*: etapa de vinculación de cada cliente y
  checklist de documentos (completo / pendiente / vencido) en un segundo
  modal.

Campañas y esas tres vistas llevan el badge **"En definición"**. Pensiones
(back-office) sigue disponible detrás de un flag.

## Datos: `js/data/copiloto-data.js`

Un solo archivo, fácil de editar, con el modelo jerárquico acordado:

- `lineasProducto`: **Fondos** (FIC y pensiones voluntarias), **Fiducia**,
  **Intermediación** (renta variable, renta fija, divisas) y **Alianza Corp**.
- `clientes[].productos[]`: cada producto pertenece a una `linea` y tiene un
  `tipo` (`fic`, `fpv`, `encargo`, `fideicomiso`, `rentaVariable`,
  `rentaFija`, `divisas`, `fcp`).
- `clientes[].lineaNegocio`: `dyv` (Distribución y ventas) o `nf` (Negocios
  fiduciarios). Por ahora solo está en el modelo, sin UI propia.
- `grupos`, `perfiles`, `senales`, `campanas`, `setupEtapas`,
  `setupDocumentos`, `setup`.

Los saldos **no se escriben dos veces**: `js/portafolio.js` los calcula
(renta variable = Σ cantidad × precio de mercado; renta fija = Σ valor de
mercado de los títulos), y de ahí salen las líneas, el cliente, el grupo y la
cartera. Así los totales cuadran en todas las pantallas.

### Modal de detalle de producto

`js/data/detalle-schema.js` define, por tipo de producto, las tarjetas
(`campos`), una tabla (`tabla`) y una subtabla de la fila elegida
(`subtabla`). Agregar las variables definitivas de un producto es solo
editar ese archivo. Los tipos sin variables definidas (`definido: false`)
muestran saldo, rentabilidad, fecha de apertura y la nota *"Variables de
detalle en definición"*.

## Flags y ajustes predefinidos (panel oculto)

El sitio no tiene build, así que no hay `.env`: el equivalente es
`js/feature-flags.js`, un registro de flags booleanos guardados en
`localStorage` (`alianza360:flags:v3`) que cada pantalla lee en `renderVals()`.

1. En cualquier pantalla, presiona **Ctrl + Shift + Alt + F**. Se abre un
   panel en la esquina inferior izquierda, visible solo para quien conoce el
   atajo.
2. Arriba, los ajustes predefinidos:
   - **Modo presentación** (por defecto): solo Mi cartera y Vista 360. Úsalo
     para enviar el mockup a Alianza sin módulos sin definir.
   - **Todos los módulos**: todo visible, con badges "En definición".
3. Debajo, cada flag agrupado (módulos del menú, Global, Vista 360, Mi
   cartera, Alertas, Siguiente mejor acción) para afinar a mano. El cambio
   se aplica al instante y queda guardado en ese navegador.
4. Vuelve a presionar el atajo (o `Esc`) para cerrar.

Si alguien entra por URL a un módulo oculto, ve un aviso con enlace a Mi cartera.

### Cómo agregar un flag nuevo

1. Agrega una entrada a `REGISTRY` en `js/feature-flags.js`
   (`group`, `label`, `presentacion`): aparece sola en el panel.
2. En el `.js` de la pantalla, léelo con `window.AlianzaFlags.get('miFlag')`
   dentro de `renderVals()`.
3. En el `.dc.html`, envuelve la sección con `<sc-if value="{{miFlag}}"> … </sc-if>`.
4. El Component debe suscribirse a los cambios en `componentDidMount` con
   `this._unwatch = window.AlianzaUI.watchFlags(this)` (ya lo hacen todas
   las pantallas internas).

Para un **módulo nuevo**: agrégalo a `MODULOS` en `js/ui.js` (con su `flag`
y `enDef`) y crea su página copiando la estructura de `pages/Campanas.dc.html`.

## Responsive

Estilos compartidos en `css/app.css` (menú y puntos de quiebre). El
contenido ocupa siempre todo el ancho disponible.

| Ancho | Menú | Contenido |
|---|---|---|
| ≥ 1280 px | Menú lateral completo | Vista 360 en una pantalla, sin scroll de página |
| 1024–1279 px | Riel de iconos (etiqueta como tooltip; punto verde = "En definición") | Tabla del 360 sin la columna "% de su línea" |
| < 1024 px | Barra superior con botón ☰ que despliega el menú (Esc lo cierra) | Columnas apiladas; KPI en 2 columnas |
| < 768 px | Igual | Tablas como tarjetas; el Asistente pasa a botón redondo |

Clases útiles: `.kpi-grid` (rejilla de indicadores), `.rt` / `.rt-head` /
`.rt-row` / `.rt-full` (tablas en grid que pasan a tarjetas en el teléfono).

El login ocupa exactamente la altura de la ventana (`css/Main.css`) y apila
sus dos paneles en pantallas angostas.

## Accesibilidad

- Objetivos clicables de al menos 44 px en las pantallas internas.
- Modales (`js/modal.js`): se cierran con `Esc`, atrapan el foco y lo
  devuelven al elemento que los abrió.
- Contraste de texto ≥ 4,5:1 con la paleta de marca (#003057, #0072CE,
  #00A3E0, #D2D755, #999B30).

## Pendientes de validar con Alianza

Están marcados en el código con `// TODO: confirmar …` (`grep -rn TODO js`):
nombres y clasificación de productos, rangos por perfil, variables de detalle
por tipo de producto, fórmula de liquidación estimada, criterios del modelo
de fuga y señales, campañas y reglas, etapas y documentos de setup.

## Cómo verlo

```bash
python3 -m http.server 8000   # luego abrir http://localhost:8000
```

También funciona abriendo `index.html` directamente con doble clic
(`file://`); las fuentes latinas, React y el runtime son locales, así que
no necesita conexión.
