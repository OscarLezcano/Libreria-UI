import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '@/common/services/auth';

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      document.cookie = `token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
      localStorage.setItem('token', data.token);
      const role = data.user?.roles?.[0]?.name || data.user?.role || 'READER';
      document.cookie = `role=${role}; path=/; SameSite=Lax`;
      localStorage.setItem('role', role);
    },
  });
}