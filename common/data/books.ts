export interface Book {
  id: string;
  code: number;
  coverSrc: string;
  price: number;
  title: string;
  authors: string[];
  categories: string[];
  description: string;
  shortDescription: string;
}

export const BOOKS: Book[] = [
  {
    id: "cooking-made-easy",
    code: 1024,
    coverSrc: "https://picsum.photos/seed/cooking/300/400",
    price: 70000,
    title: "Cooking Made Easy",
    authors: ["Emily Clark"],
    categories: ["Cocina"],
    description:
      "Recetas simples y deliciosas para el día a día. Más de 100 preparaciones fáciles para todos los niveles.",
    shortDescription: "Recetas simples y deliciosas para el día a día.",
  },
  {
    id: "mystery-of-the-lost-island",
    code: 1088,
    coverSrc: "https://picsum.photos/seed/island/300/400",
    price: 105000,
    title: "Mystery of the Lost Island",
    authors: ["Jane Smith"],
    categories: ["Misterio", "Ficción"],
    description:
      "Una novela de misterio que te mantiene en vilo hasta la última página. Cuando un arqueólogo desaparece en una isla remota, su hija debe seguir sus pasos y descifrar los secretos que esconde antes de que sea demasiado tarde.",
    shortDescription: "Una novela de misterio que te mantiene en vilo.",
  },
  {
    id: "shadows-of-doubt",
    code: 1132,
    coverSrc: "https://picsum.photos/seed/shadows/300/400",
    price: 98000,
    title: "Shadows of Doubt",
    authors: ["Emma Watson"],
    categories: ["Policial", "Misterio"],
    description:
      "Una novela policial llena de giros inesperados. Un detective persigue una verdad que nadie quiere revelar.",
    shortDescription: "Una novela policial llena de giros inesperados.",
  },
  {
    id: "taste-of-italy",
    code: 1170,
    coverSrc: "https://picsum.photos/seed/italy/300/400",
    price: 110000,
    title: "Taste of Italy",
    authors: ["Gina Rossi"],
    categories: ["Cocina", "Gastronomía"],
    description:
      "Recetas auténticas para llevar Italia a tu cocina. Un recorrido por la tradición culinaria italiana.",
    shortDescription: "Recetas auténticas para llevar Italia a tu cocina.",
  },
];

export function getBook(id: string): Book | undefined {
  return BOOKS.find((book) => book.id === id);
}
