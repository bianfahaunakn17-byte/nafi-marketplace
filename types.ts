export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: UserRole;
  status: string;
}

export interface AuthResponse {
  user: Record<string, unknown>;
  sessionToken: string;
  expiresAt?: string;
}

export interface Category {
  category_id: string | number;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  status?: string;
}

export interface Seller {
  seller_id: string | number;
  name: string;
  slug?: string;
  logo_url?: string;
  rating?: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  sellerId: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  productType: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  previewUrl: string;
  featured: boolean;
  status: string;
  category: Category | null;
  seller: Seller | null;
  ratingAverage: number;
  reviewCount: number;
}

export interface Review {
  review_id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  item_count: number;
  subtotal: number;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  order_id: string;
  invoice_number: string;
  customer_name?: string;
  customer_email?: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_status: string;
  order_status: string;
  proof_url?: string;
  created_at: string;
  item_count?: number;
  items?: OrderItem[];
  payment?: Record<string, unknown> | null;
  settings?: MarketplaceSettings;
}

export interface DownloadAccess {
  download_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  image_url: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  status: string;
  available: boolean;
}

export interface MarketplaceSettings {
  marketplace_name: string;
  currency: string;
  support_email: string;
  support_whatsapp: string;
  qris_image_url: string;
  maintenance_mode: boolean;
  proof_upload_max_mb: number;
}

export interface AdminOverview {
  total_revenue: number;
  total_orders: number;
  paid_orders: number;
  waiting_verification: number;
  active_products: number;
  total_users: number;
  pending_payments: number;
  recent_orders: Order[];
}
