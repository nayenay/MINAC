# Proceso de Calibración de Sensores MQ — Bitácora y Hallazgos

Este documento complementa a `manual_calibracion_sensores_MQ.md` (que cubre la metodología general y las curvas de datasheet). Aquí se documenta **lo que realmente ocurrió durante el proceso de calibración**: qué datos se tomaron, cuáles se descartaron y por qué, y los valores oficiales vigentes — para que el equipo sepa exactamente qué tomar en cuenta si necesita recalibrar durante las pruebas de laboratorio.

---

## 1. Objetivo del proceso

Obtener, por sensor y por nodo, el voltaje de referencia en aire limpio (`Vout0`) necesario para calcular la razón Rs/R0 y, a partir de ahí, convertir cualquier lectura a ppm.

## 2. Metodología aplicada

1. **Burn-in**: precalentamiento de los sensores (24-48h en primer uso) hasta que el voltaje reportado deja de variar significativamente.
2. **Medición de Vout0**: ~50 muestras en aire limpio y bien ventilado, espaciadas ~2 segundos, promediadas.
3. **Criterio de aceptación**: variación menor al **3% entre tomas consecutivas** del mismo sensor. Por debajo de ese umbral, el valor se considera estable y utilizable.
4. **Herramienta usada**: `calibracion_sensores.ino`, con dos modos:
   - `MODO = BURN_IN`: reporta voltaje cada 1 minuto, para monitorear visualmente la estabilización.
   - `MODO = CALIBRAR`: toma 50 muestras en aire limpio y calcula el promedio (`Vout0`) automáticamente.

Este es el **único firmware del proceso formal de calibración**. Otros archivos como `prueba_circuito_ads1115.ino`, `prueba_fuego_dos_circuitos.ino` o `ppm_tiempo_real.ino` fueron pruebas de circuito/comunicación — no forman parte del proceso de calibración en sí, aunque muestren lecturas de sensores.

## 3. Historial de calibración — qué se usó y qué no

Se corrieron 3 rondas de calibración por nodo:

### Ronda 1 — descartada ❌
- Nodo 1: MQ-9 reportó **-0.0040 V**, un valor inválido (voltaje negativo = canal flotando/sin conexión real).
- Decisión: no utilizable como referencia para ningún sensor de esa ronda.

### Ronda 2 — descartada ❌
- Nodo 1: razonablemente estable (variación de un solo dígito porcentual frente a la ronda 1).
- Nodo 2: **inestable**, con variaciones de hasta **117%** frente a la ronda anterior en varios sensores.
- Decisión: el Nodo 2 todavía estaba en pleno burn-in — no se usó ningún valor de esta ronda como definitivo.

### Ronda 3 — oficial ✅
- Nodo 1: variación menor al 7% en todos los sensores frente a la ronda 2 (la mayoría por debajo del 3%).
- Nodo 2: variación menor al 4% en todos los sensores — confirmó que la inestabilidad de la ronda 2 fue por burn-in incompleto, no por un problema de hardware o cableado.
- Decisión: **estos son los valores de calibración vigentes.**

**Hallazgo clave del proceso:** la gran diferencia de la ronda 2 se resolvió sola con tiempo — no fue necesario tocar cableado ni hardware. Esto confirma que, ante variaciones grandes entre tomas, la primera hipótesis a descartar es "burn-in incompleto" antes de sospechar de una falla física.

## 4. Valores oficiales de calibración (Vout0)

| Sensor | Nodo 1 | Nodo 2 |
|---|---|---|
| MQ-2 | 0.9658 V | 1.4181 V |
| MQ-3 | 1.2645 V | 0.8282 V |
| MQ-135 | 1.4056 V | 0.4505 V ⚠️ (ver caso especial) |
| MQ-9 | 0.1993 V | 0.4278 V |

Estos valores están ya integrados (hardcodeados) en: `nodo_sin_conexion.ino`, `nodo_gateway.ino`, `ppm_tiempo_real.ino`, `practica_laboratorio.ino`, y como referencia en `calculo_ppm.py`.

