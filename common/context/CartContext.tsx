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
  nombre: string;
  apellido: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  referencia: string;
  telefono: string;
}

export interface BillingData {
  nombre: string;
  apellido: string;
  ruc: string;
  telefono: string;
}

export interface CartContextValue {
  items: CartItem[];
  coupon: string | null;
  shipping: ShippingData | null;
  billing: BillingData | null;
  hydrated: boolean;
  count: number;
  add: (bookId: string, quantity?: number) => void;
  remove: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  setCheckout: (shipping: ShippingData, billing: BillingData) => void;
  clearCheckout: () => void;
}

const STORAGE_KEY = "bigbooks.cart";
export const AUTH_CHANGED_EVENT = "bigbooks.auth-changed";

interface CartState {
  items: CartItem[];
  coupon: string | null;
  shipping: ShippingData | null;
  billing: BillingData | null;
}

const EMPTY_STATE: CartState = {
  items: [],
  coupon: null,
  shipping: null,
  billing: null,
};

let listeners: (() => void)[] = [];
let cachedRaw: string | null | undefined;
let cachedState: CartState = EMPTY_STATE;

function normalizedQuantity(value: unknown): number {
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeShipping(value: unknown): ShippingData | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return {
    nombre: text(data.nombre),
    apellido: text(data.apellido),
    departamento: text(data.departamento),
    ciudad: text(data.ciudad),
    direccion: text(data.direccion),
    referencia: text(data.referencia),
    telefono: text(data.telefono),
  };
}

function normalizeBilling(value: unknown): BillingData | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return {
    nombre: text(data.nombre),
    apellido: text(data.apellido),
    ruc: text(data.ruc).replace(/\s+/g, "").toUpperCase(),
    telefono: text(data.telefono),
  };
}

function normalizeState(parsed: unknown): CartState {
  if (Array.isArray(parsed)) {
    return normalizeState({ items: parsed });
  }
  if (!parsed || typeof parsed !== "object") return EMPTY_STATE;

  const data = parsed as Record<string, unknown>;
  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const bookId = text(item.bookId);
    return bookId ? [{ bookId, quantity: normalizedQuantity(item.quantity) }] : [];
  });
  const rawShipping = data.shipping && typeof data.shipping === "object"
    ? (data.shipping as Record<string, unknown>)
    : null;
  const legacyShipping = rawShipping
    ? {
        ...rawShipping,
        nombre: rawShipping.nombre,
        apellido: rawShipping.apellido,
        ruc: rawShipping.ruc,
        departamento: rawShipping.departamento,
        ciudad: rawShipping.ciudad,
        direccion: rawShipping.direccion,
        referencia: rawShipping.referencia ?? "",
        telefono: rawShipping.telefono,
      }
    : null;
  const shipping = normalizeShipping(legacyShipping);
  const billing = normalizeBilling(data.billing) ??
    (legacyShipping && text(legacyShipping.ruc)
      ? normalizeBilling({
          nombre: legacyShipping.nombre,
          apellido: legacyShipping.apellido,
          ruc: legacyShipping.ruc,
          telefono: legacyShipping.telefono,
        })
      : null);
  const coupon = text(data.coupon).toUpperCase();

  return {
    items,
    coupon: coupon || null,
    shipping,
    billing,
  };
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
  const serialized = JSON.stringify(next);
  cachedRaw = serialized;
  cachedState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }
  listeners.forEach((listener) => listener());
}

function emitChange() {
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) emitChange();
  };
  const onAuthChanged = () => emitChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
  };
}

function getServerSnapshot(): CartState {
  return EMPTY_STATE;
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydratedSnapshot(): boolean {
  return false;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );
  const { items, coupon, shipping, billing } = state;

  const add = useCallback((bookId: string, quantity = 1) => {
    const cleanId = bookId.trim();
    if (!cleanId) return;
    const nextQuantity = normalizedQuantity(quantity);
    const current = readSnapshot().items;
    const existing = current.find((item) => item.bookId === cleanId);
    writeState({
      ...readSnapshot(),
      items: existing
        ? current.map((item) =>
            item.bookId === cleanId
              ? { ...item, quantity: item.quantity + nextQuantity }
              : item
          )
        : [...current, { bookId: cleanId, quantity: nextQuantity }],
    });
  }, []);

  const remove = useCallback((bookId: string) => {
    const snapshot = readSnapshot();
    writeState({
      ...snapshot,
      items: snapshot.items.filter((item) => item.bookId !== bookId),
    });
  }, []);

  const setQuantity = useCallback((bookId: string, quantity: number) => {
    const snapshot = readSnapshot();
    writeState({
      ...snapshot,
      items: snapshot.items.map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: normalizedQuantity(quantity) }
          : item
      ),
    });
  }, []);

  const clear = useCallback(() => writeState(EMPTY_STATE), []);

  const setCoupon = useCallback((code: string | null) => {
    const normalized = text(code).toUpperCase();
    writeState({ ...readSnapshot(), coupon: normalized || null });
  }, []);

  const setCheckout = useCallback((nextShipping: ShippingData, nextBilling: BillingData) => {
    writeState({
      ...readSnapshot(),
      shipping: normalizeShipping(nextShipping),
      billing: normalizeBilling(nextBilling),
    });
  }, []);

  const clearCheckout = useCallback(() => {
    const snapshot = readSnapshot();
    writeState({ ...snapshot, shipping: null, billing: null });
  }, []);

  const count = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      coupon,
      shipping,
      billing,
      hydrated,
      count,
      add,
      remove,
      setQuantity,
      clear,
      setCoupon,
      setCheckout,
      clearCheckout,
    }),
    [
      items,
      coupon,
      shipping,
      billing,
      hydrated,
      count,
      add,
      remove,
      setQuantity,
      clear,
      setCoupon,
      setCheckout,
      clearCheckout,
    ]
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
