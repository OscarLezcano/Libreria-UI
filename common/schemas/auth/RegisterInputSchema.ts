import { z } from 'zod';

export const registerInputSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa tu nombre'),
  lastName: z.string().trim().min(1, 'Ingresa tu apellido'),
  email: z.string().trim().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  city: z.string().trim().min(1, 'Ingresa tu ciudad'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
