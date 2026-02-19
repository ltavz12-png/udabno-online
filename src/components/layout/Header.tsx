"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import { MobileMenu } from "./MobileMenu";

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-earth-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-heading font-bold text-earth-900">
                Udabno
              </span>
              <span className="hidden sm:inline text-xs text-earth-500 uppercase tracking-widest mt-1">
                Farm
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-earth-700 hover:text-sage-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Cart + Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="relative flex items-center text-earth-700 hover:text-sage-600 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden text-earth-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
      />
    </>
  );
}
