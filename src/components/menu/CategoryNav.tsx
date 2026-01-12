import { Category } from "@/types/menu";
import { cn } from "@/lib/utils";

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
  return (
    <nav className="sticky top-44 z-30 bg-acai-purple-deep/95 backdrop-blur-sm py-3 px-2 -mx-4 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300",
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-acai-lilac text-card-foreground hover:bg-acai-lilac-light"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
