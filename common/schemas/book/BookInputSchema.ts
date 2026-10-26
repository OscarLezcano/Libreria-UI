import * as z from "zod";

export const bookInputSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === "" || /^\d+$/.test(value),
      "El precio debe ser un número entero en guaraníes"
    ),
  coverUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  authors: z.array(z.string().min(1)).default([]),
  genres: z.array(z.string().min(1)).default([]),
});

export type bookInputType = z.infer<typeof bookInputSchema>;