**Nota:** las diferencias de valor absoluto entre Nodo 1 y Nodo 2 en un mismo sensor son normales — cada módulo MQ tiene su propio potenciómetro interno. El método Rs/R0 compensa esa diferencia automáticamente porque cada nodo usa su propio `Vout0` como referencia; lo que importa es que cada nodo sea consistente consigo mismo entre tomas, no que coincida con el otro nodo.

## 5. Caso especial: MQ-135 del Nodo 2

Durante las pruebas posteriores a la calibración (encendedor y alcohol), este sensor específico empezó a reportar voltajes de 4.3-5.6V — físicamente imposibles, ya que VCC es 5V.

**Decisión tomada:** no recalibrar sobre este comportamiento. Recalibrar habría fijado un `Vout0` nuevo cerca del valor "atorado", haciendo que el sensor pareciera funcional en la siguiente prueba sin que la falla real se resolviera — es decir, se estaría calibrando sobre una falla en vez de corregirla.

**Estado actual:** el sensor conserva el valor de la Ronda 3 (0.4505 V) como última calibración estable conocida, pero sus lecturas deben tratarse con reserva hasta completar el diagnóstico de hardware (sospecha principal: conexión del divisor de voltaje en ese canal específico, o el sensor mismo).

## 6. Coeficientes de conversión a ppm (ppm = a × (Rs/R0)^b)

| Sensor | Gas | a | b | Rango válido Rs/Ro |
|---|---|---|---|---|
| MQ-2 | LPG/Metano | 591.283 | -2.0765 | 0.256 – 1.685 |
| MQ-3 | Alcohol | 0.3923 | -1.4932 | 0.114 – 2.498 |
| MQ-135 | CO2 (aprox.) | 110.379 | -2.7217 | 0.804 – 2.416 |
| MQ-9 | CO | 400.0 | -2.0 | 0.2 – 2.0 |

Estos coeficientes son independientes de la calibración `Vout0` — no cambian si recalibran, a menos que decidan refinar la lectura de las curvas del datasheet (ver `manual_calibracion_sensores_MQ.md`, sección de fuentes).

## 7. Cuándo y cómo recalibrar (relevante para las pruebas de laboratorio)

### Señales de que un sensor necesita recalibrarse

- El sensor reporta un valor imposible de forma sostenida (por ejemplo, cerca o por encima de VCC).
- Las lecturas en aire limpio se alejan mucho del `Vout0` registrado, de forma consistente (no un solo dato suelto).
- Movieron físicamente el sensor a otro canal o lo reemplazaron por una unidad nueva.
- Pasó mucho tiempo desde la última calibración y notan deriva sostenida.

### Procedimiento para recalibrar

1. Suban `calibracion_sensores.ino` con `MODO = BURN_IN` y dejen correr hasta que el reporte cada minuto se estabilice.
2. Cambien a `MODO = CALIBRAR`, en aire limpio y ventilado, y suban de nuevo — el firmware imprime automáticamente las 4 constantes `VOUT0_` listas para copiar.
3. Repitan la calibración una segunda vez, mismas condiciones. Si la variación entre ambas tomas es **menor al 3%**, el valor es aceptable.
4. Si la variación es mayor al 3%, repitan una tercera vez antes de aceptar cualquier valor — no usen datos de una sola toma.
5. Actualicen el nuevo `Vout0` en **todos** los archivos que lo usan: `nodo_sin_conexion.ino`, `nodo_gateway.ino`, `ppm_tiempo_real.ino`, `practica_laboratorio.ino`, y el diccionario `VOUT0` de `calculo_ppm.py`.
6. Documenten la fecha y el motivo de la recalibración en esta bitácora (agregar una nueva sección de ronda, igual que las anteriores).

### Importante para las pruebas de laboratorio específicamente

Si notan que un sensor se comporta distinto después de una práctica con reacción química (por ejemplo, exposición a HCl, H2, o vapores de alcohol concentrado), midan primero en aire limpio antes de asumir que necesita recalibración — puede ser una saturación temporal que se recupera sola con tiempo de ventilación (como pasó con el MQ-2 del Nodo 2 tras la prueba de alcohol, que se recuperó solo). Solo recalibren si el comportamiento anómalo persiste después de ventilar y esperar.
