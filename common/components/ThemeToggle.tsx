"use client";

import {
  DEFAULT_THEME,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  normalizeTheme,
  type ThemeId,
} from "@/common/config/themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getThemeSnapshot(): ThemeId {
  return normalizeTheme(document.documentElement.dataset.theme);
}

function getServerSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerSnapshot
  );
  const isDark = theme === "dark" || theme === "dracula";

  const toggleTheme = () => {
    const nextTheme: ThemeId = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // La preferencia visual sigue funcionando aunque el navegador bloquee storage.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-circle"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? (
        <Sun className="size-5" strokeWidth={2} />
      ) : (
        <Moon className="size-5" strokeWidth={2} />
      )}
    </button>
  );
}
