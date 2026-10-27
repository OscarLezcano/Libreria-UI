interface LoadingSpinnerProps {
  label: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
} as const;

export default function LoadingSpinner({
  label,
  size = "lg",
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex justify-center py-10"
      role="status"
      aria-live="polite"
    >
      <span
        className={`loading loading-spinner ${SIZE_CLASS[size]} text-primary`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
