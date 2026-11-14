export function patternToJsDays(pattern) {
  // pattern valores 1..7 (1=Lunes ... 7=Domingo) -> getUTCDay (0=Domingo ... 6=Sabado)
  return (pattern || []).map((p) => p % 7);
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function monthRange(period) {
  // period 'YYYY-MM-01'
  const [y, m] = period.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return { start, end, year: y, month: m, days: new Date(y, m, 0).getDate() };
}

export function expectedDays(period, pattern, holidays) {
  const { start, days } = monthRange(period);
  const jsDays = new Set(patternToJsDays(pattern));
  const holSet = new Set((holidays || []).map((h) => h.fecha));
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), d));
    if (!jsDays.has(date.getUTCDay())) continue;
    if (holSet.has(date.toISOString().slice(0, 10))) continue;
    count++;
  }
  return count;
}

export function holidaysInMonth(period, holidays) {
  const { start } = monthRange(period);
  return (holidays || []).filter((h) => {
    const d = new Date(h.fecha + 'T00:00:00');
    return d.getUTCFullYear() === start.getUTCFullYear() && d.getUTCMonth() === start.getUTCMonth();
  });
}

export function isHoliday(dateISO, holidays) {
  return new Set((holidays || []).map((h) => h.fecha)).has(dateISO);
}