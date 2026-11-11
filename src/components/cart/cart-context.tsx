"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  maxQty: number;
  qty: number;
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  /** Cambia cada vez que se agrega algo (sirve para animar el botón del carrito). */
  bump: number;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const CartContext = createContext<CartValue | null>(null);
const KEY = "ariberry-carrito-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  // Recupera el carrito guardado en este celular.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única al cargar
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, ...item, qty: Math.min(i.qty + 1, item.maxQty) } : i,
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setBump((b) => b + 1);
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      isOpen,
      bump,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty: (id, qty) =>
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.maxQty)) } : i)),
        ),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
      has: (id) => items.some((i) => i.id === id),
    }),
    [items, isOpen, bump, add],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
