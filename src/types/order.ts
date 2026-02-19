export type PaymentMethod = "bog" | "tbc";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  apartment?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "paid" | "processing" | "delivered";
  createdAt: string;
}
