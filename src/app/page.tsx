import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Truck,
  TreePine,
  Sprout,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getFeaturedProducts } from "@/data/products";
import { FARM_STATS } from "@/lib/constants";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-earth-900 text-white overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"
          alt="Udabno regenerative farm landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-earth-950/90 via-earth-900/75 to-earth-900/50" />
        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="text-sage-300 text-sm uppercase tracking-widest mb-4">
              Europe&apos;s Largest Regenerative Farm
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              From Soil
              <br />
              to Table
            </h1>
            <p className="mt-6 text-lg text-earth-300 leading-relaxed max-w-lg">
              20,000 hectares of regenerative agriculture in Georgia&apos;s
              Kakheti region. Grass-fed meat, natural wines, farm dairy, and
              seasonal produce — delivered to your door next day.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg">Shop Now</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-earth-400 text-earth-200 hover:bg-earth-800 hover:text-white">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Sprout,
                title: "Regenerative",
                description:
                  "Soil-first farming that heals the land with every harvest.",
              },
              {
                icon: Leaf,
                title: "No Chemicals",
                description:
                  "Zero artificial fertilizers, pesticides, or additives.",
              },
              {
                icon: Truck,
                title: "Next-Day Delivery",
                description:
                  "Order by 6 PM, receive fresh produce tomorrow.",
              },
              {
                icon: TreePine,
                title: "1M+ Trees",
                description:
                  "Over a million trees planted for ecosystem restoration.",
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-sage-100 text-sage-600 mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-earth-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-earth-500 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            title="Featured Products"
            subtitle="Hand-picked favorites from our regenerative farm."
          />
          <ProductGrid products={featured} />
          <div className="text-center mt-10">
            <Link href="/shop">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Farm Story Teaser */}
      <section className="py-16 sm:py-20 bg-earth-900 text-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sage-400 text-sm uppercase tracking-widest mb-4">
                Our Philosophy
              </p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold">
                Regenerating the Land,
                <br />
                One Harvest at a Time
              </h2>
              <p className="mt-6 text-earth-300 leading-relaxed">
                Without healthy soil, nature cannot thrive. Without nature,
                there is no harvest. At Udabno, we observe and nurture natural
                processes rather than forcing change. Our animals live free,
                our crops grow in living soil, and every product tells the
                story of a complete regenerative cycle.
              </p>
              <Link href="/about" className="inline-block mt-6">
                <Button variant="outline" className="border-earth-500 text-earth-200 hover:bg-earth-800 hover:text-white">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="relative bg-earth-800 rounded-2xl aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop"
                alt="Cattle grazing on regenerative pastures"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Farm Stats */}
      <section className="py-12 bg-sage-600 text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: FARM_STATS.hectares, label: "Hectares" },
              { value: FARM_STATS.trees, label: "Trees Planted" },
              { value: FARM_STATS.livestock, label: "Livestock" },
              { value: FARM_STATS.vineyardHectares, label: "Ha of Vineyard" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-heading font-bold">
                  {stat.value}
                </p>
                <p className="mt-1 text-sage-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Delivery Banner */}
      <section className="py-12 bg-cream">
        <Container>
          <div className="text-center">
            <Truck className="h-10 w-10 text-sage-600 mx-auto mb-3" />
            <h2 className="text-2xl font-heading font-bold text-earth-900">
              Next-Day Delivery Across Georgia
            </h2>
            <p className="mt-2 text-earth-500 max-w-md mx-auto">
              Order by 6 PM and receive your farm-fresh products tomorrow.
              Free delivery on orders over 100 ₾.
            </p>
            <Link href="/shop" className="inline-block mt-6">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
