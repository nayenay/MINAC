import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Evita que Next.js infiera la raíz del workspace subiendo hasta el
  // package-lock.json de la raíz del repo (que no es un workspace real).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
