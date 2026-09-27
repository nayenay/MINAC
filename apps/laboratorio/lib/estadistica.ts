interface Par {
  x: number;
  y: number;
}

/** R² (coeficiente de determinación) de una regresión lineal simple. */
export function calcularR2(pares: Par[]): number | null {
  if (pares.length < 2) return null;

  const n = pares.length;
  const mediaX = pares.reduce((s, p) => s + p.x, 0) / n;
  const mediaY = pares.reduce((s, p) => s + p.y, 0) / n;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const { x, y } of pares) {
    sxy += (x - mediaX) * (y - mediaY);
    sxx += (x - mediaX) ** 2;
    syy += (y - mediaY) ** 2;
  }

  if (sxx === 0 || syy === 0) return null;

  const r = sxy / Math.sqrt(sxx * syy);
  return r * r;
}
