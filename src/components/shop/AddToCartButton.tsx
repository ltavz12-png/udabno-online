"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/cart-store";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  product,
  showQuantity = false,
}: {
  product: Product;
  showQuantity?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
    setQuantity(1);
  };

  return (
    <div className="flex items-center gap-3">
      {showQuantity && (
        <div className="flex items-center border border-earth-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-earth-600 hover:text-earth-900 transition-colors cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-earth-600 hover:text-earth-900 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <Button onClick={handleAdd} disabled={!product.inStock} size={showQuantity ? "lg" : "md"}>
        {product.inStock ? "Add to Cart" : "Out of Stock"}
      </Button>
    </div>
  );
}
