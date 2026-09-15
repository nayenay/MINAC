import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/sections/Footer";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const title = "MINAC — Soluciones Mineras";
const description =
  "Sistema de monitoreo de gases tóxicos para minas subterráneas: detección en cada punto de la operación, comunicación resiliente y gestión centralizada en tiempo real.";

export const metadata: Metadata = {
  // TODO: reemplazar con el dominio real una vez publicado el sitio
  metadataBase: new URL("https://minac.example.com"),
  title,
  description,
  openGraph: {
    title,
    description:
      "Detección temprana de gases tóxicos en minas subterráneas, en tiempo real y en cada punto de la operación.",
    siteName: "MINAC",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Detección temprana de gases tóxicos en minas subterráneas, en tiempo real y en cada punto de la operación.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
