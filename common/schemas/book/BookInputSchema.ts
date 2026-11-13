import * as z from "zod";

const blockedCoverExtensions = /\.(?:exe|msi|bat|cmd|com|scr|ps1|sh|js|vbs|jar|dll)$/i;

export const bookInputSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z
    .string()
    .min(1, "El precio es obligatorio")
    .regex(/^\d+$/, "El precio debe ser un número entero en guaraníes"),
  coverUrl: z
    .string()
    .url("Debe ser una URL válida")
    .refine((value) => {
      const parsed = new URL(value);
      return (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        !blockedCoverExtensions.test(parsed.pathname)
      );
    }, "La portada debe usar http/https y no puede apuntar a un ejecutable")
    .optional()
    .or(z.literal("")),
  authors: z.array(z.string().min(1)).default([]),
  genres: z.array(z.string().min(1)).default([]),
});

export type bookInputType = z.infer<typeof bookInputSchema>;
