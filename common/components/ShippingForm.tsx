"use client";

import { ChevronLeft } from "lucide-react";
import { DEPARTAMENTOS, getCities } from "@/common/data/paraguay";
import type { BillingData, ShippingData } from "@/common/context/CartContext";
import Link from "next/link";
import { useState, type InputHTMLAttributes } from "react";

interface ShippingFormProps {
  onSubmit: (shipping: ShippingData, billing: BillingData) => void;
  initialShipping?: ShippingData | null;
  initialBilling?: BillingData | null;
  pending?: boolean;
}

const EMPTY_SHIPPING: ShippingData = {
  nombre: "",
  apellido: "",
  departamento: "",
  ciudad: "",
  direccion: "",
  referencia: "",
  telefono: "",
};

const EMPTY_BILLING: BillingData = {
  nombre: "",
  apellido: "",
  ruc: "",
  telefono: "",
};

const PHONE_PATTERN = /^(?:09[0-9]{8}|\+595[\s.-]?9[0-9]{8})$/;
const DOCUMENT_PATTERN = /^[0-9]{5,15}(?:-[0-9K])?$/i;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeShipping(data: ShippingData): ShippingData {
  return {
    nombre: normalizeText(data.nombre),
    apellido: normalizeText(data.apellido),
    departamento: data.departamento.trim(),
    ciudad: data.ciudad.trim(),
    direccion: normalizeText(data.direccion),
    referencia: normalizeText(data.referencia),
    telefono: data.telefono.trim(),
  };
}

function normalizeBilling(data: BillingData): BillingData {
  return {
    nombre: normalizeText(data.nombre),
    apellido: normalizeText(data.apellido),
    ruc: data.ruc.replace(/\s+/g, "").toUpperCase(),
    telefono: data.telefono.trim(),
  };
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function TextField({ id, label, error, ...props }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="fieldset">
      <label className="fieldset-legend" htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        className="input w-full"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <p id={errorId} className="text-error text-sm" role="alert">{error}</p>}
    </div>
  );
}

