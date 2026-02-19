"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { categories } from "@/data/products";

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const handleFilter = (slug: string | null) => {
    if (slug) {
      router.push(`/shop?category=${slug}`, { scroll: false });
    } else {
      router.push("/shop", { scroll: false });
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleFilter(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
          !activeCategory
            ? "bg-sage-600 text-white"
            : "bg-earth-100 text-earth-700 hover:bg-earth-200"
        )}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleFilter(cat.slug)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
            activeCategory === cat.slug
              ? "bg-sage-600 text-white"
              : "bg-earth-100 text-earth-700 hover:bg-earth-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
