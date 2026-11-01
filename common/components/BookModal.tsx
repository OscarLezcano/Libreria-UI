"use client";

import BookForm from "@/common/components/BookForm";
import NotificationToast from "@/common/components/NotificationToast";
import type { bookInputType } from "@/common/schemas/book/BookInputSchema";
import { useEffect, useRef } from "react";

interface BookModalProps {
  isOpen: boolean;
  initial?: bookInputType | null;
  formSession: number;
  error?: string | null;
  onErrorClose?: () => void;
  onSubmit: (data: bookInputType) => void;
  onClose: () => void;
  isPending?: boolean;
}

export default function BookModal({
  isOpen,
  initial,
  formSession,
  error,
  onErrorClose,
  onSubmit,
  onClose,
  isPending = false,
}: BookModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-2xl">
        <h3 className="mb-4 text-lg font-bold">
          {initial ? "Editar Libro" : "Nuevo Libro"}
        </h3>
        {error && (
          <NotificationToast
            type="error"
            message={error}
            placement="toast"
            onClose={onErrorClose}
          />
        )}
        <BookForm
          key={formSession}
          initial={initial}
          onSubmit={onSubmit}
          onCancel={onClose}
          isPending={isPending}
        />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
