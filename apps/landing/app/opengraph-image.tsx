import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
              <path d="M2 6 L20 20 L2 34" stroke="#f2a302" strokeWidth="7" strokeLinecap="square" />
              <path d="M18 6 L36 20 L18 34" stroke="#f2a302" strokeWidth="7" strokeLinecap="square" />
            </svg>
            <span style={{ color: "#171412", fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>MINAC</span>
          </div>
          <span
            style={{
              color: "#8a8478",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: 6,
              paddingLeft: 72,
            }}
          >
            Soluciones Mineras
          </span>
          <span style={{ color: "#57534e", fontSize: 30, maxWidth: 950, paddingLeft: 72 }}>
            Detección temprana de gases tóxicos en minas subterráneas, en tiempo real y en cada punto de la
            operación.
          </span>
        </div>

        <div style={{ display: "flex", width: "100%", height: 10 }}>
          <div style={{ flex: 1, backgroundColor: "#22c55e" }} />
          <div style={{ flex: 1, backgroundColor: "#eab308" }} />
          <div style={{ flex: 1, backgroundColor: "#ef4444" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
