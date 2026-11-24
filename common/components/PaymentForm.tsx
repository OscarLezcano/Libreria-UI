"use client";

import { CreditCard, Lock } from "lucide-react";
import NotificationToast from "@/common/components/NotificationToast";
import { AUTH_CHANGED_EVENT } from "@/common/context/CartContext";
import { formatGs } from "@/common/utils/format";
import { useState, useSyncExternalStore } from "react";

interface PaymentFormProps {
  total: number;
  onPaid: () => Promise<void>;
}

type PaymentField = "cardNumber" | "expiry" | "cvv" | "holder";
type FieldErrors = Partial<Record<PaymentField, string>>;

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (digits: string) =>
  digits.replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (digits: string) =>
  digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

function subscribeToUserName(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  };
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

function passesLuhn(digits: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function getExpiryError(expiry: string) {
  if (!/^\d{4}$/.test(expiry)) {
    return "Ingresá el vencimiento en formato MM/AA.";
  }

  const month = Number(expiry.slice(0, 2));
  const year = 2000 + Number(expiry.slice(2));
  if (month < 1 || month > 12) {
    return "Ingresá un mes entre 01 y 12.";
  }

  const now = new Date();
  const expired =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);
  return expired ? "La tarjeta está vencida." : null;
}

export default function PaymentForm({ total, onPaid }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const authenticatedUserName = useSyncExternalStore(
    subscribeToUserName,
    getAuthenticatedUserName,
    () => ""
  );
  const [holder, setHolder] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const brand = detectBrand(cardNumber);
  const holderValue = holder ?? authenticatedUserName;

  const clearFieldError = (field: PaymentField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) return;

    setApiError(null);
    const trimmedHolder = holderValue.trim();
    const nextErrors: FieldErrors = {};

    if (!/^\d{13,19}$/.test(cardNumber)) {
      nextErrors.cardNumber = "Ingresá un número de tarjeta de 13 a 19 dígitos.";
    } else if (!passesLuhn(cardNumber)) {
      nextErrors.cardNumber = "El número de tarjeta no es válido.";
    }

    const expiryError = getExpiryError(expiry);
    if (expiryError) nextErrors.expiry = expiryError;
    if (!/^\d{3,4}$/.test(cvv)) {
      nextErrors.cvv = "Ingresá un CVV de 3 o 4 dígitos.";
    }
    if (!trimmedHolder) {
      nextErrors.holder = "Ingresá el nombre del titular.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setHolder(trimmedHolder);
    setProcessing(true);
    try {
      await onPaid();
    } catch (error) {
      setApiError(
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
      noValidate
    >
      <div className="card-body gap-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Pago con tarjeta</h2>
          <span className="badge badge-soft gap-1.5">
            <CreditCard className="size-3.5" strokeWidth={2} />
            Simulación
          </span>
        </div>
        <p className="text-base-content/60 text-xs">
          Pago simulado — no se procesan datos reales
        </p>
        {apiError && (
          <NotificationToast type="error" message={apiError} className="text-sm" />
        )}

        <fieldset className="fieldset">
          <legend id="card-number-label" className="fieldset-legend">
            Número de tarjeta
          </legend>
          <label className="input w-full">
            <CreditCard className="size-4 opacity-50" strokeWidth={2} />
            <input
              id="card-number"
              name="cardNumber"
              autoComplete="cc-number"
              inputMode="numeric"
              required
              maxLength={23}
              placeholder="4111 1111 1111 1111"
              value={formatCardNumber(cardNumber)}
              aria-labelledby="card-number-label"
              aria-invalid={Boolean(fieldErrors.cardNumber)}
              aria-describedby={fieldErrors.cardNumber ? "card-number-error" : undefined}
              onChange={(e) => {
                setCardNumber(onlyDigits(e.target.value).slice(0, 19));
                clearFieldError("cardNumber");
              }}
            />
          </label>
          {brand && (
            <p className="text-base-content/60 label mt-1 text-xs">
              {brand}
            </p>
          )}
          {fieldErrors.cardNumber && (
            <p id="card-number-error" className="label mt-1 text-xs text-error" role="alert">
              {fieldErrors.cardNumber}
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend id="expiry-label" className="fieldset-legend">
              Vencimiento
            </legend>
            <input
              id="expiry"
              name="expiry"
              className="input w-full"
              autoComplete="cc-exp"
              inputMode="numeric"
              required
              maxLength={5}
              placeholder="MM/AA"
              value={formatExpiry(expiry)}
              aria-labelledby="expiry-label"
              aria-invalid={Boolean(fieldErrors.expiry)}
              aria-describedby={fieldErrors.expiry ? "expiry-error" : undefined}
              onChange={(e) => {
                setExpiry(onlyDigits(e.target.value).slice(0, 4));
                clearFieldError("expiry");
              }}
            />
            {fieldErrors.expiry && (
              <p id="expiry-error" className="label mt-1 text-xs text-error" role="alert">
                {fieldErrors.expiry}
              </p>
            )}
          </fieldset>

          <fieldset className="fieldset">
            <legend id="cvv-label" className="fieldset-legend">
              CVV
            </legend>
            <label className="input w-full">
              <Lock className="size-4 opacity-50" strokeWidth={2} />
              <input
                id="cvv"
                name="cvv"
                autoComplete="cc-csc"
                inputMode="numeric"
                required
                maxLength={4}
                placeholder="123"
                value={cvv}
                aria-labelledby="cvv-label"
                aria-invalid={Boolean(fieldErrors.cvv)}
                aria-describedby={fieldErrors.cvv ? "cvv-error" : undefined}
                onChange={(e) => {
                  setCvv(onlyDigits(e.target.value).slice(0, 4));
                  clearFieldError("cvv");
                }}
              />
            </label>
            {fieldErrors.cvv && (
              <p id="cvv-error" className="label mt-1 text-xs text-error" role="alert">
                {fieldErrors.cvv}
              </p>
            )}
          </fieldset>
        </div>

        <fieldset className="fieldset">
          <legend id="holder-label" className="fieldset-legend">
            Titular de la tarjeta
          </legend>
          <input
            id="holder"
            name="holder"
            className="input w-full"
            autoComplete="cc-name"
            inputMode="text"
            required
            placeholder="Como figura en la tarjeta"
            value={holderValue}
            aria-labelledby="holder-label"
            aria-invalid={Boolean(fieldErrors.holder)}
            aria-describedby={fieldErrors.holder ? "holder-error" : undefined}
            onChange={(e) => {
              setHolder(e.target.value);
              clearFieldError("holder");
            }}
          />
          {fieldErrors.holder && (
            <p id="holder-error" className="label mt-1 text-xs text-error" role="alert">
              {fieldErrors.holder}
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          className={`btn btn-primary btn-block ${processing ? "btn-loading" : ""}`}
          disabled={processing}
        >
          {processing ? "Procesando pago..." : `Pagar ${formatGs(total)} Gs`}
        </button>
      </div>
    </form>
  );
}
