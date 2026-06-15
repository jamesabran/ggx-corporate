import { useEffect, useState } from 'react';
import { loadState, saveState } from './storage';

export interface CartItem {
  productId: string;
  quantity: number;
  productSnapshot: {
    name: string;
    unitPrice: number;
    images: string[];
    category: string;
  };
}

/** Seller context for the active cart (which store the items came from). */
export interface CartSeller {
  scopeId: string;
  storeName: string;
  slug: string;
}

type Listener = () => void;

let cart: CartItem[] = [];
// Seller context persists (survives the /shop → /checkout navigation + reload) so
// the checkout can gate delivery options and attribute the placed order.
let seller: CartSeller | null = loadState<CartSeller | null>('cartSeller', null);
const listeners = new Set<Listener>();

/** Record which store the current cart belongs to (set when browsing /shop/:slug). */
export function setCartSeller(next: CartSeller | null): void {
  seller = next;
  saveState('cartSeller', seller);
}

export function getCartSeller(): CartSeller | null {
  return seller;
}

function notify() {
  listeners.forEach((l) => l());
}

export function addToCart(item: CartItem): void {
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    cart = cart.map((i) =>
      i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
    );
  } else {
    cart = [...cart, item];
  }
  notify();
}

export function removeFromCart(productId: string): void {
  cart = cart.filter((i) => i.productId !== productId);
  notify();
}

export function updateQty(productId: string, qty: number): void {
  if (qty <= 0) { removeFromCart(productId); return; }
  cart = cart.map((i) => i.productId === productId ? { ...i, quantity: qty } : i);
  notify();
}

export function clearCart(): void {
  cart = [];
  notify();
}

export function getCart(): CartItem[] {
  return cart;
}

export function useCartItems(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>(() => cart);
  useEffect(() => {
    const listener: Listener = () => setItems([...cart]);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);
  return items;
}
