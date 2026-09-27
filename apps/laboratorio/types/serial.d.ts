// Tipos ambientales mínimos para la Web Serial API. No forman parte de
// lib.dom.d.ts (soporte de navegador desigual: solo Chrome/Edge), así que se
// declaran aquí en vez de depender de un paquete @types/* externo.
export {};

declare global {
  interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
  }

  interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: "none" | "even" | "odd";
    bufferSize?: number;
    flowControl?: "none" | "hardware";
  }

  interface SerialPort extends EventTarget {
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    getInfo(): SerialPortInfo;
  }

  interface SerialPortRequestOptions {
    filters?: Array<{ usbVendorId?: number; usbProductId?: number }>;
  }

  interface Serial extends EventTarget {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    addEventListener(
      type: "connect" | "disconnect",
      listener: (event: Event) => void,
    ): void;
    removeEventListener(
      type: "connect" | "disconnect",
      listener: (event: Event) => void,
    ): void;
  }

  interface Navigator {
    serial: Serial;
  }
}
