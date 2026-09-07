import * as z from "zod";

export const loginInputSchema = z.object({
  username: z.string().min(1, "El nombre de usuario no es válido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export type loginInputType = z.infer<typeof loginInputSchema>;