import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_CHANGED_EVENT } from '@/common/context/CartContext';
import { loginRequest, registerRequest } from '@/common/services/auth';
import type { registerInputType } from '@/common/schemas/auth/RegisterInputSchema';

function readStoredEmail(): string | null {
  const raw = localStorage.getItem("bigbooks.user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as { email?: unknown };
    return typeof user.email === "string"
      ? user.email.trim().toLowerCase() || null
      : null;
  } catch {
    return null;
  }
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      const previousUser = readStoredEmail();
      const nextUser = data.user?.email?.trim().toLowerCase() ?? null;
      queryClient.clear();
      if (previousUser && previousUser !== nextUser) {
        localStorage.removeItem("bigbooks.cart");
        localStorage.removeItem("bigbooks.order-checkout-data");
        localStorage.removeItem("bigbooks.checkout-session");
        sessionStorage.removeItem("bigbooks.checkout-session");
      }
      document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;
      if (data.user) {
        localStorage.setItem("bigbooks.user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("bigbooks.user");
      }
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    },
  });
}

export function useRegister() {
  return useMutation<void, Error, registerInputType>({
    mutationFn: registerRequest,
  });
}
