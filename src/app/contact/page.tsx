import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Udabno farm. Located in Georgia's Kakheti region.",
};

export default function ContactPage() {
  return (
    <section className="py-10 sm:py-16">
      <Container>
        <SectionHeading
          title="Contact Us"
          subtitle="We'd love to hear from you. Reach out with any questions about our products or farm."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-earth-100 p-8">
              <h3 className="text-xl font-heading font-bold text-earth-900 mb-6">
                Get in Touch
              </h3>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: "Farm Location",
                    value: CONTACT.address,
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: CONTACT.phone,
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: CONTACT.email,
                  },
                  {
                    icon: Clock,
                    label: "Delivery Hours",
                    value: "Monday – Saturday, 9:00 AM – 7:00 PM",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-earth-500">
                        {item.label}
                      </p>
                      <p className="text-earth-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tbilisi Shop */}
            <div className="bg-sage-50 rounded-xl p-6">
              <h3 className="font-heading font-bold text-sage-800 mb-2">
                Udabno Tbilisi Shop
              </h3>
              <p className="text-sm text-sage-700 leading-relaxed">
                Visit our Tbilisi shop for almond treats, eggs, vegan ice
                cream, and daily baked goods. Fresh deliveries from the farm
                every morning.
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div>
            <div className="bg-earth-100 rounded-xl aspect-[4/3] flex items-center justify-center">
              <div className="text-center text-earth-400">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Map — Udabno, Kakheti</p>
                <p className="text-xs mt-1 text-earth-300">
                  Google Maps embed will go here
                </p>
              </div>
            </div>

            {/* Delivery Areas */}
            <div className="mt-6 bg-white rounded-xl border border-earth-100 p-6">
              <h3 className="font-heading font-bold text-earth-900 mb-3">
                Delivery Areas
              </h3>
              <p className="text-sm text-earth-600 mb-3">
                We currently deliver to the following cities with next-day
                delivery:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tbilisi",
                  "Batumi",
                  "Kutaisi",
                  "Rustavi",
                  "Gori",
                  "Zugdidi",
                  "Telavi",
                ].map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1 bg-earth-100 rounded-full text-sm text-earth-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
