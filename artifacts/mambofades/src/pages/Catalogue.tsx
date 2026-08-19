import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListStyles } from "@workspace/api-client-react";
import { Clock, Filter, ImageIcon } from "lucide-react";

function getImageSrc(imageUrl: string | null | undefined, category: string): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `/api/storage${imageUrl}`;
}

export default function Catalogue() {
  const { data: styles, isLoading } = useListStyles();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const categories = ["fades", "cuts", "designs", "beard"];

  const filteredStyles = styles?.filter(
    (style) => (!activeCategory || style.category === activeCategory) && style.isActive
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border pt-12 pb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Style Catalogue</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated menu of cuts, fades, and grooming services. 
            Find your next look and book it instantly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button 
              variant={activeCategory === null ? "default" : "outline"} 
              onClick={() => setActiveCategory(null)}
              className="rounded-none whitespace-nowrap"
            >
              All Styles
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"} 
                onClick={() => setActiveCategory(cat)}
                className="rounded-none capitalize whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground hidden sm:flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Showing {filteredStyles?.length || 0} styles
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border overflow-hidden flex flex-col">
                <div className="aspect-square bg-muted" />
                <div className="p-6 space-y-3 flex-1">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredStyles?.length === 0 ? (
          <div className="text-center py-24 bg-card border border-border">
            <h3 className="text-xl font-bold mb-2">No styles found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStyles?.map((style) => {
              const imgSrc = getImageSrc(style.imageUrl, style.category);
              const hasFailed = failedImages.has(style.id);
              const showImage = imgSrc && !hasFailed;

              return (
                <div key={style.id} className="group cursor-pointer bg-card border border-border overflow-hidden transition-all hover:border-primary/50 flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {showImage ? (
                      <img 
                        src={imgSrc}
                        alt={style.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setFailedImages(prev => new Set(prev).add(style.id))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                        <ImageIcon className="h-12 w-12" />
                        <span className="text-sm uppercase tracking-widest">{style.category}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                        {style.category}
                      </span>
                      <span className="font-mono text-xl font-bold text-primary shadow-sm">
                        ${style.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">{style.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                      {style.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                      <span className="text-sm font-mono text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        {style.durationMinutes} MIN
                      </span>
                      <Button variant="default" className="rounded-none hover:bg-primary/90" asChild>
                        <Link href={`/book?style=${style.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
