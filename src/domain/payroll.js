import { expectedDays, holidaysInMonth } from './calendar.js';
import { seniorityYearsAt, antiguedadApplies } from './seniority.js';
import { findScale } from './scales.js';
import { contributionForHours } from './contributions.js';

export function calculateSettlement({
  employee,
  assignments,
  period,
  settings = {},
  scales = [],
  rates = [],
  holidays = [],
  inputs = {}
}) {
  const divisor = settings.divisorProporcional || 48;
  const pctAnt = settings.porcentajeAntiguedad || 1;
  const pctZona = settings.porcentajeZona || 30;

  const { start } = monthRangeInline(period);
  const periodEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));

  let hoursWeek = 0;
  for (const a of assignments || []) {
    hoursWeek += (a.horas_dia || 0) * (a.dias_semana || []).length;
  }

  const override = (assignments || []).find((a) => a.modalidad_override);
  const suggested = hoursWeek >= 24 ? 'mensual' : 'por_hora';
  const modality = override && override.modalidad_override ? override.modalidad_override : suggested;

  let totalHours = 0;
  let basico = 0;
  let viaticosTotal = 0;
  let feriadoMonto = 0;
  let extras50Hs = Number(inputs.extras50 || 0);
  let extras100Hs = Number(inputs.extras100 || 0);
  const lines = [];
  let refValorHora = 0;

  const holSet = new Set((holidays || []).map((h) => h.fecha));
  const monthHolidays = holidaysInMonth(period, holidays);

  for (const a of assignments || []) {
    const patternJs = new Set((a.dias_semana || []).map((p) => p % 7));
    const expected = countExpected(period, patternJs, holSet);
    const worked =
      inputs.diasTrabajados !== undefined ? Number(inputs.diasTrabajados) : expected;
    const horasDia = Number(a.horas_dia || 0);
    const assignmentHours = worked * horasDia;
    totalHours += assignmentHours;

    let valorHora = a.valor_hora_override != null ? Number(a.valor_hora_override) : null;
    let valorMensual = a.valor_mensual_override != null ? Number(a.valor_mensual_override) : null;

    if (!valorHora) {
      valorHora = findScale(scales, { categoria: a.categoria, conRetiro: a.con_retiro, at: period, tipo: 'hora' }) || 0;
    }
    if (!valorMensual) {
      valorMensual = findScale(scales, { categoria: a.categoria, conRetiro: a.con_retiro, at: period, tipo: 'mensual' }) || 0;
    }

    let assignmentBasico = 0;
    if (modality === 'mensual') {
      assignmentBasico = (valorMensual * hoursWeek) / divisor;
      refValorHora = assignmentBasico / Math.max(totalHours, 1);
    } else {
      assignmentBasico = assignmentHours * valorHora;
      refValorHora = valorHora;
    }

    basico += assignmentBasico;

    let viatico = 0;
    if (a.viatico_habilitado) {
      viatico = worked * (a.valor_viaje || 0) * (a.viajes_por_dia || 2);
    }
    if (inputs.viaticoTotal != null) viatico = Number(inputs.viaticoTotal);
    viaticosTotal += viatico;

    let fMonto = 0;
    for (const h of monthHolidays) {
      const d = new Date(h.fecha + 'T00:00:00');
      if (patternJs.has(d.getUTCDay())) {
        if (inputs.feriadoTrabajado && (inputs.feriadoTrabajado[h.id] || inputs.feriadoTrabajado[h.fecha])) {
          fMonto += horasDia * refValorHora;
        }
      }
    }
    feriadoMonto += fMonto;

    const subtotal = assignmentBasico + viatico + fMonto;
    lines.push({
      houseId: a.house_id,
      horas: assignmentHours,
      basico: assignmentBasico,
      viaticos: viatico,
      feriado: fMonto,
      subtotal
    });
  }
  // extras
  const extras50Monto = extras50Hs * refValorHora * 1.5;
  const extras100Monto = extras100Hs * refValorHora * 2.0;
  const extrasTotal = extras50Monto + extras100Monto;

  // antigüedad (Ley 26.844): 1% del basico por año cumplido, desde max(ingreso, 2020-09-01),
  // solo aplica en periodos >= 2021-09-01. Sin retroactividad.
  let antiguedadAnios = 0;
  let antiguedadMonto = 0;
  if (antiguedadApplies(period)) {
    antiguedadAnios = seniorityYearsAt(employee.fecha_ingreso, period);
    if (antiguedadAnios > 0) {
      antiguedadMonto = basico * (pctAnt / 100) * antiguedadAnios;
    }
  }

  // zona desfavorable: recargo configurable sobre el basico
  const zonaMonto = employee.zona_desfavorable ? basico * (pctZona / 100) : 0;

  const ajuste = Number(inputs.ajusteBasico || 0);

  const bruto = basico + viaticosTotal + feriadoMonto + extrasTotal + antiguedadMonto + zonaMonto + ajuste;

  const rate = contributionForHours(rates, hoursWeek);
  const aportes = rate?.aportes || 0;
  const contribuciones = rate?.contribuciones || 0;
  const art = rate?.art || 0;

  const neto = bruto - aportes;

  return {
    employeeId: employee.id,
    employeeNombre: employee.nombre,
    periodo: period,
    modality,
    suggested,
    hoursWeek,
    totalHours,
    valorHora: refValorHora,
    basico,
    viaticos: viaticosTotal,
    feriado: feriadoMonto,
    extras50: extras50Monto,
    extras100: extras100Monto,
    extras: extrasTotal,
    antiguedad: { anios: antiguedadAnios, monto: antiguedadMonto },
    zona: zonaMonto,
    ajuste,
    bruto,
    aportes,
    contribuciones,
    art,
    neto,
    lines
  };
}

function monthRangeInline(period) {
  const [y, m] = period.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  return { start };
}

function countExpected(period, patternJs, holSet) {
  const [y, m] = period.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  const start = new Date(Date.UTC(y, m - 1, 1));
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), d));
    if (!patternJs.has(date.getUTCDay())) continue;
    if (holSet.has(date.toISOString().slice(0, 10))) continue;
    count++;
  }
  return count;
}