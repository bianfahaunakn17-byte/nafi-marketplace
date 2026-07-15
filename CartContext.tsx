import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { marketplaceService } from '../service';
import type { CartResponse } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue extends CartResponse {
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  update: (cartId: string, quantity: number) => Promise<void>;
  remove: (cartId: string) => Promise<void>;
  clear: () => Promise<void>;
}
const empty: CartResponse = { items: [], item_count: 0, subtotal: 0 };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse>(empty);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setCart(empty); return; }
    setLoading(true); try { setCart(await marketplaceService.getCart()); } finally { setLoading(false); }
  }, [isAuthenticated]);
  const add = async (id: string) => { setCart(await marketplaceService.addCart(id)); };
  const update = async (id: string, q: number) => { setCart(await marketplaceService.updateCart(id, q)); };
  const remove = async (id: string) => { setCart(await marketplaceService.removeCart(id)); };
  const clear = async () => { setCart(await marketplaceService.clearCart()); };
  const value = useMemo(() => ({ ...cart, loading, refresh, add, update, remove, clear }), [cart, loading, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart harus di dalam CartProvider.'); return ctx; }
