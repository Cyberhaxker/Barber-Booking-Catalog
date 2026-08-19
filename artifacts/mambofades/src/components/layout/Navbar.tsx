import { Link, useLocation } from "wouter";
import logoPath from "@assets/Untitled_design_1781856857171.png";

export function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/catalogue", label: "Styles" },
    { href: "/book", label: "Book Now" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/10 p-1.5 rounded-lg flex items-center justify-center">
            <img src={logoPath} alt="MamboFades Logo" className="h-10 w-auto invert" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight hidden sm:block">MamboFades</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/book" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}