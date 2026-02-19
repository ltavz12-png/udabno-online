import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  products,
  getProductBySlug,
  getProductsByCategory,
} from "@/data/products";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="py-10 sm:py-16">
      <Container>
        {/* Back link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-earth-600 hover:text-sage-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Image */}
          <div className="relative aspect-square bg-earth-100 rounded-2xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="sage">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-earth-900">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-earth-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-earth-500">/ {product.unit}</span>
            </div>

            <p className="mt-6 text-earth-700 leading-relaxed">
              {product.longDescription}
            </p>

            {product.grapeVariety && (
              <div className="mt-4 text-sm text-earth-600">
                <span className="font-medium">Grape variety:</span>{" "}
                {product.grapeVariety}
              </div>
            )}
            {product.alcoholContent && (
              <div className="mt-1 text-sm text-earth-600">
                <span className="font-medium">Alcohol:</span>{" "}
                {product.alcoholContent}%
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton product={product} showQuantity />
            </div>

            {/* Delivery info */}
            <div className="mt-8 bg-sage-50 rounded-lg p-4 text-sm text-sage-800">
              <p className="font-medium">Next-day delivery</p>
              <p className="mt-1 text-sage-600">
                Order by 6 PM for delivery tomorrow. Free delivery on orders
                over 100 ₾.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <SectionHeading
              title="You might also like"
              subtitle="More from the same category"
            />
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </Container>
    </section>
  );
}
