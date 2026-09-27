export type Modo = "burn_in" | "calibracion" | "practica";
export type Practica = 2 | 4 | 5;

// Pestaña de la UI: incluye "burnin_24h", que no tiene sesión/lecturas/
// eventos propios (es un dashboard de solo lectura sobre laboratorio/burnin,
// no un modo que escriba vía Web Serial).
export type Pestana = Modo | "burnin_24h";

// Sentinel que reporta el firmware cuando el DHT11 de la cámara falla.
export const TEMPERATURA_INVALIDA = -99;

/**
 * Cada práctica transmite un número distinto de unidades del mismo sensor
 * (ej. práctica 2 -> mq9_1..mq9_4, práctica 4 -> mq8_1..mq8_2), así que las
 * lecturas ya no tienen un esquema fijo de 4 sensores: "canales" guarda
 * cualquier clave numérica del JSON que no sea "t" ni "fueraDeRango".
 */
export interface Lectura {
  timestamp: number;
  /** Temperatura de la cámara (DHT11), campo "t" del JSON. */
  temperaturaC?: number;
  fueraDeRango?: string;
  canales: Record<string, number>;
}

export interface EventoReferencia {
  sessionId: string;
  modo: "calibracion" | "practica";
  practica: Practica;
  cantidadMl: number;
  temperaturaC: number;
  // De dónde vino temperaturaC: lectura en vivo del DHT11, o captura manual
  // porque el DHT11 reportó TEMPERATURA_INVALIDA. Solo aplica a las
  // prácticas 4 y 5 (la fórmula de la práctica 2 no usa temperatura).
  temperaturaFuente?: "dht11" | "manual";
  // Concentración molar del HCl (mol/L). Requerida solo en prácticas 4 y 5.
  mHcl?: number;
  ppmTeorico: number;
  timestamp: number;
}

/**
 * Evento ya registrado junto con el snapshot de canales del sensor en ese
 * instante. Es un emparejamiento solo del lado del cliente (no se persiste
 * en Firebase, que sigue guardando únicamente EventoReferencia) usado para
 * las ayudas visuales: la tabla comparativa de práctica activa y el resumen
 * multipunto de calibración (R² por canal).
 */
export interface EventoConMedicion {
  evento: EventoReferencia;
  medicion: Record<string, number>;
}

export interface SesionLaboratorio {
  modo: Modo;
  estado: "abierta" | "guardada" | "completa";
  creadaEn?: number;
  guardadaEn?: number;
  cerradaEn?: number;
  ultimaActividad?: number;
  totalLecturas?: number;
  practica?: Practica;
}

/** Una lectura del nodo laboratorio/burnin/{practica}, subida por WiFi. */
export interface LecturaBurnin {
  minutos: number;
  temperaturaC?: number;
  canales: Record<string, number>;
}
