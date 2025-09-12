import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { HeroUIProvider } from "@heroui/react";
import { EquiposProvider } from "../context/EquiposContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <EquiposProvider>
        <Component {...pageProps} />
      </EquiposProvider>
    </HeroUIProvider>
  );
}
