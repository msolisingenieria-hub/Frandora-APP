"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/urls";

const NAV_LINKS = [
  { label: "Funciones", href: "#features" },
  { label: "Industrias", href: "#industries" },
  { label: "Planes", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-brand-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <FrandoraLogo size="sm" variant="dark" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-body font-medium text-brand-navy/70 hover:text-brand-teal transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={SIGN_IN_URL}
            className="text-sm font-body font-medium text-brand-navy hover:text-brand-teal transition-colors px-4 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href={SIGN_UP_URL}
            className="btn-brand text-sm py-2 px-5"
          >
            Empieza gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-brand-navy hover:text-brand-teal hover:bg-brand-mist/50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-brand-mist px-4 py-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-body font-medium text-brand-navy hover:text-brand-teal transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-brand-mist my-1" />
          <Link
            href={SIGN_IN_URL}
            className="text-base font-body font-medium text-brand-navy py-1"
          >
            Iniciar sesión
          </Link>
          <Link
            href={SIGN_UP_URL}
            className="btn-brand text-center text-sm"
          >
            Empieza gratis — 14 días sin costo
          </Link>
        </div>
      )}
    </header>
  );
}
