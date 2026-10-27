import { useMutation } from '@tanstack/react-query';
import { loginRequest, registerRequest } from '@/common/services/auth';
import type { registerInputType } from '@/common/schemas/auth/RegisterInputSchema';

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;
      if (data.user) {
        localStorage.setItem("bigbooks.user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("bigbooks.user");
      }
    },
  });
}

export function useRegister() {
  return useMutation<void, Error, registerInputType>({
    mutationFn: registerRequest,
  });
}
