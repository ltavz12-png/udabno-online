import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CONTACT } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-200 mt-20">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-4">
              Udabno
            </h3>
            <p className="text-earth-400 text-sm leading-relaxed">
              Europe&apos;s largest regenerative farm. 20,000 hectares of
              soil-first agriculture in Georgia&apos;s Kakheti region. Part of
              Adjara Group.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Shop All", href: "/shop" },
                { name: "Our Story", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-earth-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-earth-400">
              <li>{CONTACT.address}</li>
              <li>{CONTACT.email}</li>
              <li>{CONTACT.phone}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-earth-800 mt-10 pt-8 text-center text-xs text-earth-500">
          &copy; {new Date().getFullYear()} Udabno Farm. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
