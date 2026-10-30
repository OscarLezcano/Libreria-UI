"use client";

import EditableNumberInput from "@/common/components/EditableNumberInput";
import { Minus, Plus } from "lucide-react";
import { useRef } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  label: string;
  size?: "sm" | "xs";
  disabled?: boolean;
}

export default function QuantitySelector({
  value,
  onChange,
  label,
  size = "sm",
  disabled = false,
}: QuantitySelectorProps) {
  const isCompact = size === "xs";
  const inputRef = useRef<HTMLInputElement>(null);

  const updateQuantity = (quantity: number) => {
    const nextQuantity = Math.max(1, quantity);
    if (inputRef.current) inputRef.current.value = String(nextQuantity);
    onChange(nextQuantity);
  };

  return (
    <div className="join">
      <button
        type="button"
        className={`btn btn-neutral join-item ${isCompact ? "btn-xs size-7 min-h-7 px-1" : "btn-sm"}`}
        aria-label={`${label}: disminuir`}
        disabled={disabled || value <= 1}
        onClick={() => updateQuantity(value - 1)}
      >
        <Minus className="size-3" strokeWidth={2.5} />
      </button>
      <EditableNumberInput
        value={value}
        min={1}
        step={1}
        onChange={onChange}
        label={label}
        disabled={disabled}
        inputRef={inputRef}
        className={`input join-item text-center ${isCompact ? "input-xs size-7 min-h-7 px-0" : "input-sm w-16"}`}
      />
      <button
        type="button"
        className={`btn btn-neutral join-item ${isCompact ? "btn-xs size-7 min-h-7 px-1" : "btn-sm"}`}
        aria-label={`${label}: aumentar`}
        disabled={disabled}
        onClick={() => updateQuantity(value + 1)}
      >
        <Plus className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}