export default function ShippingForm({
  onSubmit,
  initialShipping,
  initialBilling,
  pending = false,
}: ShippingFormProps) {
  const [shipping, setShipping] = useState<ShippingData>({
    ...EMPTY_SHIPPING,
    ...initialShipping,
  });
  const [billing, setBilling] = useState<BillingData>({
    ...EMPTY_BILLING,
    ...initialBilling,
  });
  const [sameAsShipping, setSameAsShipping] = useState(() =>
    !initialBilling ||
    (initialBilling.nombre === initialShipping?.nombre &&
      initialBilling.apellido === initialShipping?.apellido &&
      initialBilling.telefono === initialShipping?.telefono)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateShipping = (field: keyof ShippingData, value: string) => {
    setShipping((current) => ({
      ...current,
      [field]: value,
      ...(field === "departamento" ? { ciudad: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [`shipping-${field}`]: "" }));
  };

  const updateBilling = (field: keyof BillingData, value: string) => {
    setBilling((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [`billing-${field}`]: "" }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedShipping = normalizeShipping(shipping);
    const normalizedBilling = normalizeBilling(
      sameAsShipping
        ? {
            ...billing,
            nombre: shipping.nombre,
            apellido: shipping.apellido,
            telefono: shipping.telefono,
          }
        : billing
    );
    const nextErrors: Record<string, string> = {};

    const requiredShipping: [keyof ShippingData, string][] = [
      ["nombre", "Ingresá el nombre del destinatario."],
      ["apellido", "Ingresá el apellido del destinatario."],
      ["departamento", "Seleccioná un departamento."],
      ["ciudad", "Seleccioná una ciudad."],
      ["direccion", "Ingresá la dirección de entrega."],
    ];
    requiredShipping.forEach(([field, message]) => {
      if (!normalizedShipping[field]) nextErrors[`shipping-${field}`] = message;
    });
    if (!PHONE_PATTERN.test(normalizedShipping.telefono)) {
      nextErrors["shipping-telefono"] = "Usá 0999999999 o +595 999999999.";
    }
    if (!sameAsShipping) {
      if (!normalizedBilling.nombre) nextErrors["billing-nombre"] = "Ingresá el nombre de facturación.";
      if (!normalizedBilling.apellido) nextErrors["billing-apellido"] = "Ingresá el apellido de facturación.";
      if (!PHONE_PATTERN.test(normalizedBilling.telefono)) {
        nextErrors["billing-telefono"] = "Usá 0999999999 o +595 999999999.";
      }
    }
    if (!DOCUMENT_PATTERN.test(normalizedBilling.ruc)) {
      nextErrors["billing-ruc"] = "Ingresá un RUC o CI válido, por ejemplo 1234567-8.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(normalizedShipping, normalizedBilling);
  };

  return (
    <form className="card bg-base-100 card-border w-full" onSubmit={handleSubmit} aria-busy={pending} noValidate>
      <fieldset className="contents" disabled={pending}>
        <div className="card-body gap-5">
          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="card-title text-base">Datos de envío</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="shipping-name" label="Nombre" type="text" required autoComplete="shipping given-name" value={shipping.nombre} onChange={(e) => updateShipping("nombre", e.target.value)} error={errors["shipping-nombre"]} />
              <TextField id="shipping-last-name" label="Apellido" type="text" required autoComplete="shipping family-name" value={shipping.apellido} onChange={(e) => updateShipping("apellido", e.target.value)} error={errors["shipping-apellido"]} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="fieldset">
                <label className="fieldset-legend" htmlFor="shipping-department">Departamento</label>
                <select id="shipping-department" name="shipping-department" className="select w-full" required autoComplete="shipping address-level1" value={shipping.departamento} onChange={(e) => updateShipping("departamento", e.target.value)} aria-invalid={Boolean(errors["shipping-departamento"])} aria-describedby={errors["shipping-departamento"] ? "shipping-departamento-error" : undefined}>
                  <option value="" disabled>Seleccioná un departamento</option>
                  {DEPARTAMENTOS.map((department) => <option key={department.name} value={department.name}>{department.name}</option>)}
                </select>
                {errors["shipping-departamento"] && <p id="shipping-departamento-error" className="text-error text-sm" role="alert">{errors["shipping-departamento"]}</p>}
              </div>
              <div className="fieldset">
                <label className="fieldset-legend" htmlFor="shipping-city">Ciudad</label>
                <select id="shipping-city" name="shipping-city" className="select w-full" required disabled={!shipping.departamento} autoComplete="shipping address-level2" value={shipping.ciudad} onChange={(e) => updateShipping("ciudad", e.target.value)} aria-invalid={Boolean(errors["shipping-ciudad"])} aria-describedby={errors["shipping-ciudad"] ? "shipping-ciudad-error" : undefined}>
                  <option value="" disabled>{shipping.departamento ? "Seleccioná una ciudad" : "Elegí primero un departamento"}</option>
                  {getCities(shipping.departamento).map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors["shipping-ciudad"] && <p id="shipping-ciudad-error" className="text-error text-sm" role="alert">{errors["shipping-ciudad"]}</p>}
              </div>
            </div>

            <div className="mt-4"><TextField id="shipping-address" label="Dirección de entrega" type="text" required autoComplete="shipping street-address" placeholder="Calle y número" value={shipping.direccion} onChange={(e) => updateShipping("direccion", e.target.value)} error={errors["shipping-direccion"]} /></div>
            <div className="mt-4"><TextField id="shipping-reference" label="Referencia (opcional)" type="text" placeholder="Edificio, piso o punto de referencia" value={shipping.referencia} onChange={(e) => updateShipping("referencia", e.target.value)} /></div>
            <div className="mt-4"><TextField id="shipping-phone" label="Teléfono del destinatario" type="tel" required autoComplete="shipping tel" inputMode="tel" placeholder="0999999999 o +595 999999999" value={shipping.telefono} onChange={(e) => updateShipping("telefono", e.target.value)} error={errors["shipping-telefono"]} /></div>
          </section>

          <section aria-labelledby="billing-heading">
            <h2 id="billing-heading" className="card-title text-base">Datos de facturación</h2>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="checkbox checkbox-sm" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />
              Usar los datos del destinatario
            </label>
            {!sameAsShipping && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField id="billing-name" label="Nombre" type="text" required autoComplete="billing given-name" value={billing.nombre} onChange={(e) => updateBilling("nombre", e.target.value)} error={errors["billing-nombre"]} />
                <TextField id="billing-last-name" label="Apellido" type="text" required autoComplete="billing family-name" value={billing.apellido} onChange={(e) => updateBilling("apellido", e.target.value)} error={errors["billing-apellido"]} />
              </div>
            )}
            <div className="mt-4"><TextField id="billing-ruc" label="RUC / CI" type="text" required inputMode="numeric" placeholder="Ej.: 1234567-8" value={billing.ruc} onChange={(e) => updateBilling("ruc", e.target.value)} error={errors["billing-ruc"]} /></div>
            {!sameAsShipping && <div className="mt-4"><TextField id="billing-phone" label="Teléfono de facturación" type="tel" required autoComplete="billing tel" inputMode="tel" placeholder="0999999999 o +595 999999999" value={billing.telefono} onChange={(e) => updateBilling("telefono", e.target.value)} error={errors["billing-telefono"]} /></div>}
          </section>

          <div className="mt-2 flex items-center justify-between gap-3">
            <Link href="/carrito" className="btn btn-ghost"><ChevronLeft className="size-4" strokeWidth={2.5} />Atrás</Link>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Creando pedido..." : "Continuar al pago"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
