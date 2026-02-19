import Image from "next/image";
import { Leaf, TreePine, Sun, Droplets } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FARM_STATS } from "@/lib/constants";

export const metadata = {
  title: "Our Story",
  description:
    "Learn about Udabno — Europe's largest regenerative farm. 20,000 hectares of soil-first agriculture in Georgia's Kakheti region.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-earth-900 text-white">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=1080&fit=crop"
          alt="Regenerative farmland"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-earth-950/70" />
        <Container className="relative py-20 sm:py-28 text-center">
          <p className="text-sage-300 text-sm uppercase tracking-widest mb-4">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold">
            Regenerating the Earth,
            <br />
            One Hectare at a Time
          </h1>
          <p className="mt-6 text-lg text-earth-300 max-w-2xl mx-auto leading-relaxed">
            Udabno is Europe&apos;s largest regenerative farm — 20,000 hectares
            in Georgia&apos;s Kakheti region where we practice soil-first
            agriculture, grow over a million trees, and raise 15,300 livestock
            animals in harmony with nature.
          </p>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                title="Our Philosophy"
                subtitle="Minimal intervention, maximum regeneration."
                align="left"
              />
              <div className="space-y-4 text-earth-700 leading-relaxed">
                <p>
                  At Udabno, we believe that healthy soil is the foundation of
                  everything. Without healthy soil, nature cannot thrive, and
                  without nature, there is no harvest.
                </p>
                <p>
                  We practice regenerative agriculture — observing and nurturing
                  natural processes rather than forcing change. Our approach
                  builds soil health year over year, sequesters carbon,
                  increases biodiversity, and produces food that is genuinely
                  nourishing.
                </p>
                <p>
                  Every product from Udabno represents a complete cycle: soil
                  nourishes plants, plants feed animals, and animals contribute
                  to the health of the land. This is farming as nature intended.
                </p>
              </div>
            </div>
            <div className="relative bg-earth-100 rounded-2xl aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop"
                alt="Rich regenerative soil"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <SectionHeading
            title="What We Do"
            subtitle="A regenerative ecosystem on 20,000 hectares."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {[
              {
                icon: TreePine,
                title: "Trees & Almonds",
                description:
                  "Over one million trees — primarily almond orchards that produce almonds, almond milk, and flour while serving vital ecological functions: retaining moisture, supporting pollinators, and building topsoil.",
              },
              {
                icon: Sun,
                title: "Livestock & Dairy",
                description:
                  "Our cattle and sheep graze freely across rotating pastures, providing natural fertilization for the soil. Our dairy line — cheese, butter, and sour cream — represents the complete regenerative cycle.",
              },
              {
                icon: Droplets,
                title: "Vineyards & Wine",
                description:
                  "Over 20 hectares of vineyard planted with revived endemic Georgian grape varieties. We make sulphite-free natural wines using traditional and modern techniques, honoring Georgia's 8,000-year winemaking heritage.",
              },
              {
                icon: Leaf,
                title: "Vegetables & Greenhouses",
                description:
                  "Our regenerative greenhouses grow seasonal vegetables and greens using compost from our own livestock — no chemical fertilizers, no synthetic pesticides, just living soil growing real food.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-cream rounded-xl p-8 border border-earth-100"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-sage-100 text-sage-600 mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-earth-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-earth-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Animals */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative bg-earth-100 rounded-2xl aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop"
                alt="Cows grazing on open pastures"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading
                title="Our Animals"
                subtitle="Free, healthy, and natural lives."
                align="left"
              />
              <div className="space-y-4 text-earth-700 leading-relaxed">
                <p>
                  Our livestock — cattle and sheep — live freely on Udabno&apos;s
                  vast pastures. They are raised through regenerative
                  practices where animals serve an essential ecological role:
                  their grazing patterns mimic natural herd behavior that
                  stimulates grass growth and builds soil.
                </p>
                <p>
                  Our retired dairy cows, having lived full and productive
                  lives providing milk for our dairy products, offer a
                  uniquely flavorful beef. The deep, complex flavor of
                  grass-fed retired dairy cow meat is something younger beef
                  simply cannot match — the result of years of natural
                  grazing on diverse pastures.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Farm Stats */}
      <section className="py-12 bg-sage-600 text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: FARM_STATS.hectares, label: "Hectares" },
              { value: FARM_STATS.trees, label: "Trees Planted" },
              { value: FARM_STATS.livestock, label: "Livestock Animals" },
              { value: FARM_STATS.vineyardHectares, label: "Ha of Vineyard" },
              { value: FARM_STATS.cropHectares, label: "Ha of Crops" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-heading font-bold">{stat.value}</p>
                <p className="mt-1 text-sage-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Part of Adjara Group */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold text-earth-900 mb-4">
              Part of Adjara Group
            </h2>
            <p className="text-earth-600 leading-relaxed">
              Udabno farm is part of Adjara Group, one of Georgia&apos;s leading
              hospitality and agriculture companies. Our products reach
              consumers through Adjara Group restaurants, our Tbilisi shop,
              and now directly to your door through this online store.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
