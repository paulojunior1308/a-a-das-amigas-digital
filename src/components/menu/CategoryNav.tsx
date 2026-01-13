import { Category } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightIndicator, setShowRightIndicator] = useState(true);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevActiveRef = useRef(activeCategory);

  // Detectar se há scroll disponível
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftIndicator(scrollLeft > 10);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Animar quando categoria muda automaticamente (por scroll)
  useEffect(() => {
    if (prevActiveRef.current !== activeCategory) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      prevActiveRef.current = activeCategory;
      
      // Scroll automático para mostrar categoria ativa
      const activeButton = scrollRef.current?.querySelector(`[data-category="${activeCategory}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
      
      return () => clearTimeout(timer);
    }
  }, [activeCategory]);

  return (
    <nav className="sticky top-44 z-30 bg-acai-purple-deep/95 backdrop-blur-sm py-3 -mx-4 mb-4 relative">
      {/* Indicador de scroll à esquerda */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-acai-purple-deep/95 to-transparent z-10 pointer-events-none transition-opacity duration-300",
          showLeftIndicator ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Container com scroll */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            data-category={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-acai-lilac text-card-foreground hover:bg-acai-lilac-light",
              activeCategory === category.id && isAnimating && "animate-pulse ring-2 ring-acai-yellow ring-offset-2 ring-offset-acai-purple-deep"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Indicador de scroll à direita */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-acai-purple-deep/95 to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-center justify-end pr-2",
          showRightIndicator ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="w-5 h-5 text-acai-yellow animate-pulse" />
      </div>
    </nav>
  );
}
