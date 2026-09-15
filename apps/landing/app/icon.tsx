import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          border: "2px solid #171412",
          borderRadius: 4,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <path d="M2 6 L20 20 L2 34" stroke="#f2a302" strokeWidth="8" strokeLinecap="square" />
          <path d="M18 6 L36 20 L18 34" stroke="#f2a302" strokeWidth="8" strokeLinecap="square" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
