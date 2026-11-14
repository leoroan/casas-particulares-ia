export function findScale(scales, { categoria, conRetiro, at, tipo }) {
  const conRetiroBool = conRetiro !== false;
  const candidates = (scales || []).filter(
    (s) =>
      s.categoria === categoria &&
      s.con_retiro === conRetiroBool &&
      s.vigencia_desde <= at
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.vigencia_desde < b.vigencia_desde ? 1 : -1));
  const scale = candidates[0];
  return tipo === 'mensual' ? scale.valor_mensual : scale.valor_hora;
}

export function latestScaleDate(scales) {
  if (!scales || scales.length === 0) return null;
  return scales.reduce((max, s) => (s.vigencia_desde > max ? s.vigencia_desde : max), scales[0].vigencia_desde);
}