"""
MINAC - Cálculo de ppm para sensores MQ-2, MQ-3, MQ-135, MQ-9
================================================================
Implementa el método descrito en el manual de calibración:
  1. Razón Rs/R0 a partir de Vout actual y Vout0 (referencia en aire limpio)
  2. Conversión a ppm con coeficientes de potencia: ppm = a * (Rs/R0)^b
  3. Validación de rango (el resultado solo es confiable dentro del
     rango de Rs/R0 que el datasheet realmente caracterizó)
  4. Cálculo de error contra gas de referencia (para las pruebas de
     validación cruzada con metano/alcohol)
  5. Modo batch: procesar un CSV de lecturas históricas y agregar
     columnas de ppm calculado

Requiere: pandas (solo si usan el modo batch de CSV)
    pip install pandas
"""

import math
import csv
from dataclasses import dataclass
from typing import Optional


# ============================================================
# Coeficientes extraídos del datasheet (ppm = a * (Rs/Ro)^b)
# MQ-9 queda pendiente hasta conseguir el segundo punto de su curva
# ============================================================

@dataclass
class ConfigSensor:
    nombre: str
    gas: str
    a: float
    b: float
    rs_ro_min: float
    rs_ro_max: float


SENSORES = {
    "MQ2": ConfigSensor("MQ-2", "LPG/Metano", a=591.283, b=-2.0765,
                         rs_ro_min=0.256, rs_ro_max=1.685),
    "MQ3": ConfigSensor("MQ-3", "Alcohol", a=0.3923, b=-1.4932,
                         rs_ro_min=0.114, rs_ro_max=2.498),
    "MQ135": ConfigSensor("MQ-135", "CO2 (aprox.)", a=110.379, b=-2.7217,
                           rs_ro_min=0.804, rs_ro_max=2.416),
    "MQ9": ConfigSensor("MQ-9", "CO", a=400.0, b=-2.0,
                         rs_ro_min=0.2, rs_ro_max=2.0),
    # Nota: coeficientes del MQ-9 obtenidos por lectura visual del datasheet,
    # no de tabla numérica ni herramienta de extracción de precisión.
}

VC = 5.0  # Voltaje de circuito de los sensores MQ


# ============================================================
# Calibración base (Vout0 por nodo y sensor, aire limpio)
# Actualicen estos valores conforme vayan confirmando calibraciones
# más estables (variación < 3% entre tomas consecutivas)
# ============================================================

VOUT0 = {
    "nodo1": {"MQ2": 0.9658, "MQ3": 1.2645, "MQ135": 1.4056, "MQ9": 0.1993},
    "nodo2": {"MQ2": 1.4181, "MQ3": 0.8282, "MQ135": 0.4505, "MQ9": 0.4278},
}


# ============================================================
# Funciones principales
# ============================================================

def calcular_rs_ro(vout_actual: float, vout0: float) -> float:
    """
    Razón Rs/R0 usando el método simplificado (RL se cancela).
    Ver sección 2 del manual de calibración.
    """
    if vout_actual <= 0 or vout0 <= 0:
        raise ValueError("Los voltajes deben ser mayores a 0 (revisar conexión del sensor).")

    numerador = (VC - vout_actual) / vout_actual
    denominador = (VC - vout0) / vout0
    return numerador / denominador


def calcular_ppm(sensor_id: str, vout_actual: float, vout0: float) -> Optional[dict]:
    """
    Calcula ppm para un sensor dado. Regresa None si el sensor no tiene
    coeficientes disponibles todavía (caso actual del MQ-9).
    """
    config = SENSORES.get(sensor_id)
    if config is None:
        print(f"[AVISO] {sensor_id}: sin coeficientes calibrados todavía. "
              f"Falta extraer el segundo punto de su curva de datasheet.")
        return None

    rs_ro = calcular_rs_ro(vout_actual, vout0)
    ppm = config.a * math.pow(rs_ro, config.b)

    dentro_de_rango = config.rs_ro_min <= rs_ro <= config.rs_ro_max
    if not dentro_de_rango:
        print(f"[ADVERTENCIA] {config.nombre}: Rs/Ro={rs_ro:.4f} está FUERA del "
              f"rango validado ({config.rs_ro_min}-{config.rs_ro_max}). "
              f"El resultado de {ppm:.1f} ppm no es confiable.")

    return {
        "sensor": config.nombre,
        "gas": config.gas,
        "rs_ro": round(rs_ro, 4),
        "ppm": round(ppm, 2),
        "dentro_de_rango": dentro_de_rango,
    }


