"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white rounded-xl border border-earth-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square bg-earth-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-earth-900/40 flex items-center justify-center">
              <span className="bg-white text-earth-900 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
          {product.featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="sage">Featured</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-medium text-earth-900 group-hover:text-sage-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-earth-500 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-earth-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-earth-500 ml-1">
              / {product.unit}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
