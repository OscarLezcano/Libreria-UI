import React from "react";

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function InputText({
  label,
  name,
  icon,
  error,
  ...props
}: InputTextProps) {
  return (
    <div>
      <label className="text-sm font-bold">{label}</label>
      <label className="input mb-4 w-full">
        {icon}
        <input name={name} {...props} />
      </label>
      {error && <span className="text-error text-sm">{error}</span>}
    </div>
  );
}
