import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

type NotificationType = "error" | "success" | "info";
type NotificationPlacement = "inline" | "toast";

interface NotificationToastProps {
  type: NotificationType;
  message: string;
  placement?: NotificationPlacement;
  className?: string;
  onClose?: () => void;
}

const TYPE_CLASS: Record<NotificationType, string> = {
  error: "alert-error",
  success: "alert-success",
  info: "alert-info",
};

const TYPE_ICON = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
} satisfies Record<NotificationType, typeof Info>;

export default function NotificationToast({
  type,
  message,
  placement = "inline",
  className = "",
  onClose,
}: NotificationToastProps) {
  const Icon = TYPE_ICON[type];
  const alert = (
    <div
      className={`alert ${TYPE_CLASS[type]} ${className}`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Cerrar notificación"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return placement === "toast" ? (
    <div className="toast toast-end toast-bottom z-50">{alert}</div>
  ) : (
    alert
  );
}
