/* Esquema del modal de detalle de producto (Vista 360), por tipo de producto.
   Agregar las variables definitivas de un producto = editar este archivo;
   el modal se arma solo a partir de aquí.

   Cada tipo puede declarar:
     campos   → tarjetas de resumen. `key` se busca primero en el producto
                calculado (saldo, invertido, rentPct, apertura, …) y luego en
                producto.datos. `fmt`: money | pct | signedPct | signedMoney |
                date | int | text.
     tabla    → tabla de filas. `fuente` es el arreglo del producto calculado
                (p. ej. 'posiciones'). Cada columna: key, label, fmt, align.
     subtabla → detalle de la fila seleccionada de `tabla` (p. ej. compras).
     nota     → texto al pie.
   Un tipo sin entrada (o con definido: false) usa `default`: campos básicos
   + la nota "Variables de detalle en definición". */
window.DetalleSchema = {

  // TODO: confirmar con Alianza — variables definitivas de renta variable.
  rentaVariable: {
    definido: true,
    campos: [
      { key: 'invertido', label: 'Valor de compra', fmt: 'money' },
      { key: 'saldo', label: 'Valor de mercado', fmt: 'money' },
      { key: 'liquidacion', label: 'Liquidación estimada del día', fmt: 'money' },
      { key: 'ganancia', label: 'Ganancia / pérdida', fmt: 'signedMoney' },
      { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct' }
    ],
    tabla: {
      titulo: 'Posiciones por emisor',
      fuente: 'posiciones',
      columnas: [
        { key: 'emisor', label: 'Emisor', fmt: 'text', sub: 'sector' },
        { key: 'cantidad', label: 'Cantidad de acciones', fmt: 'int', align: 'right' },
        { key: 'valorCompra', label: 'Valor de compra', fmt: 'money', align: 'right', sub: 'precioCompraTxt' },
        { key: 'valorMercado', label: 'Valor de mercado', fmt: 'money', align: 'right', sub: 'precioMercadoTxt' },
        { key: 'liquidacion', label: 'Liquidación estimada', fmt: 'money', align: 'right' },
        { key: 'ganancia', label: 'Ganancia / pérdida', fmt: 'signedMoney', align: 'right', sub: 'rentPctTxt' }
      ]
    },
    subtabla: {
      titulo: 'Compras por nominal calzado',
      fuente: 'compras',
      columnas: [
        { key: 'fecha', label: 'Fecha de compra', fmt: 'date' },
        { key: 'cantidad', label: 'Nominal (acciones)', fmt: 'int', align: 'right' },
        { key: 'precio', label: 'Precio de compra', fmt: 'price', align: 'right' },
        { key: 'valor', label: 'Valor', fmt: 'money', align: 'right' }
      ]
    },
    // TODO: confirmar con Alianza la fórmula de liquidación estimada (hoy 0,6 % en js/portafolio.js).
    nota: 'Liquidación estimada = valor de mercado menos comisión y costos de venta estimados (0,6 %). Precios de cierre del día de corte.'
  },

  // TODO: confirmar con Alianza — variables definitivas de renta fija.
  rentaFija: {
    definido: true,
    campos: [
      { key: 'invertido', label: 'Valor de compra', fmt: 'money' },
      { key: 'saldo', label: 'Valor de mercado', fmt: 'money' },
      { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct' },
      { key: 'apertura', label: 'Primera compra', fmt: 'date' }
    ],
    tabla: {
      titulo: 'Títulos en custodia',
      fuente: 'titulos',
      columnas: [
        { key: 'nombre', label: 'Título', fmt: 'text', sub: 'clase' },
        { key: 'tasa', label: 'Tasa', fmt: 'text' },
        { key: 'vencimiento', label: 'Vencimiento', fmt: 'date' },
        { key: 'valorCompra', label: 'Valor de compra', fmt: 'money', align: 'right' },
        { key: 'valorMercado', label: 'Valor de mercado', fmt: 'money', align: 'right' },
        { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct', align: 'right' }
      ]
    },
    nota: 'En CDT incluye intereses causados; en TES y bonos refleja la valoración a precio de mercado y aún no está realizada.'
  },

  // TODO: confirmar con Alianza — los FIC tendrán menos campos; estos son provisionales.
  fic: {
    definido: true,
    campos: [
      { key: 'saldo', label: 'Saldo', fmt: 'money' },
      { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct' },
      { key: 'apertura', label: 'Fecha de apertura', fmt: 'date' },
      { key: 'tipoFondo', label: 'Tipo de fondo', fmt: 'text' },
      { key: 'perfilFondo', label: 'Perfil del fondo', fmt: 'text' },
      { key: 'disponibilidad', label: 'Disponibilidad de recursos', fmt: 'text' }
    ]
  },

  // TODO: confirmar con Alianza — variables de encargos fiduciarios.
  encargo: {
    definido: true,
    campos: [
      { key: 'saldo', label: 'Saldo', fmt: 'money' },
      { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct' },
      { key: 'apertura', label: 'Fecha de apertura', fmt: 'date' },
      { key: 'vencimiento', label: 'Vencimiento', fmt: 'date' },
      { key: 'finalidad', label: 'Finalidad', fmt: 'text' },
      { key: 'fideicomitente', label: 'Fideicomitente', fmt: 'text' }
    ]
  },

  // Sin variables definidas todavía → usan `default`.
  fpv: { definido: false },
  fideicomiso: { definido: false },
  divisas: { definido: false },
  fcp: { definido: false },

  default: {
    campos: [
      { key: 'saldo', label: 'Saldo', fmt: 'money' },
      { key: 'rentPct', label: 'Rentabilidad', fmt: 'signedPct' },
      { key: 'apertura', label: 'Fecha de apertura', fmt: 'date' }
    ],
    nota: 'Variables de detalle en definición.'
  }
};
