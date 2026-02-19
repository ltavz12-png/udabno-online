export type CategorySlug =
  | "meat"
  | "dairy"
  | "almonds"
  | "wine"
  | "vegetables"
  | "eggs"
  | "baked-goods"
  | "ice-cream";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  unit: string;
  category: CategorySlug;
  image: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  weight?: number;
  alcoholContent?: number;
  grapeVariety?: string;
}
