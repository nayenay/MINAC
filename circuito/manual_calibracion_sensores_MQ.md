# Manual de calibración — Sensores MQ-2, MQ-7, MQ-135, MQ-136 (MINAC)

Adaptado al circuito real del prototipo: sensores MQ → divisor de voltaje 10k/20k → ADS1115 → ESP32 (I2C).

---

## 1. Conceptos base

Cada sensor MQ cambia su resistencia interna (**Rs**) según la concentración de gas presente. La calibración consiste en:

1. Medir **R0**: la resistencia del sensor en aire limpio (referencia).
2. Medir **Rs**: la resistencia del sensor en el ambiente que se quiere evaluar.
3. Calcular la razón **Rs/R0** y convertirla a ppm usando la curva del datasheet de cada gas.

## 2. Simplificación importante para nuestro circuito

Normalmente Rs se calcula como:

```
Rs = ((Vc − Vout) / Vout) × RL
```

Donde `RL` es la resistencia de carga del módulo (la que trae la placa del sensor, no el divisor que añadimos para el ADS1115). **No necesitamos conocer el valor exacto de RL**, porque al calcular la razón Rs/R0, RL se cancela matemáticamente (es la misma en ambas mediciones):

```
Rs/R0 = [(Vc − Vout) / Vout] / [(Vc − Vout0) / Vout0]
```

Donde `Vout0` es el voltaje medido en aire limpio (nuestra referencia R0) y `Vout` es el voltaje medido en el ambiente actual. Esto simplifica el firmware: solo necesitamos guardar `Vout0` por sensor, nada de resistencias.

**Importante:** `Vout` aquí es el voltaje real del sensor (después de compensar el divisor 10k/20k que ya tienen en el firmware — la variable `voltajeSensor` que ya calculan).

## 3. Tiempos de burn-in por sensor

El calentador de cada sensor necesita estabilizarse térmicamente antes de que cualquier lectura sea confiable:

| Sensor | Burn-in inicial (primera vez) | Estabilización en encendidos posteriores |
|---|---|---|
| MQ-2 | Mínimo 24h (dato de fabricante) | 2-5 min |
| MQ-7 | 24-48h (tiene ciclo de calentamiento alternado 5V/1.4V — más lento en estabilizar) | 2-5 min |
| MQ-135 | 24-48h | 2-5 min |
| MQ-136 | 24-48h (es de los más sensibles a drift por humedad) | 2-5 min |

Empiecen el burn-in de los 4 sensores **en paralelo**, ya que corre solo en segundo plano mientras avanzan con otras pruebas.

## 4. Procedimiento de calibración R0

1. Después del burn-in completo, coloquen el circuito en un espacio con aire limpio y bien ventilado (exterior o con ventana abierta, lejos de fuentes de combustión, alcohol, o gas).
2. Tomen ~50 lecturas espaciadas (por ejemplo, una cada 2 segundos durante ~2 minutos) de cada sensor.
3. Promedien esas lecturas — ese promedio es su `Vout0` (referencia de aire limpio) por sensor.
4. Guarden esos 4 valores (`Vout0_mq2`, `Vout0_mq7`, `Vout0_mq135`, `Vout0_mq136`) — son su calibración base.

**Repitan este proceso 2-3 veces en días distintos** y comparen los resultados — si varían mucho entre repeticiones, es señal de que el sensor aún no completó su burn-in o hay contaminación ambiental en el lugar de calibración. Esta repetibilidad es exactamente el tipo de evidencia que fortalece el criterio de "viabilidad técnica" en la convocatoria.

## 5. Conversión a ppm — curva logarítmica

Las curvas de concentración de cada gas vienen en escala log-log en el datasheet del sensor, y se aproximan con una línea recta. Necesitan tomar 2 puntos de la curva del gas que les interesa: `(X0, Y0)` y `(X1, Y1)`, donde X = ppm y Y = razón Rs/R0.

Ejemplo de referencia (curva de LPG en el datasheet del MQ-2): un punto cercano a 200 ppm con razón ~1.7, y otro cercano a 10,000 ppm con razón ~0.28.

**Deben repetir esta extracción para cada uno de sus 4 sensores, usando la curva específica del gas que les interesa de CADA datasheet individual** (MQ-7 → curva de CO, MQ-135 → curva de calidad de aire/CO2 aproximado, MQ-136 → curva de H2S). No usen los mismos puntos del MQ-2 para los demás sensores — cada curva es distinta y usar la incorrecta invalida la medición.

Con los dos puntos, la fórmula general es:

```
pendiente = (log10(Y1) − log10(Y0)) / (log10(X1) − log10(X0))
offset    = log10(Y0) − log10(X0) × pendiente
ppm       = 10 ^ ((log10(Rs/R0) − offset) / pendiente)
```

## 6. Validación cruzada con gas de referencia

Como ya platicamos, esta es la parte que más credibilidad les da:

- Si consiguen una fuente de gas de concentración conocida (aunque sea un encendedor para LPG/CH4, o un producto con etiqueta de concentración), comparen el ppm calculado contra el valor esperado.
- Registren el error (diferencia porcentual) — este número es lo que va directo al criterio de "impacto medible" del documento.
- Repitan con los 4 sensores para tener una tabla comparativa de precisión por sensor.

## 7. Checklist antes de dar por calibrado un sensor

- [ ] Burn-in completo (24-48h según el sensor)
- [ ] Vout0 obtenido con al menos 2 repeticiones consistentes
- [ ] Curva log-log extraída del datasheet correcto para el gas de interés
- [ ] Al menos una comparación contra gas de referencia documentada
- [ ] Resultados con timestamp guardados (van directo al documento de la convocatoria)

---

**Fuentes técnicas consultadas:**
- Sandbox Electronics — método de cálculo de R0 y razón Rs/R0 (sandboxelectronics.com)
- Luis Llamas — implementación de curva logarítmica en Arduino (luisllamas.es)
