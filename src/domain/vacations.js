export function vacationDaysBySeniority(yearsReal) {
  if (yearsReal < 5) return 14;
  if (yearsReal < 10) return 21;
  if (yearsReal < 20) return 28;
  return 35;
}

export function vacationDaysLeft(yearsReal, leaves = []) {
  const total = vacationDaysBySeniority(yearsReal);
  const tomadas = leaves
    .filter((l) => l.tipo === 'vacaciones' && l.pagada)
    .reduce((acc, l) => acc + (l.dias || 0), 0);
  return { total, tomadas, disponibles: Math.max(0, total - tomadas) };
}