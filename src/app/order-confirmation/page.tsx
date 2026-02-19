"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const total = searchParams.get("total") || "0";
  const method = searchParams.get("method") || "bog";

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-sage-500 mx-auto mb-6" />

          <h1 className="text-3xl font-heading font-bold text-earth-900 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-earth-600 mb-2">
            Thank you for your order. Your total was{" "}
            <span className="font-bold text-earth-900">{total} ₾</span> via{" "}
            {method === "bog" ? "BOG iPay" : "TBC Pay"}.
          </p>

          <div className="bg-sage-50 rounded-xl p-6 mt-8 text-left">
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 text-sage-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sage-800">
                  Next-day delivery
                </p>
                <p className="text-sm text-sage-600 mt-1">
                  Your order will be delivered tomorrow. We&apos;ll contact you
                  at the phone number provided to confirm delivery time.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <section className="py-10 sm:py-16">
          <Container>
            <div className="animate-pulse h-64 bg-earth-100 rounded-lg max-w-lg mx-auto" />
          </Container>
        </section>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
