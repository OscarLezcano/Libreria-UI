"use client";

import type { FocusEvent, RefObject } from "react";

interface EditableNumberInputProps {
  value: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  className: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function EditableNumberInput({
  value,
  min,
  step,
  onChange,
  label,
  className,
  disabled = false,
  inputRef,
}: EditableNumberInputProps) {
  const handleChange = (nextValue: string) => {
    if (nextValue === "") return;

    const parsedValue = Number(nextValue);
    if (Number.isSafeInteger(parsedValue) && parsedValue >= min) {
      onChange(parsedValue);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const parsedValue = Number(event.currentTarget.value);
    const nextValue =
      Number.isSafeInteger(parsedValue) && parsedValue >= min
        ? parsedValue
        : min;
    event.currentTarget.value = String(nextValue);
    if (nextValue !== value) onChange(nextValue);
  };

  return (
    <input
      type="number"
      min={min}
      step={step}
      defaultValue={value}
      ref={inputRef}
      aria-label={label}
      disabled={disabled}
      className={className}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={(event) => handleBlur(event)}
    />
  );
}
