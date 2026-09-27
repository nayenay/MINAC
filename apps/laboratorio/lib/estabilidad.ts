/**
 * Variación relativa (max-min)/promedio de una serie de valores. Usado tanto
 * por Burn-in (ventana de tiempo sobre el stream serial) como por Burn-in
 * 24h (ventana de últimas N lecturas traídas de Firebase) — cada panel arma
 * su propia ventana y le pasa los valores ya recortados a esta función.
 */
export function calcularVariacion(valores: number[]): number {
  if (valores.length === 0) return 0;
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  return promedio === 0 ? 0 : (max - min) / promedio;
}
