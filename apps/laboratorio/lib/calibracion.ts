// Fórmulas validadas por el equipo de laboratorio MINAC. Cámara de
// calibración: 3.444 L (3444 mL).

export const VOLUMEN_CAMARA_ML = 3444;

function volumenMolar(temperaturaC: number): number {
  return 0.0821 * (temperaturaC + 273.15);
}

/** Práctica 2 — butano dosificado por jeringa. */
export function ppmPractica2(vInyectadoMl: number): number {
  return (vInyectadoMl / VOLUMEN_CAMARA_ML) * 1e6;
}

/** Práctica 4 — H2 generado por Zn + HCl. */
export function ppmPractica4(
  vHclMl: number,
  mHcl: number,
  temperaturaC: number,
): number {
  const molesHCl = mHcl * (vHclMl / 1000);
  const molesH2 = molesHCl / 2;
  return ((molesH2 * volumenMolar(temperaturaC)) / 3.444) * 1e6;
}

/** Práctica 5 — H2S generado por FeS + HCl. */
export function ppmPractica5(
  vHclMl: number,
  mHcl: number,
  temperaturaC: number,
): number {
  const molesHCl = mHcl * (vHclMl / 1000);
  const molesH2S = molesHCl / 2;
  return ((molesH2S * volumenMolar(temperaturaC)) / 3.444) * 1e6;
}
