import { Product, Category, CategorySlug } from "@/types/product";

export const categories: Category[] = [
  {
    slug: "meat",
    name: "Meat",
    description:
      "Grass-fed retired dairy cow beef, raised regeneratively on open pastures.",
  },
  {
    slug: "dairy",
    name: "Dairy",
    description:
      "Fresh cheese, butter, and sour cream from our pasture-raised herd.",
  },
  {
    slug: "almonds",
    name: "Almonds",
    description:
      "Almonds, almond milk, and almond flour from our million-tree orchards.",
  },
  {
    slug: "wine",
    name: "Wine",
    description:
      "Sulphite-free natural wines from revived endemic Georgian grape varieties.",
  },
  {
    slug: "vegetables",
    name: "Vegetables",
    description:
      "Seasonal vegetables grown in regenerative greenhouses with livestock compost.",
  },
  {
    slug: "eggs",
    name: "Eggs",
    description: "Free-range eggs from hens raised on regenerative pastures.",
  },
  {
    slug: "baked-goods",
    name: "Baked Goods",
    description: "Daily baked goods made with our own farm ingredients.",
  },
  {
    slug: "ice-cream",
    name: "Ice Cream",
    description: "Vegan ice cream made from our farm-grown almonds.",
  },
];

export const products: Product[] = [
  // === MEAT ===
  {
    id: "retired-ribeye-500g",
    slug: "retired-dairy-cow-ribeye",
    name: "Retired Dairy Cow Ribeye",
    description:
      "Rich, deeply flavored ribeye from our grass-fed retired dairy cows. Dry-aged for exceptional tenderness.",
    longDescription:
      "Our retired dairy cows spend their final years grazing freely on Udabno's 20,000 hectares of regenerative pastures. The result is a ribeye with unmatched depth of flavor — marbled naturally from years of grass-fed living. Each cut is dry-aged to develop a rich, nutty profile that honors the animal's full life cycle.",
    price: 35.0,
    unit: "500g",
    category: "meat",
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["grass-fed", "regenerative", "dry-aged"],
    weight: 500,
  },
  {
    id: "retired-striploin-500g",
    slug: "retired-dairy-cow-striploin",
    name: "Retired Dairy Cow Striploin",
    description:
      "A bold, beefy striploin with intense flavor from years of natural grazing.",
    longDescription:
      "Cut from the short loin of our retired dairy cows, this striploin offers a leaner alternative to the ribeye while maintaining the distinctive deep flavor that only comes from a grass-fed animal that has lived a full, natural life on regenerative pastures.",
    price: 32.0,
    unit: "500g",
    category: "meat",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "regenerative"],
    weight: 500,
  },
  {
    id: "retired-chuck-1kg",
    slug: "retired-dairy-cow-chuck",
    name: "Retired Dairy Cow Chuck Roast",
    description:
      "Perfect for slow cooking. Rich collagen makes for incredibly tender braises.",
    longDescription:
      "The chuck from our retired dairy cows is a braising masterpiece. Years of movement on open pastures mean developed muscles rich in collagen, which melts into silky, gelatinous tenderness during slow cooking. Ideal for stews, pot roasts, and traditional Georgian dishes.",
    price: 28.0,
    unit: "1kg",
    category: "meat",
    image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "regenerative", "slow-cook"],
    weight: 1000,
  },
  {
    id: "retired-brisket-1kg",
    slug: "retired-dairy-cow-brisket",
    name: "Retired Dairy Cow Brisket",
    description:
      "The ultimate low-and-slow cut. Smoke it, braise it, or cure it for pastrami.",
    longDescription:
      "Brisket from our retired dairy cows has a depth of flavor that younger beef simply cannot match. The well-worked pectoral muscle is loaded with intramuscular fat and connective tissue that transforms into buttery tenderness with patient, low-temperature cooking.",
    price: 25.0,
    unit: "1kg",
    category: "meat",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["grass-fed", "regenerative", "slow-cook"],
    weight: 1000,
  },
  {
    id: "ground-beef-500g",
    slug: "grass-fed-ground-beef",
    name: "Grass-Fed Ground Beef",
    description:
      "Versatile ground beef with the perfect fat-to-lean ratio for burgers and sauces.",
    longDescription:
      "Our ground beef is a blend of cuts from our retired dairy herd, giving it a rich, complex flavor profile. The natural fat marbling from grass-fed living means juicier burgers, more flavorful bolognese, and heartier meatballs — no additives needed.",
    price: 18.0,
    unit: "500g",
    category: "meat",
    image: "https://images.unsplash.com/photo-1602470521006-aaea8b2ecc44?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "regenerative"],
    weight: 500,
  },
  {
    id: "beef-bones-1kg",
    slug: "grass-fed-beef-bones",
    name: "Grass-Fed Beef Bones",
    description:
      "Marrow and knuckle bones perfect for rich, nourishing bone broth.",
    longDescription:
      "A mix of marrow bones and knuckle joints from our grass-fed herd. Roast them for marrow, or simmer for 24+ hours to extract the deepest, most mineral-rich bone broth. From animals raised on regenerative pastures, these bones carry the full nutritional spectrum of healthy soil.",
    price: 12.0,
    unit: "1kg",
    category: "meat",
    image: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "regenerative", "bone-broth"],
    weight: 1000,
  },

  // === DAIRY ===
  {
    id: "farm-cheese-300g",
    slug: "udabno-farm-cheese",
    name: "Udabno Farm Cheese",
    description:
      "Traditional Georgian cheese made from raw milk of our pasture-raised cows.",
    longDescription:
      "Handcrafted daily using raw milk from our pasture-raised herd. This traditional Georgian cheese has a creamy, tangy flavor that reflects the diverse grasses and herbs of Kakheti's landscape. Part of the complete regenerative cycle — healthy soil grows healthy grass, healthy grass feeds healthy cows, healthy cows give extraordinary milk.",
    price: 15.0,
    unit: "300g",
    category: "dairy",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["raw-milk", "traditional", "regenerative"],
    weight: 300,
  },
  {
    id: "farm-butter-200g",
    slug: "udabno-farm-butter",
    name: "Udabno Farm Butter",
    description:
      "Golden, grass-fed butter with a rich, nutty flavor. Cultured and churned on the farm.",
    longDescription:
      "Our butter is churned from the cream of grass-fed, pasture-raised cows. The golden color comes naturally from the beta-carotene in the grasses our cows eat. Cultured before churning for a deeper, more complex flavor profile that elevates everything it touches.",
    price: 10.0,
    unit: "200g",
    category: "dairy",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["grass-fed", "cultured", "regenerative"],
    weight: 200,
  },
  {
    id: "sour-cream-300g",
    slug: "udabno-sour-cream",
    name: "Udabno Sour Cream",
    description:
      "Thick, tangy sour cream made from pasture-raised cow milk. No thickeners added.",
    longDescription:
      "Our sour cream is made the traditional way — fresh cream cultured with natural bacteria until it reaches the perfect tangy thickness. No gums, stabilizers, or thickeners. Just pure, grass-fed cream transformed by time and beneficial cultures.",
    price: 8.0,
    unit: "300g",
    category: "dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "cultured", "regenerative"],
    weight: 300,
  },
  {
    id: "fresh-milk-1l",
    slug: "udabno-fresh-milk",
    name: "Udabno Fresh Milk",
    description:
      "Whole, non-homogenized milk from our pasture-raised herd. Cream-top.",
    longDescription:
      "Non-homogenized, minimally pasteurized whole milk from cows that graze on Udabno's regenerative pastures. The cream rises naturally to the top — shake to blend or skim it off for your coffee. This is milk the way it was meant to taste.",
    price: 6.0,
    unit: "1L",
    category: "dairy",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["grass-fed", "non-homogenized", "regenerative"],
    weight: 1050,
  },

  // === ALMONDS ===
  {
    id: "raw-almonds-500g",
    slug: "udabno-raw-almonds",
    name: "Udabno Raw Almonds",
    description:
      "Crunchy, sweet raw almonds from our million-tree regenerative orchards.",
    longDescription:
      "Harvested from Udabno's vast almond orchards — over one million trees planted as part of our regenerative ecosystem. These almonds benefit from the natural pollinator corridors and moisture-retaining root systems of our diverse tree plantings. Sun-dried, never roasted, to preserve their full nutritional profile.",
    price: 22.0,
    unit: "500g",
    category: "almonds",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["regenerative", "raw", "organic"],
    weight: 500,
  },
  {
    id: "almond-milk-1l",
    slug: "udabno-almond-milk",
    name: "Udabno Almond Milk",
    description:
      "Creamy, unsweetened almond milk made from our farm-grown almonds.",
    longDescription:
      "Made from our own regeneratively grown almonds, blended and strained on the farm. No added sugars, no gums, no carrageenan — just almonds and water. The natural sweetness and creaminess come from the quality of the almonds themselves.",
    price: 9.0,
    unit: "1L",
    category: "almonds",
    image: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["vegan", "sugar-free", "regenerative"],
    weight: 1050,
  },
  {
    id: "almond-flour-400g",
    slug: "udabno-almond-flour",
    name: "Udabno Almond Flour",
    description:
      "Finely ground almond flour, perfect for gluten-free baking.",
    longDescription:
      "Blanched and finely milled from our farm-grown almonds. Ideal for macarons, cakes, and gluten-free baking. The fresh milling preserves the natural oils and delicate almond flavor that pre-packaged flours lose over time.",
    price: 16.0,
    unit: "400g",
    category: "almonds",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["gluten-free", "regenerative"],
    weight: 400,
  },

  // === WINE ===
  {
    id: "saperavi-750ml",
    slug: "udabno-saperavi",
    name: "Udabno Saperavi",
    description:
      "A bold, deep red natural wine from the endemic Saperavi grape. Sulphite-free.",
    longDescription:
      "Made from Saperavi grapes grown on our 20 hectares of vineyard in Kakheti — the heartland of Georgian winemaking. Vinified naturally with indigenous yeasts, no added sulphites, and minimal intervention. Deep ruby color with notes of dark fruit, earth, and a signature tannic structure that speaks to the terroir of Udabno.",
    price: 38.0,
    unit: "750ml",
    category: "wine",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["natural", "sulphite-free", "endemic"],
    weight: 1200,
    alcoholContent: 13.5,
    grapeVariety: "Saperavi",
  },
  {
    id: "rkatsiteli-750ml",
    slug: "udabno-rkatsiteli",
    name: "Udabno Rkatsiteli",
    description:
      "A crisp amber wine made in qvevri from the ancient Rkatsiteli grape.",
    longDescription:
      "Rkatsiteli is one of the world's oldest grape varieties, and ours are grown on the sun-drenched slopes of Udabno. Fermented on skins in traditional Georgian qvevri (clay vessels), this amber wine has a distinctive golden hue, notes of dried apricot and honey, and a pleasant tannic grip unique to skin-contact whites.",
    price: 35.0,
    unit: "750ml",
    category: "wine",
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["natural", "sulphite-free", "qvevri", "amber"],
    weight: 1200,
    alcoholContent: 12.5,
    grapeVariety: "Rkatsiteli",
  },
  {
    id: "mtsvane-750ml",
    slug: "udabno-mtsvane",
    name: "Udabno Mtsvane",
    description:
      "An elegant, aromatic white wine from the rare Mtsvane grape variety.",
    longDescription:
      "Mtsvane, meaning 'green' in Georgian, is a delicate grape variety that thrives in Kakheti's continental climate. Our natural vinification preserves its floral aromatics — jasmine, white peach, and fresh herbs — while the regenerative soil adds mineral depth. No sulphites, no additives, pure expression of place.",
    price: 36.0,
    unit: "750ml",
    category: "wine",
    image: "https://images.unsplash.com/photo-1566754436898-a085b3c05609?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["natural", "sulphite-free", "endemic"],
    weight: 1200,
    alcoholContent: 12.0,
    grapeVariety: "Mtsvane",
  },
  {
    id: "rose-750ml",
    slug: "udabno-rose",
    name: "Udabno Ros\u00e9",
    description:
      "A refreshing natural ros\u00e9 with bright acidity and stone fruit notes.",
    longDescription:
      "A short maceration of Saperavi grapes gives this ros\u00e9 its beautiful salmon color. Light, refreshing, and perfect for warm Georgian summers. Fermented with wild yeasts and bottled without any additions — a true natural wine experience.",
    price: 32.0,
    unit: "750ml",
    category: "wine",
    image: "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["natural", "sulphite-free"],
    weight: 1200,
    alcoholContent: 11.5,
    grapeVariety: "Saperavi",
  },

  // === VEGETABLES ===
  {
    id: "mixed-greens-300g",
    slug: "regenerative-mixed-greens",
    name: "Regenerative Mixed Greens",
    description:
      "A seasonal mix of lettuce, arugula, and herbs from our regenerative greenhouse.",
    longDescription:
      "Grown in our 1-hectare regenerative greenhouse, fertilized exclusively with compost from our own livestock. This seasonal mix changes with what's growing best — you might find baby lettuce, peppery arugula, tender spinach, and fresh herbs. Harvested the morning of delivery for maximum freshness.",
    price: 7.0,
    unit: "300g",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["regenerative", "seasonal", "greenhouse"],
    weight: 300,
  },
  {
    id: "tomatoes-1kg",
    slug: "regenerative-tomatoes",
    name: "Regenerative Tomatoes",
    description:
      "Vine-ripened heirloom tomatoes bursting with sun-drenched Kakheti flavor.",
    longDescription:
      "These are not supermarket tomatoes. Grown in our compost-rich regenerative soil, vine-ripened under the Kakheti sun, and picked only when fully ready. Heirloom varieties chosen for flavor, not shelf life. Eat them with nothing but a pinch of salt and our farm cheese.",
    price: 8.0,
    unit: "1kg",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["regenerative", "heirloom", "seasonal"],
    weight: 1000,
  },
  {
    id: "potatoes-2kg",
    slug: "regenerative-potatoes",
    name: "Regenerative Potatoes",
    description:
      "Earthy, creamy potatoes grown in mineral-rich regenerative soil.",
    longDescription:
      "Our potatoes grow in soil that has been regenerated through cover cropping, composting, and rotational grazing. The result is a potato with exceptional flavor and texture — creamy when mashed, crispy when roasted, and packed with the minerals that only healthy soil can provide.",
    price: 6.0,
    unit: "2kg",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82ber251?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["regenerative", "seasonal"],
    weight: 2000,
  },
  {
    id: "seasonal-box",
    slug: "seasonal-vegetable-box",
    name: "Seasonal Vegetable Box",
    description:
      "A curated box of whatever is growing best this week. Chef's choice.",
    longDescription:
      "Let our farmers pick for you. Each week, we curate a box of the freshest, most flavorful produce from our regenerative greenhouse and fields. Contents vary by season — that's the point. Expect surprises, discover new vegetables, and eat with the rhythm of nature.",
    price: 25.0,
    unit: "~3kg box",
    category: "vegetables",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["regenerative", "seasonal", "curated"],
    weight: 3000,
  },

  // === EGGS ===
  {
    id: "free-range-eggs-12",
    slug: "free-range-eggs",
    name: "Free-Range Eggs",
    description:
      "Dozen free-range eggs from hens roaming our regenerative pastures.",
    longDescription:
      "Our hens live outdoors on rotating pastures, scratching, foraging, and doing what chickens do best — eating bugs and fertilizing the soil. The rich, orange yolks tell the story of their diet: diverse insects, fresh grasses, and supplemental organic feed. Truly free-range, truly regenerative.",
    price: 8.0,
    unit: "12 eggs",
    category: "eggs",
    image: "https://images.unsplash.com/photo-1569288052389-dac9b0ac9eac?w=600&h=600&fit=crop",
    inStock: true,
    featured: true,
    tags: ["free-range", "regenerative", "pasture-raised"],
    weight: 720,
  },

  // === BAKED GOODS ===
  {
    id: "sourdough-bread",
    slug: "farm-sourdough-bread",
    name: "Farm Sourdough Bread",
    description:
      "Wild-yeast sourdough baked daily with flour from regenerative wheat.",
    longDescription:
      "Our sourdough starter has been alive for years, fed with flour milled from wheat grown on our regenerative fields. Slow-fermented for 24 hours, baked in a wood-fired oven. The crust crackles, the crumb is open and airy, and the flavor has that perfect tangy depth that only real sourdough delivers.",
    price: 8.0,
    unit: "1 loaf (~800g)",
    category: "baked-goods",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["sourdough", "wild-yeast", "regenerative"],
    weight: 800,
  },
  {
    id: "almond-cookies-6",
    slug: "almond-cookies",
    name: "Almond Cookies",
    description:
      "Crispy-chewy cookies made with our farm almonds and grass-fed butter.",
    longDescription:
      "Made with almonds from our orchards, butter from our dairy, and eggs from our free-range hens. These cookies are the regenerative farm in miniature — every ingredient comes from our land. Lightly sweetened with honey, with a satisfying crunch from chopped almonds.",
    price: 12.0,
    unit: "6 cookies",
    category: "baked-goods",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["farm-ingredients", "regenerative"],
    weight: 300,
  },

  // === ICE CREAM ===
  {
    id: "almond-ice-cream-500ml",
    slug: "almond-ice-cream",
    name: "Almond Ice Cream",
    description:
      "Creamy vegan ice cream made from our farm almond milk. Naturally sweet.",
    longDescription:
      "A rich, creamy ice cream base made entirely from our farm-grown almond milk. No dairy, no artificial flavors, no gums or stabilizers. The natural sweetness of our regeneratively grown almonds shines through. Churned in small batches and frozen at peak creaminess.",
    price: 14.0,
    unit: "500ml",
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["vegan", "regenerative", "small-batch"],
    weight: 500,
  },
  {
    id: "chocolate-almond-ice-cream-500ml",
    slug: "chocolate-almond-ice-cream",
    name: "Chocolate Almond Ice Cream",
    description:
      "Rich chocolate meets creamy almond milk in this decadent vegan treat.",
    longDescription:
      "Our almond milk ice cream base meets premium dark chocolate for a rich, indulgent vegan dessert. The almond base provides a subtle nuttiness that complements the deep cocoa flavors beautifully. Made in small batches with real cacao — no artificial chocolate flavoring.",
    price: 16.0,
    unit: "500ml",
    category: "ice-cream",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop",
    inStock: true,
    featured: false,
    tags: ["vegan", "regenerative", "chocolate", "small-batch"],
    weight: 500,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getAllCategories(): Category[] {
  return categories;
}
