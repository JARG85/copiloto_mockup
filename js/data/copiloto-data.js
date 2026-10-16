/* Datos de ejemplo del Copiloto Comercial — ÚNICO archivo de datos del mockup.
   Todo es ilustrativo: las fuentes reales aún no están definidas.

   Modelo jerárquico (acordado en la revisión del 15 oct 2026):
     Línea de producto (lineasProducto) → Producto (clientes[].productos[])
   Cada producto tiene un `tipo` (tiposProducto) que decide qué variables
   muestra su modal de detalle (ver js/data/detalle-schema.js).

   Los saldos están en millones de pesos (COP M). Saldo y rentabilidad de
   cada producto, de cada línea y del cliente se CALCULAN en js/portafolio.js
   a partir de este archivo, para que los totales siempre cuadren:
     - renta variable: saldo = Σ cantidad × precio de mercado de sus posiciones;
     - renta fija: saldo = Σ valor de mercado de sus títulos;
     - resto: saldo e invertido declarados aquí.
   Fechas en formato ISO (AAAA-MM-DD). */
window.CopilotoData = {

  corte: '2026-10-12',

  asesor: { nombre: 'Laura Gómez', iniciales: 'LG', cargo: 'Asesora · Bogotá' },

  // TODO: confirmar con Alianza — nombres y alcance de cada línea de producto.
  lineasProducto: [
    { id: 'fondos', nombre: 'Fondos', color: '#00A3E0', desc: 'Fondos de inversión colectiva y pensiones voluntarias' },
    { id: 'fiducia', nombre: 'Fiducia', color: '#0072CE', desc: 'Encargos y negocios fiduciarios' },
    { id: 'intermediacion', nombre: 'Intermediación', color: '#003057', desc: 'Comisionista de bolsa: renta variable, renta fija, divisas' },
    { id: 'corp', nombre: 'Alianza Corp', color: '#999B30', desc: 'Fondos de Alianza Corp' }
  ],

  // Líneas de negocio: solo quedan representadas en el modelo (campo
  // `lineaNegocio` de cada cliente); por ahora no tienen UI propia.
  lineasNegocio: {
    dyv: 'Distribución y ventas',
    nf: 'Negocios fiduciarios'
  },

  // Tipo de producto → etiqueta corta y clase de riesgo por defecto (para la
  // alineación frente al perfil). Un producto puede sobrescribir `clase`.
  // TODO: confirmar con Alianza la clasificación de riesgo de cada producto.
  tiposProducto: {
    fic: { tag: 'FIC', nombre: 'Fondo de inversión colectiva', clase: 'moderado' },
    fpv: { tag: 'FPV', nombre: 'Fondo de pensiones voluntarias', clase: 'moderado' },
    encargo: { tag: 'ENC', nombre: 'Encargo fiduciario', clase: 'conservador' },
    fideicomiso: { tag: 'FID', nombre: 'Fideicomiso', clase: 'conservador' },
    rentaVariable: { tag: 'RV', nombre: 'Renta variable', clase: 'mayor' },
    rentaFija: { tag: 'RF', nombre: 'Renta fija', clase: 'moderado' },
    divisas: { tag: 'DIV', nombre: 'Divisas', clase: 'mayor' },
    fcp: { tag: 'FCP', nombre: 'Fondo de capital privado', clase: 'mayor' }
  },

  // Rangos permitidos por perfil oficial (% del saldo).
  // TODO: confirmar con Alianza — rangos de la política de idoneidad vigente.
  perfiles: {
    'Conservador': { conservador: [60, 90], moderado: [10, 40], mayor: [0, 10] },
    'Moderado': { conservador: [30, 50], moderado: [30, 50], mayor: [10, 25] },
    'Mayor riesgo': { conservador: [10, 30], moderado: [20, 50], mayor: [25, 60] }
  },

  grupos: [
    { id: 'mejia', nombre: 'Grupo familiar Mejía Rueda', titular: 'cm' }
  ],

  // ────────────────────────────────────────────────────────────────────
  // CLIENTES DE LA CARTERA
  // TODO: confirmar con Alianza — nombres definitivos de productos.
  // Se usan nombres genéricos (FIC Alianza 1, Encargo fiduciario A, …).
  // ────────────────────────────────────────────────────────────────────
  clientes: [
    {
      id: 'cm', nombre: 'Carlos Andrés Mejía', iniciales: 'CM', tipoPersona: 'PN', documento: 'C.C. ••• 4821',
      segmento: 'Patrimonial', lineaNegocio: 'dyv', vinculacion: '2016-03-14',
      perfil: 'Moderado', perfilFecha: '2026-02-03', grupo: 'mejia', relacion: 'Titular',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 310 555 0148', preferido: true }, { tipo: 'Oficina', numero: '+57 601 555 0192' }],
        correos: [{ tipo: 'Personal', correo: 'carlos.mejia@correo-ejemplo.com', preferido: true }, { tipo: 'Corporativo', correo: 'cmejia@inversionesmejia-ejemplo.co' }],
        direccion: 'Cra. 11 # 93-45, apto 802 · Bogotá',
        canal: 'Llamada o WhatsApp · L–V 7:00–9:00'
      },
      financiera: { patrimonio: 18600, ingresosMensuales: 85, actualizado: '2026-02-03', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'cm-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 868, invertido: 812, apertura: '2016-03-14', datos: { tipoFondo: 'Abierto sin pacto de permanencia', perfilFondo: 'Conservador', disponibilidad: 'A la vista', unidades: 61234.18 } },
        { id: 'cm-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 250, invertido: 228, apertura: '2019-05-06', datos: { tipoFondo: 'Abierto con pacto de 30 días', perfilFondo: 'Moderado', disponibilidad: 'Al vencer el pacto', unidades: 18410.52 } },
        { id: 'cm-fic3', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 3', descripcion: 'Fondo balanceado · renta fija y variable', saldo: 455, invertido: 398, apertura: '2017-09-12', datos: { tipoFondo: 'Abierto sin pacto de permanencia', perfilFondo: 'Moderado', disponibilidad: 'T+3', unidades: 27703.9 } },
        { id: 'cm-fpv', linea: 'fondos', tipo: 'fpv', nombre: 'FPV Alianza · Plan individual', descripcion: 'Pensión voluntaria · beneficio tributario', saldo: 220, invertido: 192, apertura: '2020-11-23' },
        { id: 'cm-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario A', descripcion: 'Encargo de inversión · vence 02 ago 2027', saldo: 380, invertido: 362, apertura: '2025-08-02', datos: { vencimiento: '2027-08-02', finalidad: 'Inversión', fideicomitente: 'Carlos Andrés Mejía' } },
        { id: 'cm-rv', linea: 'intermediacion', tipo: 'rentaVariable', nombre: 'Renta variable', descripcion: 'Acciones locales · 6 emisores', apertura: '2018-06-14',
          posiciones: [
            { emisor: 'Emisor A', sector: 'Energía', cantidad: 120000, precioCompra: 1850, precioMercado: 2410, compras: [['2018-06-14', 60000, 1720], ['2020-04-02', 40000, 1600], ['2023-01-11', 20000, 2740]] },
            { emisor: 'Emisor B', sector: 'Sector bancario', cantidad: 7500, precioCompra: 31200, precioMercado: 36800, compras: [['2018-09-20', 5000, 30100], ['2022-03-15', 2500, 33400]] },
            { emisor: 'Emisor C', sector: 'Infraestructura', cantidad: 14000, precioCompra: 17400, precioMercado: 15900, compras: [['2019-11-08', 8000, 16300], ['2024-07-27', 6000, 18867]] },
            { emisor: 'Emisor D', sector: 'Holding', cantidad: 18000, precioCompra: 11200, precioMercado: 14150, compras: [['2021-02-03', 10000, 10400], ['2023-10-19', 8000, 12200]] },
            { emisor: 'Emisor E', sector: 'Seguros', cantidad: 6000, precioCompra: 28900, precioMercado: 26100, compras: [['2022-05-12', 6000, 28900]] },
            { emisor: 'Emisor F', sector: 'Alimentos', cantidad: 2500, precioCompra: 30000, precioMercado: 40760, compras: [['2019-08-22', 1500, 28500], ['2021-12-09', 1000, 32250]] }
          ] },
        { id: 'cm-rf', linea: 'intermediacion', tipo: 'rentaFija', nombre: 'Renta fija', descripcion: 'CDT, TES y bonos en custodia', apertura: '2017-02-20',
          titulos: [
            { nombre: 'CDT Banco A · 180 días', clase: 'CDT', tasa: '10,4 % E.A.', vencimiento: '2027-03-14', valorCompra: 416.5, valorMercado: 420 },
            { nombre: 'TES tasa fija 2031', clase: 'Deuda pública', tasa: 'Cupón 7,0 %', vencimiento: '2031-03-26', valorCompra: 266, valorMercado: 250 },
            { nombre: 'Bono corporativo Emisor G 2029', clase: 'Bono AAA', tasa: 'IPC + 4,1 %', vencimiento: '2029-06-30', valorCompra: 265, valorMercado: 279 }
          ] },
        { id: 'cm-div', linea: 'intermediacion', tipo: 'divisas', nombre: 'Divisas · USD', descripcion: 'Cuenta de compensación en dólares', saldo: 60, invertido: 57, apertura: '2024-02-14' },
        { id: 'cm-fcp', linea: 'corp', tipo: 'fcp', nombre: 'FCP Alianza Corp Inmobiliario', descripcion: 'Fondo de capital privado · cerrado', saldo: 337, invertido: 300, apertura: '2021-03-01' }
      ],
      interacciones: [
        { fecha: '2026-09-28', tipo: 'Llamada saliente · 12 min', nota: 'Preguntó por rentabilidad de renta fija frente a CDT bancarios.' },
        { fecha: '2026-09-22', tipo: 'Retiro por portal', nota: '$310 M desde FIC Alianza 1 a cuenta en otra entidad.' },
        { fecha: '2026-08-10', tipo: 'Reunión presencial', nota: 'Revisión semestral. Solicitó informe consolidado del grupo.' },
        { fecha: '2026-06-18', tipo: 'Correo enviado', nota: 'Extracto consolidado del primer semestre.' },
        { fecha: '2026-02-03', tipo: 'Actualización de perfil', nota: 'Resultado: Moderado (antes Mayor riesgo).' },
        { fecha: '2025-12-11', tipo: 'Reunión virtual', nota: 'Planeación de aportes a pensión voluntaria para 2026.' }
      ],
      movimientos: [{ fecha: '2026-09-22', tipo: 'retiro', producto: 'FIC Alianza 1', monto: 310 }],
      riesgo: { d30: 58, d60: 72, enRiesgo: 1640,
        factores: [['Retiro parcial de $310 M (22 sep)', 18], ['Saldo en caída 3 meses consecutivos', 12], ['Rentabilidad renta fija bajo referencia 2 trimestres', 9], ['Consulta a tasas de CDT en última llamada', 6], ['Relación de más de 10 años con Alianza', -7], ['Grupo familiar con varios productos activos', -5]] },
      nba: [
        { id: 'a', titulo: 'Llamada de retención esta semana', tag: 'Retención', porque: 'Riesgo de fuga alto y retiro reciente. Propón revisión de la estrategia de renta fija antes de que traslade más saldo.', evidencia: 'modelo de fuga, movimientos, CRM', confianza: 86 },
        { id: 'b', titulo: 'Rebalanceo hacia el perfil Moderado', tag: 'Idoneidad', porque: 'Reducir mayor riesgo hacia el máximo de 25 % y subir la porción conservadora. Requiere tu validación en suitability.', evidencia: 'perfil oficial, extracto sep-2026', confianza: 81 },
        { id: 'c', titulo: 'Renovación del encargo de la SAS', tag: 'Profundización', porque: 'El encargo fiduciario de Inversiones Mejía SAS vence el 18 nov. Anticipa la renovación en la misma reunión.', evidencia: 'contratos, grupo familiar', confianza: 74 }
      ],
      briefing: [
        'Retiró $310 M de FIC Alianza 1 el 22 sep y su saldo cae por tercer mes consecutivo.',
        'Su exposición a mayor riesgo supera el rango de su perfil Moderado, principalmente por acciones locales.',
        'En la última llamada (28 sep) preguntó por alternativas con mejor rentabilidad en renta fija.',
        'Inversiones Mejía SAS concentra una parte relevante del grupo; su encargo fiduciario vence el 18 nov.'
      ]
    },

    {
      id: 'ar', nombre: 'Ana María Rueda', iniciales: 'AR', tipoPersona: 'PN', documento: 'C.C. ••• 3307',
      segmento: 'Patrimonial', lineaNegocio: 'dyv', vinculacion: '2017-05-02',
      perfil: 'Conservador', perfilFecha: '2025-11-14', grupo: 'mejia', relacion: 'Cónyuge',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 315 555 0127', preferido: true }],
        correos: [{ tipo: 'Personal', correo: 'ana.rueda@correo-ejemplo.com', preferido: true }],
        direccion: 'Cra. 11 # 93-45, apto 802 · Bogotá',
        canal: 'Correo · respuesta en el día'
      },
      financiera: { patrimonio: 6200, ingresosMensuales: 32, actualizado: '2025-11-14', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'ar-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 300, invertido: 288, apertura: '2017-05-02' },
        { id: 'ar-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 420, invertido: 392, apertura: '2018-08-21' },
        { id: 'ar-fpv', linea: 'fondos', tipo: 'fpv', nombre: 'FPV Alianza · Plan individual', descripcion: 'Pensión voluntaria · beneficio tributario', saldo: 280, invertido: 250, apertura: '2019-12-10' },
        { id: 'ar-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario B', descripcion: 'Encargo de inversión · vence 15 may 2027', saldo: 300, invertido: 291, apertura: '2025-05-15', datos: { vencimiento: '2027-05-15', finalidad: 'Inversión', fideicomitente: 'Ana María Rueda' } },
        { id: 'ar-rf', linea: 'intermediacion', tipo: 'rentaFija', nombre: 'Renta fija', descripcion: 'CDT en custodia', apertura: '2024-01-18',
          titulos: [{ nombre: 'CDT Banco C · 360 días', clase: 'CDT', tasa: '9,8 % E.A.', vencimiento: '2027-01-18', valorCompra: 262, valorMercado: 280 }] }
      ],
      interacciones: [
        { fecha: '2026-08-10', tipo: 'Reunión presencial', nota: 'Acompañó la revisión semestral del grupo.' },
        { fecha: '2026-05-04', tipo: 'Correo recibido', nota: 'Solicitó certificado tributario del FPV.' },
        { fecha: '2025-11-14', tipo: 'Actualización de perfil', nota: 'Resultado: Conservador.' }
      ],
      riesgo: { d30: 22, d60: 35, factores: [['Sin contacto directo en 60 días', 6], ['Perfil al día', -4], ['Grupo familiar con varios productos activos', -5]] },
      nba: [{ id: 'a', titulo: 'Recordar aporte FPV antes de diciembre', tag: 'Profundización', porque: 'Aún tiene cupo de beneficio tributario para 2026.', evidencia: 'aportes FPV 2026', confianza: 72 }]
    },

    {
      id: 'sm', nombre: 'Santiago Mejía Rueda', iniciales: 'SM', tipoPersona: 'PN', documento: 'C.C. ••• 9915',
      segmento: 'Preferente', lineaNegocio: 'dyv', vinculacion: '2021-08-10',
      perfil: 'Mayor riesgo', perfilFecha: '2025-08-09', grupo: 'mejia', relacion: 'Hijo',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 318 555 0163', preferido: true }],
        correos: [{ tipo: 'Personal', correo: 'santiago.mejia@correo-ejemplo.com', preferido: true }],
        direccion: 'Cl. 70A # 5-21 · Bogotá',
        canal: 'WhatsApp'
      },
      financiera: { patrimonio: 780, ingresosMensuales: 14, actualizado: '2025-08-09', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'sm-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 80, invertido: 77, apertura: '2021-08-10' },
        { id: 'sm-fic3', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 3', descripcion: 'Fondo balanceado · renta fija y variable', saldo: 100, invertido: 90, apertura: '2022-02-01' },
        { id: 'sm-rv', linea: 'intermediacion', tipo: 'rentaVariable', nombre: 'Renta variable', descripcion: 'Acciones locales · 1 emisor', apertura: '2022-06-15',
          posiciones: [{ emisor: 'Emisor A', sector: 'Energía', cantidad: 50000, precioCompra: 2100, precioMercado: 2410, compras: [['2022-06-15', 30000, 1980], ['2024-03-08', 20000, 2280]] }] },
        { id: 'sm-div', linea: 'intermediacion', tipo: 'divisas', nombre: 'Divisas · USD', descripcion: 'Cuenta de compensación en dólares', saldo: 59.5, invertido: 55, apertura: '2023-09-04' }
      ],
      interacciones: [
        { fecha: '2026-09-02', tipo: 'Chat en portal', nota: 'Consultó cómo comprar acciones adicionales.' },
        { fecha: '2025-08-09', tipo: 'Actualización de perfil', nota: 'Resultado: Mayor riesgo.' }
      ],
      riesgo: { d30: 12, d60: 20, factores: [['Uso frecuente del portal', -6], ['Aportes recurrentes', -4]] },
      nba: [{ id: 'a', titulo: 'Ofrecer acompañamiento en renta variable', tag: 'Profundización', porque: 'Consultó por compra de acciones; su perfil lo permite.', evidencia: 'chat portal, perfil', confianza: 64 }]
    },

    {
      id: 'im', nombre: 'Inversiones Mejía SAS', iniciales: 'IM', tipoPersona: 'PJ', documento: 'NIT ••• 317-4',
      segmento: 'Empresarial', lineaNegocio: 'nf', vinculacion: '2018-02-20',
      perfil: 'Moderado', perfilFecha: '2026-01-22', grupo: 'mejia', relacion: 'Empresa del titular',
      contacto: {
        telefonos: [{ tipo: 'PBX', numero: '+57 601 555 0100', preferido: true }, { tipo: 'Celular gerente', numero: '+57 310 555 0148' }],
        correos: [{ tipo: 'Tesorería', correo: 'tesoreria@inversionesmejia-ejemplo.co', preferido: true }],
        direccion: 'Cl. 93 # 13-24, of. 501 · Bogotá',
        canal: 'Correo a tesorería · copia al gerente'
      },
      financiera: { patrimonio: 26500, ingresosMensuales: 410, actualizado: '2026-01-22', fuente: 'Estados financieros 2025' },
      productos: [
        { id: 'im-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 650, invertido: 620, apertura: '2018-02-20' },
        { id: 'im-fic3', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 3', descripcion: 'Fondo balanceado · renta fija y variable', saldo: 300, invertido: 275, apertura: '2019-04-11' },
        { id: 'im-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario C', descripcion: 'Encargo de inversión · vence 18 nov 2026', saldo: 1500, invertido: 1420, apertura: '2024-11-18', datos: { vencimiento: '2026-11-18', finalidad: 'Inversión de excedentes', fideicomitente: 'Inversiones Mejía SAS' } },
        { id: 'im-rv', linea: 'intermediacion', tipo: 'rentaVariable', nombre: 'Renta variable', descripcion: 'Acciones locales · 2 emisores', apertura: '2020-03-05',
          posiciones: [
            { emisor: 'Emisor A', sector: 'Energía', cantidad: 142000, precioCompra: 2050, precioMercado: 2410, compras: [['2020-03-05', 100000, 1950], ['2022-10-03', 42000, 2288.1]] },
            { emisor: 'Emisor D', sector: 'Holding', cantidad: 13200, precioCompra: 11800, precioMercado: 14150, compras: [['2021-05-18', 13200, 11800]] }
          ] },
        { id: 'im-fcp', linea: 'corp', tipo: 'fcp', nombre: 'FCP Alianza Corp Inmobiliario', descripcion: 'Fondo de capital privado · cerrado', saldo: 600, invertido: 540, apertura: '2021-03-01' },
        { id: 'im-fcp2', linea: 'corp', tipo: 'fcp', nombre: 'FCP Alianza Corp Infraestructura', descripcion: 'Fondo de capital privado · cerrado', saldo: 421, invertido: 400, apertura: '2023-07-17' }
      ],
      interacciones: [
        { fecha: '2026-09-15', tipo: 'Correo enviado', nota: 'Propuesta preliminar de renovación del encargo fiduciario.' },
        { fecha: '2026-08-10', tipo: 'Reunión presencial', nota: 'Revisión semestral del grupo.' },
        { fecha: '2026-01-22', tipo: 'Actualización de perfil', nota: 'Resultado: Moderado.' }
      ],
      riesgo: { d30: 36, d60: 48, factores: [['Encargo fiduciario vence en menos de 60 días', 14], ['Propuesta de renovación sin respuesta', 6], ['Relación de 8 años con Alianza', -5]] },
      nba: [{ id: 'a', titulo: 'Cerrar renovación del encargo fiduciario C', tag: 'Retención', porque: 'Vence el 18 nov y la propuesta enviada el 15 sep sigue sin respuesta.', evidencia: 'contratos, correo', confianza: 83 }]
    },

    {
      id: 'ae', nombre: 'Agropecuaria La Esperanza SAS', iniciales: 'AE', tipoPersona: 'PJ', documento: 'NIT ••• 552-1',
      segmento: 'Empresarial', lineaNegocio: 'nf', vinculacion: '2019-11-05',
      perfil: 'Conservador', perfilFecha: '2025-10-30', grupo: 'mejia', relacion: 'Empresa familiar',
      contacto: {
        telefonos: [{ tipo: 'PBX', numero: '+57 608 555 0177', preferido: true }],
        correos: [{ tipo: 'Gerencia', correo: 'gerencia@laesperanza-ejemplo.co', preferido: true }],
        direccion: 'Km 4 vía Villavicencio–Restrepo · Meta',
        canal: 'Llamada al gerente'
      },
      financiera: { patrimonio: 8900, ingresosMensuales: 260, actualizado: '2025-10-30', fuente: 'Estados financieros 2024' },
      productos: [
        { id: 'ae-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 222, invertido: 214, apertura: '2019-11-05' },
        { id: 'ae-fic3', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 3', descripcion: 'Fondo balanceado · renta fija y variable', saldo: 65, invertido: 61, apertura: '2021-06-08' },
        { id: 'ae-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario D', descripcion: 'Administración de pagos · vence 30 jun 2027', saldo: 311, invertido: 300, apertura: '2023-06-30', datos: { vencimiento: '2027-06-30', finalidad: 'Administración y pagos', fideicomitente: 'Agropecuaria La Esperanza SAS' } },
        { id: 'ae-rf', linea: 'intermediacion', tipo: 'rentaFija', nombre: 'Renta fija', descripcion: 'CDT en custodia', apertura: '2025-02-10',
          titulos: [{ nombre: 'CDT Banco A · 360 días', clase: 'CDT', tasa: '9,6 % E.A.', vencimiento: '2027-02-10', valorCompra: 97, valorMercado: 100 }] },
        { id: 'ae-fcp', linea: 'corp', tipo: 'fcp', nombre: 'FCP Alianza Corp Inmobiliario', descripcion: 'Fondo de capital privado · cerrado', saldo: 302, invertido: 280, apertura: '2021-03-01' }
      ],
      interacciones: [
        { fecha: '2026-07-21', tipo: 'Llamada saliente · 8 min', nota: 'Confirmó flujo de pagos de cosecha del segundo semestre.' },
        { fecha: '2025-10-30', tipo: 'Actualización de perfil', nota: 'Resultado: Conservador.' }
      ],
      riesgo: { d30: 22, d60: 30, factores: [['Estados financieros desactualizados', 7], ['Pagos recurrentes por el encargo', -6]] },
      nba: [{ id: 'a', titulo: 'Solicitar estados financieros 2025', tag: 'Idoneidad', porque: 'Los estados financieros cargados son de 2024.', evidencia: 'setup del cliente', confianza: 77 }]
    },

    {
      id: 'ca', nombre: 'Constructora Altamar SAS', iniciales: 'CA', tipoPersona: 'PJ', documento: 'NIT ••• 804-9',
      segmento: 'Empresarial', lineaNegocio: 'nf', vinculacion: '2015-09-01',
      perfil: 'Conservador', perfilFecha: '2026-03-12',
      contacto: {
        telefonos: [{ tipo: 'PBX', numero: '+57 605 555 0110', preferido: true }],
        correos: [{ tipo: 'Tesorería', correo: 'tesoreria@altamar-ejemplo.co', preferido: true }],
        direccion: 'Cra. 54 # 72-80, piso 9 · Barranquilla',
        canal: 'Reunión con gerente financiero'
      },
      financiera: { patrimonio: 41200, ingresosMensuales: 2350, actualizado: '2026-03-12', fuente: 'Estados financieros 2025' },
      productos: [
        { id: 'ca-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 1850, invertido: 1790, apertura: '2015-09-01' },
        { id: 'ca-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 1100, invertido: 1040, apertura: '2018-02-14' },
        { id: 'ca-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario E', descripcion: 'Preventa de proyecto · vence 05 dic 2026', saldo: 3200, invertido: 3110, apertura: '2024-12-05', datos: { vencimiento: '2026-12-05', finalidad: 'Preventas proyecto Altamar Plaza', fideicomitente: 'Constructora Altamar SAS' } }
      ],
      interacciones: [
        { fecha: '2026-09-30', tipo: 'Reunión virtual', nota: 'Mencionó que cotizó condiciones con otra fiduciaria.' },
        { fecha: '2026-06-12', tipo: 'Correo enviado', nota: 'Informe trimestral del encargo.' }
      ],
      riesgo: { d30: 61, d60: 69, factores: [['Cotizó con otra fiduciaria', 16], ['Encargo vence en menos de 60 días', 11], ['Relación de 11 años con Alianza', -6]] },
      nba: [{ id: 'a', titulo: 'Reunión con gerente financiero', tag: 'Retención', porque: 'Cotizó con otra fiduciaria y su encargo vence el 05 dic.', evidencia: 'CRM, contratos', confianza: 84 }]
    },

    {
      id: 'lo', nombre: 'Lucía Fernanda Ospina', iniciales: 'LO', tipoPersona: 'PN', documento: 'C.C. ••• 1180',
      segmento: 'Patrimonial', lineaNegocio: 'dyv', vinculacion: '2018-04-23',
      perfil: 'Moderado', perfilFecha: '2025-12-02',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 311 555 0190', preferido: true }],
        correos: [{ tipo: 'Personal', correo: 'lucia.ospina@correo-ejemplo.com', preferido: true }],
        direccion: 'Cl. 10 Sur # 28-15 · Medellín',
        canal: 'Llamada · tardes'
      },
      financiera: { patrimonio: 9800, ingresosMensuales: 48, actualizado: '2025-12-02', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'lo-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 610, invertido: 590, apertura: '2018-04-23' },
        { id: 'lo-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 900, invertido: 845, apertura: '2019-07-30' },
        { id: 'lo-fpv', linea: 'fondos', tipo: 'fpv', nombre: 'FPV Alianza · Plan individual', descripcion: 'Pensión voluntaria · beneficio tributario', saldo: 400, invertido: 350, apertura: '2020-12-15' },
        { id: 'lo-rf', linea: 'intermediacion', tipo: 'rentaFija', nombre: 'Renta fija', descripcion: 'Bonos en custodia', apertura: '2023-05-02',
          titulos: [{ nombre: 'Bono corporativo Emisor H 2028', clase: 'Bono AA+', tasa: 'IPC + 3,6 %', vencimiento: '2028-05-02', valorCompra: 382, valorMercado: 400 }] }
      ],
      interacciones: [
        { fecha: '2026-09-01', tipo: 'Llamada entrante · 5 min', nota: 'Avisó que trasladaría recursos para compra de vivienda.' },
        { fecha: '2026-03-18', tipo: 'Reunión presencial', nota: 'Revisión anual del portafolio.' }
      ],
      movimientos: [{ fecha: '2026-08-30', tipo: 'retiro', producto: 'FIC Alianza 1', monto: 1100 }],
      riesgo: { d30: 49, d60: 67, factores: [['Retiro de 32 % del saldo (30 ago)', 17], ['Sin contacto en 41 días', 10], ['Saldo cae 4 meses seguidos', 8], ['FPV con beneficio tributario vigente', -5]] },
      nba: [{ id: 'a', titulo: 'Revisión de estrategia tras el retiro', tag: 'Retención', porque: 'Retiró un tercio de su saldo y no ha habido contacto desde entonces.', evidencia: 'movimientos, CRM', confianza: 79 }]
    },

    {
      id: 'jc', nombre: 'Jorge Iván Castaño', iniciales: 'JC', tipoPersona: 'PN', documento: 'C.C. ••• 7742',
      segmento: 'Preferente', lineaNegocio: 'dyv', vinculacion: '2020-01-27',
      perfil: 'Mayor riesgo', perfilFecha: '2025-06-19',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 312 555 0134', preferido: true }],
        correos: [{ tipo: 'Personal', correo: 'jorge.castano@correo-ejemplo.com', preferido: true }],
        direccion: 'Av. 6N # 23-50 · Cali',
        canal: 'WhatsApp'
      },
      financiera: { patrimonio: 3100, ingresosMensuales: 26, actualizado: '2025-06-19', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'jc-fic3', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 3', descripcion: 'Fondo balanceado · renta fija y variable', saldo: 300, invertido: 288, apertura: '2020-01-27' },
        { id: 'jc-rv', linea: 'intermediacion', tipo: 'rentaVariable', nombre: 'Renta variable', descripcion: 'Acciones locales · 2 emisores', apertura: '2020-02-10',
          posiciones: [
            { emisor: 'Emisor F', sector: 'Alimentos', cantidad: 8000, precioCompra: 38400, precioMercado: 40760, compras: [['2023-04-18', 8000, 38400]] },
            { emisor: 'Emisor C', sector: 'Infraestructura', cantidad: 12000, precioCompra: 18100, precioMercado: 15900, compras: [['2020-02-10', 7000, 17500], ['2024-09-02', 5000, 18940]] }
          ] },
        { id: 'jc-div', linea: 'intermediacion', tipo: 'divisas', nombre: 'Divisas · USD', descripcion: 'Cuenta de compensación en dólares', saldo: 163.12, invertido: 158, apertura: '2022-11-03' }
      ],
      interacciones: [
        { fecha: '2026-08-22', tipo: 'Chat en portal', nota: 'Reclamó por la rentabilidad del fondo balanceado.' },
        { fecha: '2026-02-11', tipo: 'Llamada saliente · 9 min', nota: 'Seguimiento a posición en Emisor C.' }
      ],
      riesgo: { d30: 52, d60: 66, factores: [['Rentabilidad bajo referencia', 13], ['Reclamo reciente en portal', 9], ['Perfil por vencer', 4]] },
      nba: [{ id: 'a', titulo: 'Propuesta de rebalanceo', tag: 'Idoneidad', porque: 'Su posición en Emisor C acumula pérdida y reclamó por rentabilidad.', evidencia: 'portafolio, CRM', confianza: 71 }]
    },

    {
      id: 'cv', nombre: 'Comercializadora del Valle SAS', iniciales: 'CV', tipoPersona: 'PJ', documento: 'NIT ••• 228-6',
      segmento: 'Empresarial', lineaNegocio: 'dyv', vinculacion: '2017-10-09',
      perfil: 'Conservador', perfilFecha: '2026-04-28',
      contacto: {
        telefonos: [{ tipo: 'PBX', numero: '+57 602 555 0155', preferido: true }],
        correos: [{ tipo: 'Tesorería', correo: 'tesoreria@comvalle-ejemplo.co', preferido: true }],
        direccion: 'Cl. 15 # 26-100, bodega 3 · Yumbo',
        canal: 'Correo a tesorería'
      },
      financiera: { patrimonio: 15400, ingresosMensuales: 1280, actualizado: '2026-04-28', fuente: 'Estados financieros 2025' },
      productos: [
        { id: 'cv-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 1900, invertido: 1850, apertura: '2017-10-09' },
        { id: 'cv-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 500, invertido: 471, apertura: '2020-05-19' },
        { id: 'cv-enc', linea: 'fiducia', tipo: 'encargo', nombre: 'Encargo fiduciario F', descripcion: 'Administración de pagos · vence 20 abr 2027', saldo: 1000, invertido: 962, apertura: '2024-04-20', datos: { vencimiento: '2027-04-20', finalidad: 'Administración y pagos', fideicomitente: 'Comercializadora del Valle SAS' } }
      ],
      interacciones: [
        { fecha: '2026-10-07', tipo: 'Llamada saliente · 15 min', nota: 'Confirmó que el retiro fue para capital de trabajo; volverá a invertir en enero.' },
        { fecha: '2026-09-19', tipo: 'Retiro por portal', nota: '$1.480 M desde FIC Alianza 1.' }
      ],
      movimientos: [{ fecha: '2026-09-19', tipo: 'retiro', producto: 'FIC Alianza 1', monto: 1480 }],
      riesgo: { d30: 44, d60: 58, factores: [['Retiro de 30 % del saldo (19 sep)', 14], ['Uso del portal en descenso', 6], ['Contacto reciente con el asesor', -8]] },
      nba: [{ id: 'a', titulo: 'Contacto de seguimiento en enero', tag: 'Retención', porque: 'Anunció que reinvertirá en enero; agenda el recordatorio.', evidencia: 'CRM', confianza: 68 }]
    },

    {
      id: 'ma', nombre: 'Marta Cecilia Arango', iniciales: 'MA', tipoPersona: 'PN', documento: 'C.C. ••• 5093',
      segmento: 'Patrimonial', lineaNegocio: 'dyv', vinculacion: '2016-11-30',
      perfil: 'Conservador', perfilFecha: '2026-05-06',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 314 555 0119', preferido: true }, { tipo: 'Fijo', numero: '+57 604 555 0187' }],
        correos: [{ tipo: 'Personal', correo: 'marta.arango@correo-ejemplo.com', preferido: true }],
        direccion: 'Cra. 43A # 1-50, apto 1101 · Medellín',
        canal: 'Llamada · mañanas'
      },
      financiera: { patrimonio: 7300, ingresosMensuales: 30, actualizado: '2026-05-06', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'ma-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 600, invertido: 581, apertura: '2016-11-30' },
        { id: 'ma-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 500, invertido: 468, apertura: '2018-03-12' },
        { id: 'ma-fpv', linea: 'fondos', tipo: 'fpv', nombre: 'FPV Alianza · Plan individual', descripcion: 'Pensión voluntaria · beneficio tributario', saldo: 218.4, invertido: 196, apertura: '2021-10-04' },
        { id: 'ma-rv', linea: 'intermediacion', tipo: 'rentaVariable', nombre: 'Renta variable', descripcion: 'Acciones locales · 1 emisor', apertura: '2019-07-08',
          posiciones: [{ emisor: 'Emisor B', sector: 'Sector bancario', cantidad: 12000, precioCompra: 30500, precioMercado: 36800, compras: [['2019-07-08', 12000, 30500]] }] }
      ],
      interacciones: [
        { fecha: '2026-09-24', tipo: 'Llamada saliente · 7 min', nota: 'Se le explicó que su exposición a acciones supera su perfil.' },
        { fecha: '2026-05-06', tipo: 'Actualización de perfil', nota: 'Resultado: Conservador (antes Moderado).' }
      ],
      riesgo: { d30: 31, d60: 47, factores: [['Exposición alta a acciones frente al perfil', 9], ['Cambio de perfil reciente', 6], ['Contacto en las últimas 3 semanas', -5]] },
      nba: [{ id: 'a', titulo: 'Suitability asistida', tag: 'Idoneidad', porque: 'Su perfil cambió a Conservador y mantiene 25 % en acciones.', evidencia: 'perfil oficial, portafolio', confianza: 80 }]
    },

    {
      id: 'af', nombre: 'Andrés Felipe Rojas', iniciales: 'AF', tipoPersona: 'PN', documento: 'C.C. ••• 6628',
      segmento: 'Preferente', lineaNegocio: 'dyv', vinculacion: '2022-03-14',
      perfil: 'Moderado', perfilFecha: '2024-09-15',
      contacto: {
        telefonos: [{ tipo: 'Celular', numero: '+57 316 555 0172', preferido: true }],
        correos: [{ tipo: 'Personal', correo: 'andres.rojas@correo-ejemplo.com', preferido: true }],
        direccion: 'Cl. 50 # 27-31 · Bucaramanga',
        canal: 'Correo'
      },
      financiera: { patrimonio: 1450, ingresosMensuales: 18, actualizado: '2024-09-15', fuente: 'Formulario de conocimiento del cliente' },
      productos: [
        { id: 'af-fic1', linea: 'fondos', tipo: 'fic', clase: 'conservador', nombre: 'FIC Alianza 1', descripcion: 'Fondo abierto · liquidez a la vista', saldo: 240, invertido: 233, apertura: '2022-03-14' },
        { id: 'af-fpv', linea: 'fondos', tipo: 'fpv', nombre: 'FPV Alianza · Plan individual', descripcion: 'Pensión voluntaria · beneficio tributario', saldo: 400, invertido: 371, apertura: '2022-03-14' }
      ],
      interacciones: [
        { fecha: '2026-07-02', tipo: 'Correo enviado', nota: 'Recordatorio de actualización de datos y perfil.' }
      ],
      riesgo: { d30: 22, d60: 35, factores: [['Perfil de riesgo vencido', 8], ['Sin respuesta a recordatorios', 5], ['Aportes FPV recurrentes', -6]] },
      nba: [{ id: 'a', titulo: 'Actualizar perfil y datos', tag: 'Idoneidad', porque: 'Su perfil venció en septiembre de 2025.', evidencia: 'perfil oficial, setup', confianza: 88 }]
    },

    {
      id: 'dp', nombre: 'Patrimonio Familia Duarte Pinzón', iniciales: 'DP', tipoPersona: 'PJ', documento: 'NIT ••• 610-2',
      segmento: 'Patrimonial', lineaNegocio: 'nf', vinculacion: '2014-06-02',
      perfil: 'Moderado', perfilFecha: '2026-06-10',
      contacto: {
        telefonos: [{ tipo: 'Celular representante', numero: '+57 300 555 0105', preferido: true }],
        correos: [{ tipo: 'Representante', correo: 'familia.duarte@correo-ejemplo.com', preferido: true }],
        direccion: 'Cl. 81 # 9-12 · Bogotá',
        canal: 'Reunión presencial trimestral'
      },
      financiera: { patrimonio: 22800, ingresosMensuales: 120, actualizado: '2026-06-10', fuente: 'Estados financieros del patrimonio' },
      productos: [
        { id: 'dp-fid', linea: 'fiducia', tipo: 'fideicomiso', nombre: 'Fideicomiso de administración A', descripcion: 'Patrimonio autónomo familiar', saldo: 3600, invertido: 3380, apertura: '2014-06-02' },
        { id: 'dp-fic2', linea: 'fondos', tipo: 'fic', nombre: 'FIC Alianza 2', descripcion: 'Fondo de renta fija · pacto 30 días', saldo: 1000, invertido: 940, apertura: '2017-01-16' },
        { id: 'dp-fcp', linea: 'corp', tipo: 'fcp', nombre: 'FCP Alianza Corp Inmobiliario', descripcion: 'Fondo de capital privado · cerrado', saldo: 600, invertido: 535, apertura: '2021-03-01' }
      ],
      interacciones: [
        { fecha: '2026-09-10', tipo: 'Reunión presencial', nota: 'Revisión trimestral; interés en un nuevo encargo para la segunda generación.' }
      ],
      riesgo: { d30: 12, d60: 18, factores: [['Relación de 12 años con Alianza', -8], ['Reuniones trimestrales al día', -5]] },
      nba: [{ id: 'a', titulo: 'Profundizar: nuevo encargo', tag: 'Profundización', porque: 'Mostró interés en un encargo para la segunda generación.', evidencia: 'CRM', confianza: 76 }]
    }
  ],

  // ────────────────────────────────────────────────────────────────────
  // ALERTAS · señales anticipadas (hoy Alianza solo ve lo que ya pasó).
  // Cada señal es una regla en lenguaje natural + una función de prueba
  // sobre el cliente ya calculado (ver Portafolio.cliente()).
  // TODO: confirmar con el área comercial los criterios del modelo.
  // ────────────────────────────────────────────────────────────────────
  senales: [
    { id: 'retiroSinContacto', nombre: 'Retiro relevante sin contacto posterior',
      regla: 'Retiró entre el 30 % y el 50 % de su saldo en los últimos 90 días y no ha tenido contacto en 30 días o más.',
      prueba: c => c.retiroPct >= 30 && c.retiroPct <= 50 && c.diasSinContacto >= 30 },
    { id: 'retiroContactado', nombre: 'Retiro relevante ya gestionado',
      regla: 'Retiró entre el 30 % y el 50 % de su saldo en los últimos 90 días, pero hubo contacto posterior.',
      prueba: c => c.retiroPct >= 30 && c.retiroPct <= 50 && c.diasSinContacto < 30 },
    { id: 'vencimiento', nombre: 'Vencimiento de encargo próximo',
      regla: 'Tiene un encargo fiduciario que vence en los próximos 60 días.',
      prueba: c => c.productos.some(p => p.datos && p.datos.vencimiento && p.diasAlVencimiento >= 0 && p.diasAlVencimiento <= 60) },
    { id: 'perfilVencido', nombre: 'Perfil de riesgo vencido',
      regla: 'Su perfil de riesgo tiene más de 12 meses sin actualizar.',
      prueba: c => c.diasPerfil > 365 }
  ],

  // ────────────────────────────────────────────────────────────────────
  // CAMPAÑAS COMERCIALES (no transaccionales; las transaccionales son v2).
  // TODO: confirmar con Alianza — campañas y reglas reales del área comercial.
  // ────────────────────────────────────────────────────────────────────
  campanas: [
    { id: 'fpv26', nombre: 'FPV · cierre tributario 2026', producto: 'FPV Alianza · Plan individual', linea: 'fondos', desde: '2026-10-01', hasta: '2026-12-20', area: 'Gerencia comercial · Fondos',
      regla: 'Personas naturales con saldo total mayor a $500 M que no tienen pensión voluntaria o tienen menos de $250 M en ella.',
      prueba: c => c.tipoPersona === 'PN' && c.saldo > 500 && c.productos.filter(p => p.tipo === 'fpv').reduce((a, p) => a + p.saldo, 0) < 250,
      dato: c => { const f = c.productos.find(p => p.tipo === 'fpv'); return f ? 'FPV actual ' + window.Portafolio.money(f.saldo) : 'Sin FPV'; } },
    { id: 'renov', nombre: 'Renovación anticipada de encargos', producto: 'Encargo fiduciario', linea: 'fiducia', desde: '2026-10-01', hasta: '2026-11-30', area: 'Negocios fiduciarios',
      regla: 'Clientes con un encargo fiduciario que vence en los próximos 60 días.',
      prueba: c => c.productos.some(p => p.tipo === 'encargo' && p.diasAlVencimiento >= 0 && p.diasAlVencimiento <= 60),
      dato: c => { const p = c.productos.find(x => x.tipo === 'encargo' && x.diasAlVencimiento >= 0 && x.diasAlVencimiento <= 60); return p.nombre + ' vence en ' + p.diasAlVencimiento + ' días'; } },
    { id: 'fic2', nombre: 'FIC Alianza 2 · renta fija', producto: 'FIC Alianza 2', linea: 'fondos', desde: '2026-09-15', hasta: '2026-11-15', area: 'Gerencia comercial · Fondos',
      regla: 'Clientes con perfil Moderado o Mayor riesgo que tienen más del 25 % de su saldo en FIC Alianza 1 (liquidez).',
      prueba: c => c.perfil !== 'Conservador' && c.productos.filter(p => p.nombre === 'FIC Alianza 1').reduce((a, p) => a + p.saldo, 0) / c.saldo > 0.25,
      dato: c => { const v = c.productos.filter(p => p.nombre === 'FIC Alianza 1').reduce((a, p) => a + p.saldo, 0); return 'Liquidez ' + window.Portafolio.pct(v / c.saldo * 100) + ' del saldo'; } },
    { id: 'corp', nombre: 'Alianza Corp · FCP Inmobiliario II', producto: 'FCP Alianza Corp Inmobiliario II', linea: 'corp', desde: '2026-10-10', hasta: '2027-01-31', area: 'Alianza Corp',
      regla: 'Segmento Patrimonial o Empresarial, perfil Moderado o Mayor riesgo, sin productos de Alianza Corp y con saldo mayor a $2.000 M.',
      prueba: c => (c.segmento === 'Patrimonial' || c.segmento === 'Empresarial') && c.perfil !== 'Conservador' && !c.productos.some(p => p.linea === 'corp') && c.saldo > 2000,
      dato: c => 'Saldo ' + window.Portafolio.money(c.saldo) + ' · perfil ' + c.perfil }
  ],

  // ────────────────────────────────────────────────────────────────────
  // SETUP DEL CLIENTE (vinculación / onboarding)
  // ────────────────────────────────────────────────────────────────────
  // TODO: confirmar listado con Alianza — etapas del proceso de vinculación.
  setupEtapas: ['Solicitud', 'Conocimiento del cliente', 'Documentos', 'Firmas', 'Activación'],

  // TODO: confirmar listado con Alianza — documentos y requisitos.
  // aplica: PN (persona natural), PJ (persona jurídica). responsable: quién debe actuar.
  setupDocumentos: [
    { id: 'datos', nombre: 'Actualización de datos (formulario de conocimiento del cliente)', aplica: ['PN', 'PJ'], responsable: 'Cliente', etapa: 1 },
    { id: 'cedula', nombre: 'Copia del documento de identidad', aplica: ['PN'], responsable: 'Cliente', etapa: 2 },
    { id: 'ingresos', nombre: 'Certificado de ingresos o declaración de renta', aplica: ['PN'], responsable: 'Cliente', etapa: 2 },
    { id: 'camara', nombre: 'Certificado de existencia y representación legal (máx. 30 días)', aplica: ['PJ'], responsable: 'Cliente', etapa: 2 },
    { id: 'rut', nombre: 'RUT actualizado', aplica: ['PN', 'PJ'], responsable: 'Cliente', etapa: 2 },
    { id: 'eeff', nombre: 'Estados financieros certificados del último año', aplica: ['PJ'], responsable: 'Cliente', etapa: 2 },
    { id: 'confidencialidad', nombre: 'Acuerdo de confidencialidad', aplica: ['PN', 'PJ'], responsable: 'Cliente', etapa: 3 },
    { id: 'firmas', nombre: 'Firma de contrato y reglamento del producto', aplica: ['PN', 'PJ'], responsable: 'Cliente', etapa: 3 },
    { id: 'tarjeta', nombre: 'Tarjeta de firmas materializada', aplica: ['PN', 'PJ'], responsable: 'Alianza', etapa: 3 },
    { id: 'cuentas', nombre: 'Inscripción de cuentas bancarias para giros', aplica: ['PN', 'PJ'], responsable: 'Cliente', etapa: 4 },
    { id: 'portal', nombre: 'Inscripción en el portal transaccional', aplica: ['PN', 'PJ'], responsable: 'Alianza', etapa: 4 }
  ],

  // Estado del setup por cliente. docs: id → [estado, fecha] con estado
  // 'completo' | 'pendiente' | 'vencido'. La fecha es la de cumplimiento
  // (completo) o la fecha límite (pendiente / vencido).
  // `clienteId` enlaza con la cartera; los prospectos aún no tienen Vista 360.
  setup: [
    { id: 's1', nombre: 'Paula Andrea Vélez', tipoPersona: 'PN', segmento: 'Preferente', proceso: 'Vinculación nueva', inicio: '2026-09-29',
      docs: { datos: ['completo', '2026-09-30'], cedula: ['completo', '2026-09-30'], ingresos: ['pendiente', '2026-10-20'], rut: ['pendiente', '2026-10-20'], confidencialidad: ['pendiente', '2026-10-25'], firmas: ['pendiente', '2026-10-30'], tarjeta: ['pendiente', '2026-10-30'], cuentas: ['pendiente', '2026-11-05'], portal: ['pendiente', '2026-11-05'] } },
    { id: 's2', nombre: 'Inversiones Sabana Norte SAS', tipoPersona: 'PJ', segmento: 'Empresarial', proceso: 'Vinculación nueva', inicio: '2026-10-06',
      docs: { datos: ['pendiente', '2026-10-15'], camara: ['pendiente', '2026-10-20'], rut: ['completo', '2026-10-06'], eeff: ['pendiente', '2026-10-25'], confidencialidad: ['completo', '2026-10-06'], firmas: ['pendiente', '2026-11-05'], tarjeta: ['pendiente', '2026-11-05'], cuentas: ['pendiente', '2026-11-10'], portal: ['pendiente', '2026-11-10'] } },
    { id: 's3', clienteId: 'ca', proceso: 'Actualización anual', inicio: '2026-09-01',
      docs: { datos: ['completo', '2026-03-12'], camara: ['vencido', '2026-09-30'], rut: ['completo', '2026-03-12'], eeff: ['completo', '2026-03-12'], confidencialidad: ['completo', '2015-09-01'], firmas: ['completo', '2024-12-05'], tarjeta: ['completo', '2015-09-10'], cuentas: ['completo', '2015-09-10'], portal: ['completo', '2016-01-20'] } },
    { id: 's4', clienteId: 'af', proceso: 'Actualización anual', inicio: '2026-07-02',
      docs: { datos: ['vencido', '2025-09-15'], cedula: ['completo', '2022-03-14'], ingresos: ['vencido', '2026-04-30'], rut: ['completo', '2022-03-14'], confidencialidad: ['completo', '2022-03-14'], firmas: ['completo', '2022-03-14'], tarjeta: ['pendiente', '2026-10-31'], cuentas: ['completo', '2022-03-20'], portal: ['completo', '2022-03-20'] } },
    { id: 's5', clienteId: 'ae', proceso: 'Actualización anual', inicio: '2026-10-01',
      docs: { datos: ['completo', '2025-10-30'], camara: ['completo', '2026-09-28'], rut: ['completo', '2025-10-30'], eeff: ['pendiente', '2026-10-31'], confidencialidad: ['completo', '2019-11-05'], firmas: ['completo', '2023-06-30'], tarjeta: ['completo', '2019-11-12'], cuentas: ['completo', '2019-11-12'], portal: ['completo', '2019-11-12'] } },
    { id: 's6', clienteId: 'cm', proceso: 'Actualización anual', inicio: '2026-02-01',
      docs: { datos: ['completo', '2026-02-03'], cedula: ['completo', '2016-03-14'], ingresos: ['completo', '2026-04-10'], rut: ['completo', '2026-02-03'], confidencialidad: ['completo', '2016-03-14'], firmas: ['completo', '2025-08-02'], tarjeta: ['completo', '2016-03-20'], cuentas: ['completo', '2016-03-20'], portal: ['completo', '2016-04-02'] } },
    { id: 's7', clienteId: 'sm', proceso: 'Actualización anual', inicio: '2025-08-01',
      docs: { datos: ['completo', '2025-08-09'], cedula: ['completo', '2021-08-10'], ingresos: ['completo', '2025-08-09'], rut: ['completo', '2025-08-09'], confidencialidad: ['completo', '2021-08-10'], firmas: ['completo', '2022-06-15'], tarjeta: ['completo', '2021-08-12'], cuentas: ['completo', '2021-08-12'], portal: ['completo', '2021-08-12'] } }
  ]
};
