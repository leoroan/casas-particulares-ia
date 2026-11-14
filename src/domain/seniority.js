export const PISO_ANTIGÜEDAD = '2020-09-01';
export const ANTIGÜEDAD_APLICA_DESDE = '2021-09-01';

export function seniorityYearsAt(fechaIngreso, period) {
  if (!fechaIngreso) return 0;
  const [y, m] = period.split('-').map(Number);
  const end = new Date(Date.UTC(y, m, 0)); // ultimo dia del periodo
  const start = new Date(fechaIngreso + 'T00:00:00');
  const piso = new Date(Date.UTC(2020, 8, 1));
  const from = start > piso ? start : piso;
  if (end < from) return 0;
  let years = end.getUTCFullYear() - from.getUTCFullYear();
  if (
    end.getUTCMonth() < from.getUTCMonth() ||
    (end.getUTCMonth() === from.getUTCMonth() && end.getUTCDate() < from.getUTCDate())
  ) {
    years--;
  }
  return Math.max(0, years);
}

export function antiguedadApplies(period) {
  return period >= ANTIGÜEDAD_APLICA_DESDE;
}

export function realSeniorityYears(fechaIngreso, asOf) {
  if (!fechaIngreso || !asOf) return 0;
  const end = new Date(asOf + 'T00:00:00');
  const start = new Date(fechaIngreso + 'T00:00:00');
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  if (
    end.getUTCMonth() < start.getUTCMonth() ||
    (end.getUTCMonth() === start.getUTCMonth() && end.getUTCDate() < start.getUTCDate())
  ) years--;
  return Math.max(0, years);
}