"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <section className="py-10 sm:py-16">
        <Container>
          <h1 className="text-3xl font-heading font-bold text-earth-900 mb-8">
            Your Cart
          </h1>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-earth-100 rounded-lg" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  const subtotal = getTotalPrice();
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <section className="py-10 sm:py-16">
        <Container>
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-earth-300 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-earth-900 mb-2">
              Your cart is empty
            </h1>
            <p className="text-earth-500 mb-8">
              Start shopping our regenerative farm products.
            </p>
            <Link href="/shop">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <h1 className="text-3xl font-heading font-bold text-earth-900 mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 bg-white rounded-xl border border-earth-100 p-4"
              >
                <div className="relative h-24 w-24 flex-shrink-0 bg-earth-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/${item.product.slug}`}
                    className="font-medium text-earth-900 hover:text-sage-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-earth-500">
                    {item.product.unit}
                  </p>
                  <p className="text-sm font-medium text-earth-900 mt-1">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-earth-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center border border-earth-200 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1.5 text-earth-600 hover:text-earth-900 cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-1.5 text-earth-600 hover:text-earth-900 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-earth-100 p-6 sticky top-24">
              <h2 className="text-lg font-heading font-bold text-earth-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-earth-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-earth-600">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-sage-600 font-medium">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-sage-600">
                    Free delivery on orders over{" "}
                    {formatPrice(FREE_DELIVERY_THRESHOLD)}
                  </p>
                )}
                <div className="border-t border-earth-100 pt-3 flex justify-between font-bold text-earth-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link
                href="/shop"
                className="block text-center text-sm text-earth-500 hover:text-sage-600 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
