import { useEffect, useState } from 'react';

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

type Listener = () => void;

let cart: CartItem[] = [];
const listeners = new Set<Listener>();

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
