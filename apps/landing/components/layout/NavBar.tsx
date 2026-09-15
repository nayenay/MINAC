"use client";

import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

const links = [
  { href: "#problema", label: "El problema" },
  { href: "#solucion", label: "La solución" },
  { href: "#estado-actual", label: "Estado actual" },
  { href: "#equipo", label: "Equipo" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" aria-label="MINAC — Soluciones Mineras">
          <Logo size="sm" />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
          <Button href="#contacto" size="sm">
            Contactar
          </Button>
        </nav>

        <button
          type="button"
          className="text-text-primary md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX size={26} /> : <IconMenu2 size={26} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-4 py-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href="#contacto" size="sm" className="w-full" onClick={() => setOpen(false)}>
              Contactar
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
