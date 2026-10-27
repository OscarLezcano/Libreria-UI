"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  bookId: string;
  quantity: number;
}

export interface ShippingData {
  departamento: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

interface CartContextValue {
  items: CartItem[];
  coupon: string | null;
  shipping: ShippingData | null;
  count: number;
  add: (bookId: string, quantity?: number) => void;
  remove: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  setShipping: (shipping: ShippingData | null) => void;
}

const STORAGE_KEY = "bigbooks.cart";

interface CartState {
  items: CartItem[];
  coupon: string | null;
  shipping: ShippingData | null;
}

const EMPTY_STATE: CartState = { items: [], coupon: null, shipping: null };

let listeners: (() => void)[] = [];
let cachedRaw: string | null = null;
let cachedState: CartState = EMPTY_STATE;

function normalizeState(parsed: unknown): CartState {
  if (Array.isArray(parsed)) {
    return { items: parsed, coupon: null, shipping: null }; // formato v1
  }
  if (parsed && Array.isArray((parsed as CartState).items)) {
    const state = parsed as CartState;
    return { ...state, shipping: state.shipping ?? null };
  }
  return EMPTY_STATE;
}

function readSnapshot(): CartState {
  if (typeof window === "undefined") return EMPTY_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedState = raw ? normalizeState(JSON.parse(raw)) : EMPTY_STATE;
    } catch {
      cachedState = EMPTY_STATE;
    }
  }
  return cachedState;
}

function writeState(next: CartState) {
  cachedRaw = JSON.stringify(next);
  cachedState = next;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

function writeItems(items: CartItem[]) {
  writeState({ ...readSnapshot(), items });
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): CartState {
  return EMPTY_STATE;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const { items, coupon, shipping } = state;

  const add = useCallback((bookId: string, quantity = 1) => {
    const current = readSnapshot().items;
    const existing = current.find((item) => item.bookId === bookId);
    writeItems(
      existing
        ? current.map((item) =>
            item.bookId === bookId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...current, { bookId, quantity }]
    );
  }, []);

  const remove = useCallback((bookId: string) => {
    writeItems(readSnapshot().items.filter((item) => item.bookId !== bookId));
  }, []);

  const setQuantity = useCallback((bookId: string, quantity: number) => {
    writeItems(
      readSnapshot().items.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clear = useCallback(() => writeState(EMPTY_STATE), []);

  const setCoupon = useCallback(
    (code: string | null) => writeState({ ...readSnapshot(), coupon: code }),
    []
  );

  const setShipping = useCallback(
    (next: ShippingData | null) =>
      writeState({ ...readSnapshot(), shipping: next }),
    []
  );

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      coupon,
      shipping,
      count,
      add,
      remove,
      setQuantity,
      clear,
      setCoupon,
      setShipping,
    }),
    [items, coupon, shipping, count, add, remove, setQuantity, clear, setCoupon, setShipping]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}
