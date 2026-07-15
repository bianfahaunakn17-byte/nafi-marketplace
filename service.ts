import { apiGet, apiPost } from './api';
import type { AdminOverview, AuthResponse, CartResponse, Category, DownloadAccess, MarketplaceSettings, Order, Product, Review } from './types';

const rec = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
const str = (value: unknown) => value == null ? '' : String(value);
const num = (value: unknown) => Number(value || 0);

export function normalizeProduct(raw: unknown): Product {
  const r = rec(raw);
  return {
    id: str(r.product_id ?? r.id),
    slug: str(r.slug),
    name: str(r.name),
    categoryId: str(r.category_id),
    sellerId: str(r.seller_id),
    price: num(r.price),
    comparePrice: r.compare_price === '' || r.compare_price == null ? null : num(r.compare_price),
    stock: num(r.stock),
    productType: str(r.product_type || 'digital'),
    description: str(r.description),
    shortDescription: str(r.short_description),
    imageUrl: str(r.image_url ?? r.image),
    previewUrl: str(r.preview_url),
    featured: r.featured === true || String(r.featured).toLowerCase() === 'true',
    status: str(r.status || 'active'),
    category: r.category && typeof r.category === 'object' ? r.category as Product['category'] : null,
    seller: r.seller && typeof r.seller === 'object' ? r.seller as Product['seller'] : null,
    ratingAverage: num(r.rating_average ?? r.rating),
    reviewCount: num(r.review_count),
  };
}

const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export const marketplaceService = {
  ping: () => apiGet<Record<string, unknown>>('ping'),
  getSettings: () => apiGet<MarketplaceSettings>('getSettings'),
  getCategories: async () => array(await apiGet<unknown>('getCategories')) as Category[],
  getProducts: async (filters: Record<string, string | number | boolean | undefined> = {}) => array(await apiGet<unknown>('getProducts', filters)).map(normalizeProduct),
  getProduct: async (id: string) => normalizeProduct(await apiGet<unknown>('getProduct', { id })),
  getReviews: async (productId: string) => array(await apiGet<unknown>('getReviews', { product_id: productId })) as Review[],
  register: (input: { name: string; email: string; password: string; phone?: string }) => apiPost<AuthResponse>('register', { full_name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password, phone: input.phone || '' }, false),
  login: (input: { email: string; password: string }) => apiPost<AuthResponse>('login', { email: input.email.trim().toLowerCase(), password: input.password }, false),
  logout: () => apiPost('logout'),
  getMe: () => apiPost<Record<string, unknown>>('getMe'),
  updateProfile: (input: Record<string, unknown>) => apiPost('updateProfile', input),
  getCart: async () => {
    const c = await apiPost<CartResponse>('getCart');
    return { ...c, items: Array.isArray(c?.items) ? c.items.map(i => ({ ...i, product: normalizeProduct(i.product) })) : [] };
  },
  addCart: (productId: string) => apiPost<CartResponse>('addCart', { product_id: productId }),
  updateCart: (cartId: string, quantity: number) => apiPost<CartResponse>('updateCart', { cart_id: cartId, quantity }),
  removeCart: (cartId: string) => apiPost<CartResponse>('removeCart', { cart_id: cartId }),
  clearCart: () => apiPost<CartResponse>('clearCart'),
  createOrder: (input: Record<string, unknown>) => apiPost<Order>('createOrder', input),
  getMyOrders: async () => array(await apiPost<unknown>('getMyOrders')) as Order[],
  getOrderDetail: (orderId: string) => apiPost<Order>('getOrderDetail', { order_id: orderId }),
  submitPaymentProof: (input: Record<string, unknown>) => apiPost('submitPaymentProof', input),
  getMyDownloads: async () => array(await apiPost<unknown>('getMyDownloads')) as DownloadAccess[],
  requestDownload: (downloadId: string) => apiPost<{ download_url: string; remaining_downloads: number | null }>('requestDownload', { download_id: downloadId }),
  addReview: (input: { productId: string; rating: number; comment: string }) => apiPost('addReview', { product_id: input.productId, rating: input.rating, comment: input.comment }),
  adminOverview: () => apiPost<AdminOverview>('adminOverview'),
  adminListOrders: async (filters: Record<string, unknown> = {}) => array(await apiPost<unknown>('adminListOrders', filters)) as Order[],
  adminVerifyPayment: (orderId: string, approved: boolean, notes = '') => apiPost('adminVerifyPayment', { order_id: orderId, approved, notes }),
  adminUpdateOrderStatus: (orderId: string, orderStatus: string, paymentStatus = '') => apiPost('adminUpdateOrderStatus', { order_id: orderId, order_status: orderStatus, payment_status: paymentStatus }),
  adminSaveProduct: (product: Record<string, unknown>) => apiPost('adminSaveProduct', { product }),
  adminArchiveProduct: (productId: string) => apiPost('adminArchiveProduct', { product_id: productId }),
  adminListUsers: async (filters: Record<string, unknown> = {}) => array(await apiPost<unknown>('adminListUsers', filters)) as Record<string, unknown>[],
  adminUpdateUser: (input: Record<string, unknown>) => apiPost('adminUpdateUser', input),
};
