"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_CITIES,
} from "@/lib/constants";
import { PaymentMethod } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "Tbilisi",
    address: "",
    apartment: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bog");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <section className="py-10 sm:py-16">
        <Container>
          <div className="animate-pulse h-96 bg-earth-100 rounded-lg" />
        </Container>
      </section>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\+?995\d{9}$|^\d{9}$/.test(formData.phone.replace(/\s/g, "")))
      newErrors.phone = "Enter a valid Georgian phone number";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    clearCart();
    router.push(
      `/order-confirmation?method=${paymentMethod}&total=${total.toFixed(2)}`
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <h1 className="text-3xl font-heading font-bold text-earth-900 mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Delivery Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border border-earth-100 p-6">
                <h2 className="text-lg font-heading font-bold text-earth-900 mb-6">
                  Delivery Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="fullName"
                    label="Full Name"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    placeholder="+995 5XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    error={errors.phone}
                  />
                  <div className="w-full">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-earth-700 mb-1"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full rounded-lg border border-earth-200 bg-white px-4 py-2.5 text-earth-900 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 focus:outline-none"
                    >
                      {DELIVERY_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    id="address"
                    label="Street Address"
                    placeholder="Street name and number"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    error={errors.address}
                  />
                  <Input
                    id="apartment"
                    label="Apartment / Floor (optional)"
                    placeholder="Apt 4, Floor 2"
                    value={formData.apartment}
                    onChange={(e) => updateField("apartment", e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      id="notes"
                      label="Delivery Notes (optional)"
                      placeholder="Gate code, landmarks, etc."
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-earth-100 p-6">
                <h2 className="text-lg font-heading font-bold text-earth-900 mb-6">
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === "bog"
                        ? "border-sage-500 bg-sage-50"
                        : "border-earth-200 hover:border-earth-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bog"
                      checked={paymentMethod === "bog"}
                      onChange={() => setPaymentMethod("bog")}
                      className="accent-sage-600"
                    />
                    <div>
                      <p className="font-medium text-earth-900">BOG iPay</p>
                      <p className="text-sm text-earth-500">
                        Bank of Georgia
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === "tbc"
                        ? "border-sage-500 bg-sage-50"
                        : "border-earth-200 hover:border-earth-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="tbc"
                      checked={paymentMethod === "tbc"}
                      onChange={() => setPaymentMethod("tbc")}
                      className="accent-sage-600"
                    />
                    <div>
                      <p className="font-medium text-earth-900">TBC Pay</p>
                      <p className="text-sm text-earth-500">TBC Bank</p>
                    </div>
                  </label>
                </div>
                <p className="mt-4 text-xs text-earth-400">
                  Payment integration coming soon. Orders are currently recorded
                  and confirmed for next-day delivery.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-earth-100 p-6 sticky top-24">
                <h2 className="text-lg font-heading font-bold text-earth-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-earth-700">
                        {item.product.name}{" "}
                        <span className="text-earth-400">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="text-earth-900 font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-earth-100 pt-3 space-y-2 text-sm">
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
                  <div className="border-t border-earth-100 pt-3 flex justify-between font-bold text-earth-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </section>
  );
}
