"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Dialog, DialogPanel } from "@headlessui/react";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: { name: string; href: string }[];
}

export function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-earth-950/40" aria-hidden="true" />

      <DialogPanel className="fixed inset-y-0 right-0 w-full max-w-sm bg-cream p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xl font-heading font-bold text-earth-900">
            Udabno
          </span>
          <button onClick={onClose} className="text-earth-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className="text-lg font-medium text-earth-800 hover:text-sage-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </DialogPanel>
    </Dialog>
  );
}
