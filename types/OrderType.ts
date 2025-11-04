export type PaymentMethod = "cod";

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  country: string;
  city?: string;
  postalCode?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  url: string;
  image?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderSchema {
  id: string;
  code: string;
  createdAt: string;
  cartIdentifier: string;
  paymentMethod: PaymentMethod;
  shippingFee: number;
  subtotal: number;
  total: number;
  notes?: string;
  customer: OrderCustomer;
  items: OrderItem[];
  status: "pending" | "confirmed" | "cancelled";
  verificationId: string;
}

export interface OrderStoreSchema {
  orders: OrderSchema[];
}

export interface VerificationRecord {
  id: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  createdAt: string;
  verifiedAt?: string;
  consumedAt?: string;
  attempts: number;
}

export interface VerificationStoreSchema {
  records: VerificationRecord[];
}
