"use client";

import { CreditCard, Lock } from "lucide-react";
import NotificationToast from "@/common/components/NotificationToast";
import { useState, useSyncExternalStore } from "react";

interface PaymentFormProps {
  total: number;
  onPaid: () => Promise<void>;
}

const formatGs = (value: number) =>
  new Intl.NumberFormat("es-PY").format(value);

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (digits: string) =>
  digits.replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (digits: string) =>
  digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

function subscribeToUserName(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getAuthenticatedUserName() {
  if (typeof window === "undefined") return "";
  const storedUser = localStorage.getItem("bigbooks.user");
  if (!storedUser) return "";

  try {
    const user: { name?: unknown; lastName?: unknown } = JSON.parse(storedUser);
    return [user.name, user.lastName]
      .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
      .join(" ");
  } catch {
    return "";
  }
}

function detectBrand(digits: string): string | null {
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

export default function PaymentForm({ total, onPaid }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [expiry, setExpiry] = useState("1228");
  const [cvv, setCvv] = useState("123");
  const authenticatedUserName = useSyncExternalStore(
    subscribeToUserName,
    getAuthenticatedUserName,
    () => ""
  );
  const [holder, setHolder] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brand = detectBrand(cardNumber);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    try {
      await onPaid();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar el pedido. Intentá nuevamente."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form
      className="card bg-base-100 card-border"
      onSubmit={handleSubmit}
      aria-busy={processing}
      autoComplete="off"
    >
      <div className="card-body gap-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Pago con tarjeta</h2>
          <span className="badge badge-soft gap-1.5">
            <CreditCard className="size-3.5" strokeWidth={2} />
            Bancard
          </span>
        </div>
        {error && (
          <NotificationToast type="error" message={error} className="text-sm" />
        )}

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Número de tarjeta</legend>
          <label className="input w-full">
            <CreditCard className="size-4 opacity-50" strokeWidth={2} />
            <input
              inputMode="numeric"
              required
              placeholder="4111 1111 1111 1111"
              value={formatCardNumber(cardNumber)}
              onChange={(e) =>
                setCardNumber(onlyDigits(e.target.value).slice(0, 16))
              }
            />
          </label>
          {brand && (
            <p className="text-base-content/60 label mt-1 text-xs">
              {brand}
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Vencimiento</legend>
            <input
              className="input w-full"
              inputMode="numeric"
              required
              placeholder="MM/AA"
              value={formatExpiry(expiry)}
              onChange={(e) => setExpiry(onlyDigits(e.target.value).slice(0, 4))}
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">CVV</legend>
            <label className="input w-full">
              <Lock className="size-4 opacity-50" strokeWidth={2} />
              <input
                inputMode="numeric"
                required
                maxLength={4}
                placeholder="123"
                value={cvv}
                onChange={(e) =>
                  setCvv(onlyDigits(e.target.value).slice(0, 4))
                }
              />
            </label>
          </fieldset>
        </div>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Titular de la tarjeta</legend>
          <input
            className="input w-full"
            required
            placeholder="Como figura en la tarjeta"
            value={holder ?? authenticatedUserName}
            onChange={(e) => setHolder(e.target.value)}
          />
        </fieldset>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${processing ? "btn-loading" : ""}`}
          disabled={processing}
        >
          {processing
            ? "Procesando pago..."
            : `Pagar ${formatGs(total)} Gs`}
        </button>
      </div>
    </form>
  );
}
