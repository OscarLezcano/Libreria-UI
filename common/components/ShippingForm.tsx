"use client";

import { ChevronLeft } from "lucide-react";
import { DEPARTAMENTOS, getCities } from "@/common/data/paraguay";
import { type ShippingData } from "@/common/context/CartContext";
import Link from "next/link";
import { useState } from "react";

export type { ShippingData };

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void;
  initial?: ShippingData | null;
}

const EMPTY_DATA: ShippingData = {
  departamento: "",
  ciudad: "",
  direccion: "",
  telefono: "",
};

export default function ShippingForm({
  onSubmit,
  initial,
}: ShippingFormProps) {
  const [data, setData] = useState<ShippingData>(initial ?? EMPTY_DATA);

  const update = (field: keyof ShippingData, value: string) =>
    setData((current) => ({
      ...current,
      [field]: value,
      ...(field === "departamento" ? { ciudad: "" } : {}),
    }));

  return (
    <form
      className="card bg-base-100 card-border min-h-[32rem] w-full"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(data);
      }}
    >
      <div className="card-body gap-5">
        <h2 className="card-title text-base">Datos de envío</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Departamento</legend>
            <select
              className="select"
              required
              value={data.departamento}
              onChange={(e) => update("departamento", e.target.value)}
            >
              <option value="" disabled>
                Seleccione un departamento
              </option>
              {DEPARTAMENTOS.map((department) => (
                <option key={department.name} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Ciudad</legend>
            <select
              className="select"
              required
              disabled={!data.departamento}
              value={data.ciudad}
              onChange={(e) => update("ciudad", e.target.value)}
            >
              <option value="" disabled>
                {data.departamento
                  ? "Seleccione una ciudad"
                  : "Elija primero un departamento"}
              </option>
              {getCities(data.departamento).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Dirección de referencia</legend>
          <input
            type="text"
            className="input w-full"
            required
            placeholder="Calle, número, referencia"
            value={data.direccion}
            onChange={(e) => update("direccion", e.target.value)}
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Teléfono del destinatario</legend>
          <input
            type="tel"
            className="input w-full"
            required
            placeholder="+595 9xx xxx xxx"
            value={data.telefono}
            onChange={(e) => update("telefono", e.target.value)}
          />
        </fieldset>

        <div className="mt-2 flex items-center justify-between gap-3">
          <Link href="/carrito" className="btn btn-ghost">
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Atrás
          </Link>
          <button type="submit" className="btn btn-primary">
            Continuar
          </button>
        </div>
      </div>
    </form>
  );
}
