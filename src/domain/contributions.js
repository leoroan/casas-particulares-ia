export function tramoForHours(hoursWeek) {
  if (hoursWeek <= 12) return 'hasta12';
  if (hoursWeek <= 16) return '12a16';
  return 'mas16';
}

export function contributionForHours(rates, hoursWeek) {
  const tramo = tramoForHours(hoursWeek);
  const candidates = (rates || []).filter((r) => r.tramo === tramo);
  if (candidates.length === 0) return { aportes: 0, contribuciones: 0, art: 0 };
  candidates.sort((a, b) => (a.vigencia_desde < b.vigencia_desde ? 1 : -1));
  return candidates[0];
}