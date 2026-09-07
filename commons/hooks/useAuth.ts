import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '@/commons/services/auth';

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;
    },
  });
}