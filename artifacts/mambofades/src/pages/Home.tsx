import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListStyles } from "@workspace/api-client-react";
import logoPath from "@assets/Untitled_design_1781856857171.png";
import { ArrowRight, Scissors, Clock, Award } from "lucide-react";

export default function Home() {
  const { data: styles } = useListStyles();

  // Get 3 random or top styles
  const featuredStyles = styles?.slice(0, 3) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale"
          style={{ backgroundImage: "url('/images/fade.png')" }}
        />
        
        <div className="container relative z-20 mx-auto px-4 flex flex-col items-center text-center">
          <div className="bg-primary/20 p-4 rounded-2xl mb-8 backdrop-blur-sm border border-primary/30">
            <img src={logoPath} alt="MamboFades Logo" className="h-32 md:h-48 w-auto invert" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            Exquisite Hair <span className="text-primary italic">Designer</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 font-light leading-relaxed">
            Where craft meets swagger. Premium grooming and sharp styling for the modern man. Step in, look twice as fresh when you walk out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg h-14 px-8 rounded-none" asChild>
              <Link href="/book">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-none border-primary/50 text-primary hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/catalogue">View Styles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Statement / Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Scissors className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Master Craft</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Precision cuts, flawless fades, and straight razor details by expert hands.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Your Time Respected</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Seamless booking and on-time service. You arrive, you sit, we work.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">Premium Vibe</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A modern environment, old-school soul, and an unmatched grooming experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalogue Preview */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Signature Styles</h2>
              <p className="text-muted-foreground max-w-xl">
                Browse our curated selection of cuts. Each designed to make a statement.
              </p>
            </div>
            <Link href="/catalogue" className="hidden md:flex items-center text-primary hover:text-primary/80 font-medium group">
              View all styles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStyles.map((style) => (
              <div key={style.id} className="group cursor-pointer bg-background border border-border overflow-hidden transition-all hover:border-primary/50">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  <img 
                    src={style.imageUrl || "/images/fade.png"} 
                    alt={style.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                      {style.category}
                    </span>
                    <span className="font-mono text-lg font-bold text-white shadow-sm">
                      ${style.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold font-serif mb-2">{style.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {style.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {style.durationMinutes} mins
                    </span>
                    <Button variant="outline" size="sm" className="rounded-none border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                      <Link href={`/book?style=${style.id}`}>Book This</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Button variant="outline" className="w-full rounded-none" asChild>
              <Link href="/catalogue">View all styles</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}