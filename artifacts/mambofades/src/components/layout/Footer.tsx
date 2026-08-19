export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-serif font-bold mb-4">MamboFades</h3>
          <p className="text-sm text-muted-foreground">Exquisite Hair Designer. Premium grooming and sharp styling for the modern man.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 text-foreground">Hours</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Mon - Fri: 9am - 8pm</li>
            <li>Saturday: 9am - 6pm</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 text-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>123 Grooming Ave</li>
            <li>City, ST 12345</li>
            <li>(555) 123-4567</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-4 text-foreground">Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/catalogue" className="hover:text-primary transition-colors">Catalogue</a></li>
            <li><a href="/book" className="hover:text-primary transition-colors">Book Now</a></li>
            <li><a href="/admin" className="hover:text-primary transition-colors">Admin Portal</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} MamboFades. All rights reserved.
      </div>
    </footer>
  );
}