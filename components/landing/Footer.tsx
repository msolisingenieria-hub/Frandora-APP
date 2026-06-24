import Link from "next/link";

const LINKS = {
  Producto: [
    { label: "Funciones", href: "#features" },
    { label: "Planes", href: "#pricing" },
    { label: "Para barberías", href: "#industries" },
    { label: "Para spas", href: "#industries" },
  ],
  Empresa: [
    { label: "Sobre nosotros", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "mailto:hola@frandora.cl" },
    { label: "Soporte", href: "mailto:soporte@frandora.cl" },
  ],
  Legal: [
    { label: "Términos y condiciones", href: "/terms" },
    { label: "Privacidad", href: "/privacy" },
    { label: "Política de cookies", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#060e17] border-t border-white/5">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-sans font-bold text-xl text-white">Frandora</span>
            </Link>
            <p className="font-body text-white/40 text-sm leading-relaxed mb-5 max-w-xs">
              La plataforma más completa para negocios de servicios. Schedule Smart. Grow More.
            </p>
            {/* Social icons (placeholders) */}
            <div className="flex gap-3">
              {["Instagram", "Facebook", "TikTok", "WhatsApp"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                             text-white/40 hover:text-brand-teal hover:border-brand-teal/40 transition-all text-xs font-body"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="font-sans font-semibold text-white/70 text-xs uppercase tracking-wider mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-body text-sm text-white/40 hover:text-brand-teal transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-white/25 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Frandora. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1">
            <span className="font-body text-white/20 text-xs">Hecho con</span>
            <span className="text-brand-teal text-xs">♥</span>
            <span className="font-body text-white/20 text-xs">en Chile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