def calcular_error(ppm_calculado: float, ppm_esperado: float) -> float:
    """
    Error porcentual contra un gas de referencia de concentración conocida.
    Úsenlo en las pruebas de validación con metano/alcohol.
    """
    if ppm_esperado == 0:
        raise ValueError("ppm_esperado no puede ser 0.")
    return abs(ppm_calculado - ppm_esperado) / ppm_esperado * 100


def procesar_lote_csv(ruta_entrada: str, ruta_salida: str, nodo: str):
    """
    Procesa un CSV con lecturas históricas y agrega columnas de ppm.

    El CSV de entrada debe tener columnas: timestamp, mq2, mq3, mq135, mq9
    (voltajes reales del sensor, ya compensados por el divisor de voltaje).

    Genera un CSV de salida con las columnas de ppm agregadas, listo para
    alimentar el análisis de la capa predictiva.
    """
    vout0_nodo = VOUT0[nodo]

    with open(ruta_entrada, newline="", encoding="utf-8") as f_in:
        lector = csv.DictReader(f_in)
        filas = list(lector)

    for fila in filas:
        for sensor_id in ["MQ2", "MQ3", "MQ135", "MQ9"]:
            columna = sensor_id.lower()
            if columna not in fila:
                continue
            vout_actual = float(fila[columna])
            resultado = calcular_ppm(sensor_id, vout_actual, vout0_nodo[sensor_id])
            fila[f"{columna}_ppm"] = resultado["ppm"] if resultado else ""

    columnas = list(filas[0].keys()) if filas else []
    with open(ruta_salida, "w", newline="", encoding="utf-8") as f_out:
        escritor = csv.DictWriter(f_out, fieldnames=columnas)
        escritor.writeheader()
        escritor.writerows(filas)

    print(f"Listo: {len(filas)} filas procesadas -> {ruta_salida}")


# ============================================================
# Ejemplo de uso
# ============================================================

if __name__ == "__main__":
    print("=== MINAC - Cálculo de ppm (ejemplo con datos de calibración actuales) ===\n")

    for nodo, valores in VOUT0.items():
        print(f"--- {nodo} ---")
        for sensor_id, vout0 in valores.items():
            # Ejemplo: usando el mismo Vout0 como "lectura actual" (debería dar ~0 ppm)
            resultado = calcular_ppm(sensor_id, vout_actual=vout0, vout0=vout0)
            if resultado:
                print(f"  {resultado['sensor']:8s} | Rs/Ro: {resultado['rs_ro']:.4f} "
                      f"| ppm: {resultado['ppm']:.2f} | en rango: {resultado['dentro_de_rango']}")
        print()

    # Ejemplo de cálculo de error contra gas de referencia
    print("--- Ejemplo de validación contra gas de referencia ---")
    ppm_calc = 850.0
    ppm_esperado = 1000.0  # ej. concentración estimada de un encendedor de butano
    error = calcular_error(ppm_calc, ppm_esperado)
    print(f"Calculado: {ppm_calc} ppm | Esperado: {ppm_esperado} ppm | Error: {error:.1f}%")

    # Para procesar un CSV real, descomenten y ajusten las rutas:
    # procesar_lote_csv("lecturas_nodo1.csv", "lecturas_nodo1_con_ppm.csv", nodo="nodo1")
