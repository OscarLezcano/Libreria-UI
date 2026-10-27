import * as z from "zod";

export const loginInputSchema = z.object({
  email: z.string().email("Ingresá un correo válido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export type loginInputType = z.infer<typeof loginInputSchema>;
