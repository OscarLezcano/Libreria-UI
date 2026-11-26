export const THEME_OPTIONS = [
  {
    id: "light",
    label: "Claro",
    description: "Limpio y luminoso",
    colors: ["#ffffff", "#3b82f6", "#1f2937"],
  },
  {
    id: "dark",
    label: "Oscuro",
    description: "Suave para la vista",
    colors: ["#1f2937", "#60a5fa", "#f3f4f6"],
  },
  {
    id: "valentine",
    label: "Violeta",
    description: "Cálido y creativo",
    colors: ["#f0d4e7", "#e96b8b", "#632c3b"],
  },
  {
    id: "emerald",
    label: "Esmeralda",
    description: "Fresco y natural",
    colors: ["#e6f4ea", "#10b981", "#1f2937"],
  },
  {
    id: "corporate",
    label: "Corporativo",
    description: "Claro y profesional",
    colors: ["#ffffff", "#4b6bfb", "#1f2937"],
  },
  {
    id: "dracula",
    label: "Drácula",
    description: "Oscuro y vibrante",
    colors: ["#282a36", "#bd93f9", "#f8f8f2"],
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];
export const DEFAULT_THEME: ThemeId = "light";
export const THEME_STORAGE_KEY = "bb-theme";
export const THEME_EVENT = "bb-theme-change";

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value);
}

export function normalizeTheme(value: unknown): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}
