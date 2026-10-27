import * as z from "zod";

export const registerInputSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre"),
  lastName: z.string().trim().min(2, "Ingresá tu apellido"),
  email: z.string().email("Ingresá un correo válido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
  city: z.string().trim().min(2, "Ingresá tu ciudad"),
});

export type registerInputType = z.infer<typeof registerInputSchema>;
