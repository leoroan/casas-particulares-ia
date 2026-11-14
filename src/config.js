export const APP_NAME = 'Casas Particulares IA';

export const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Empleador Demo',
  email: 'demo@casasparticulares.local',
  password: 'demo1234',
};

export const CONFIG = {
  // ----- Parámetros del régimen (configurables desde /ajustes) -----
  divisorProporcional: 48,
  porcentajeAntiguedad: 1,
  pisoAntiguedadDesde: '2020-09-01',
  antiguedadAplicaDesde: '2021-09-01',
  porcentajeZona: 30,
  recargoExtra50: 50,
  recargoExtra100: 100,
  mesAlertaEscala: 2,
  diaVencimientoCuotas: 10,

  fuenteReferencia:
    'Valores de referencia del régimen de trabajo en casas particulares (Ley 26.844). Verificar escalas y cuotas vigentes en ARCA y la Comisión Nacional de Trabajo en Casas Particulares antes de usarlos en liquidaciones reales.',

  // ----- Escalas de referencia (NO definitivas: llevan fecha y fuente) -----
  salaryScales: [
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Personal para tareas generales',
      conRetiro: true,
      valorHora: 6000,
      valorMensual: 240000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Personal para tareas generales',
      conRetiro: false,
      valorHora: 5400,
      valorMensual: 216000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Asistencia y cuidado de personas',
      conRetiro: true,
      valorHora: 6600,
      valorMensual: 264000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Asistencia y cuidado de personas',
      conRetiro: false,
      valorHora: 5900,
      valorMensual: 236000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Caseros/as',
      conRetiro: true,
      valorHora: 7200,
      valorMensual: 288000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Caseros/as',
      conRetiro: false,
      valorHora: 6500,
      valorMensual: 260000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Supervisor/a',
      conRetiro: true,
      valorHora: 8000,
      valorMensual: 320000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Personal para tareas específicas',
      conRetiro: true,
      valorHora: 6800,
      valorMensual: 272000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    },
    {
      vigenciaDesde: '2025-08-01',
      categoria: 'Personal para tareas específicas',
      conRetiro: false,
      valorHora: 6200,
      valorMensual: 248000,
      fuente: 'Referencia - escalas casas particulares (no oficial)'
    }
  ],
  // ----- Cuotas del régimen simplificado (referencia) -----
  contributionRates: [
    {
      vigenciaDesde: '2025-01-01',
      tramo: 'hasta12',
      aportes: 4700,
      contribuciones: 2350,
      art: 500,
      fuente: 'Referencia - cuotas régimen simplificado casas particulares'
    },
    {
      vigenciaDesde: '2025-01-01',
      tramo: '12a16',
      aportes: 7000,
      contribuciones: 3500,
      art: 750,
      fuente: 'Referencia - cuotas régimen simplificado casas particulares'
    },
    {
      vigenciaDesde: '2025-01-01',
      tramo: 'mas16',
      aportes: 9400,
      contribuciones: 4700,
      art: 1000,
      fuente: 'Referencia - cuotas régimen simplificado casas particulares'
    }
  ],

  // ----- Feriados Argentina 2025-2027 (editable desde la app) -----
  holidays: [
    { fecha: '2025-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2025-03-24', descripcion: 'Día de la Memoria por la Verdad y la Justicia' },
    { fecha: '2025-04-02', descripcion: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
    { fecha: '2025-04-18', descripcion: 'Viernes Santo' },
    { fecha: '2025-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2025-05-25', descripcion: 'Día de la Revolución de Mayo' },
    { fecha: '2025-06-20', descripcion: 'Paso a la Inmortalidad del General Belgrano' },
    { fecha: '2025-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2025-08-17', descripcion: 'Paso a la Inmortalidad del General José de San Martín' },
    { fecha: '2025-10-13', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2025-12-08', descripcion: 'Día de la Inmaculada Concepción de María' },
    { fecha: '2025-12-25', descripcion: 'Navidad' },
    { fecha: '2026-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2026-03-24', descripcion: 'Día de la Memoria por la Verdad y la Justicia' },
    { fecha: '2026-04-02', descripcion: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
    { fecha: '2026-04-03', descripcion: 'Viernes Santo' },
    { fecha: '2026-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2026-05-25', descripcion: 'Día de la Revolución de Mayo' },
    { fecha: '2026-06-20', descripcion: 'Paso a la Inmortalidad del General Belgrano' },
    { fecha: '2026-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2026-08-17', descripcion: 'Paso a la Inmortalidad del General José de San Martín' },
    { fecha: '2026-10-12', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2026-12-08', descripcion: 'Día de la Inmaculada Concepción de María' },
    { fecha: '2026-12-25', descripcion: 'Navidad' },
    { fecha: '2027-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2027-03-24', descripcion: 'Día de la Memoria por la Verdad y la Justicia' },
    { fecha: '2027-04-02', descripcion: 'Día del Veterano y de los Caídos en la Guerra de Malvinas' },
    { fecha: '2027-04-09', descripcion: 'Viernes Santo' },
    { fecha: '2027-05-01', descripcion: 'Día del Trabajador' },
    { fecha: '2027-05-25', descripcion: 'Día de la Revolución de Mayo' },
    { fecha: '2027-06-20', descripcion: 'Paso a la Inmortalidad del General Belgrano' },
    { fecha: '2027-07-09', descripcion: 'Día de la Independencia' },
    { fecha: '2027-08-17', descripcion: 'Paso a la Inmortalidad del General José de San Martín' },
    { fecha: '2027-10-11', descripcion: 'Día del Respeto a la Diversidad Cultural' },
    { fecha: '2027-12-08', descripcion: 'Día de la Inmaculada Concepción de María' },
    { fecha: '2027-12-25', descripcion: 'Navidad' }
  ]
};