import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Config, Data, Layout } from "plotly.js";
import type { HistoricoEntry, SensorKey } from "../../types/monitoreo";
import { hasFueraDeRango, SENSOR_LABELS, SENSOR_THRESHOLDS } from "../../utils/monitoreoStatus";

interface SensorHistoryChartProps {
  sensor: SensorKey;
  entries: HistoricoEntry[];
}

function getThresholds(sensor: SensorKey): {
  advertencia?: number;
  peligro?: number;
} | null {
  if (sensor === "mq3") return null;
  return SENSOR_THRESHOLDS[sensor];
}

export default function SensorHistoryChart({
  sensor,
  entries,
}: SensorHistoryChartProps) {
  const sensorMeta = SENSOR_LABELS[sensor];
  const thresholds = getThresholds(sensor);

  const chartModel = useMemo(() => {
    const ordered = [...entries].sort(
      (a, b) => a.record.timestamp - b.record.timestamp,
    );

    const x = ordered.map((e) => e.record.timestamp);
    const y = ordered.map((e) => e.record[sensor]);
    // [via, fueraDeRango] for Plotly hovertemplate %{customdata[n]}
    const customdata = ordered.map((e) => [
      e.record.via ?? "N/D",
      e.record.fueraDeRango?.trim() ? e.record.fueraDeRango : "—",
    ]);

    const outOfRange = ordered.filter((e) =>
      hasFueraDeRango(e.record.fueraDeRango),
    );

    return { ordered, x, y, customdata, outOfRange };
  }, [entries, sensor]);

  if (entries.length === 0) {
    return (
      <p className="text-[#888888] text-sm rounded-2xl border border-dashed border-[#333333] p-6 text-center">
        No hay datos históricos para graficar.
      </p>
    );
  }

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: `${sensorMeta.name} (ppm)`,
      x: chartModel.x,
      y: chartModel.y,
      customdata: chartModel.customdata,
      marker: { size: 7, color: "#F8B519" },
      line: { color: "#F8B519", width: 2 },
      hovertemplate:
        `<b>${sensorMeta.name}</b><br>` +
        "Valor: %{y:.1f} ppm<br>" +
        "Marca del dispositivo: %{x} ms<br>" +
        "Vía: %{customdata[0]}<br>" +
        "Fuera de rango: %{customdata[1]}<extra></extra>",
    },
  ];

  if (chartModel.outOfRange.length > 0) {
    traces.push({
      type: "scatter",
      mode: "markers",
      name: "Fuera de rango",
      x: chartModel.outOfRange.map((e) => e.record.timestamp),
      y: chartModel.outOfRange.map((e) => e.record[sensor]),
      customdata: chartModel.outOfRange.map((e) => [
        e.record.via ?? "N/D",
        e.record.fueraDeRango ?? "—",
      ]),
      marker: {
        size: 11,
        color: "#ff6b6b",
        symbol: "x",
        line: { width: 2, color: "#ff6b6b" },
      },
      hovertemplate:
        `<b>${sensorMeta.name} · fuera de rango</b><br>` +
        "Valor: %{y:.1f} ppm<br>" +
        "Marca del dispositivo: %{x} ms<br>" +
        "Vía: %{customdata[0]}<br>" +
        "Fuera de rango: %{customdata[1]}<extra></extra>",
    });
  }

  if (thresholds?.advertencia !== undefined) {
    traces.push({
      type: "scatter",
      mode: "lines",
      name: `Umbral advertencia (${thresholds.advertencia})`,
      x: [chartModel.x[0], chartModel.x[chartModel.x.length - 1]],
      y: [thresholds.advertencia, thresholds.advertencia],
      line: { color: "#F8B519", width: 1.5, dash: "dot" },
      hoverinfo: "y+name",
    });
  }

  if (thresholds?.peligro !== undefined) {
    traces.push({
      type: "scatter",
      mode: "lines",
      name: `Umbral peligro (${thresholds.peligro})`,
      x: [chartModel.x[0], chartModel.x[chartModel.x.length - 1]],
      y: [thresholds.peligro, thresholds.peligro],
      line: { color: "#ff6b6b", width: 1.5, dash: "dash" },
      hoverinfo: "y+name",
    });
  }

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "#171717",
    plot_bgcolor: "#121212",
    font: { color: "#dddddd", size: 12 },
    margin: { l: 56, r: 24, t: 36, b: 56 },
    legend: {
      orientation: "h",
      yanchor: "bottom",
      y: 1.02,
      x: 0,
      font: { size: 11 },
    },
    xaxis: {
      title: { text: "Marca del dispositivo (ms)" },
      type: "linear",
      gridcolor: "#2a2a2a",
      zeroline: false,
      tickfont: { color: "#aaaaaa" },
    },
    yaxis: {
      title: { text: "Concentración (ppm)" },
      gridcolor: "#2a2a2a",
      zeroline: false,
      tickfont: { color: "#aaaaaa" },
    },
    hovermode: "closest",
  };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "lasso2d",
      "select2d",
      "autoScale2d",
      "toImage",
    ],
  };

  return (
    <div className="w-full rounded-2xl border border-[#333333] bg-[#171717] p-2 overflow-hidden">
      {sensor === "mq3" ? (
        <p className="px-3 pt-2 text-xs text-[#888888]">
          Sensor informativo: sin umbral de semáforo definido.
        </p>
      ) : null}
      <Plot
        data={traces}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: "100%", height: "360px" }}
        className="w-full"
      />
    </div>
  );
}
