import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { products, getProductsByCategory } from "@/data/products";
import { CategorySlug } from "@/types/product";

export const metadata = {
  title: "Shop",
  description:
    "Browse our full range of regenerative farm products — grass-fed meat, dairy, natural wines, almonds, and seasonal vegetables.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const filteredProducts = category
    ? getProductsByCategory(category as CategorySlug)
    : products;

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop"
          subtitle="From our regenerative farm to your table. Next-day delivery across Georgia."
        />

        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>

        <div className="mt-8">
          <ProductGrid products={filteredProducts} />
        </div>
      </Container>
    </section>
  );
}
