"use client";

import {
  DEFAULT_THEME,
  THEME_EVENT,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  normalizeTheme,
  type ThemeId,
} from "@/common/config/themes";
import { Check, Palette } from "lucide-react";
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

export default function ThemePalettePicker() {
  const selectedTheme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerSnapshot
  );

  const selectTheme = (theme: ThemeId) => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // La selección sigue aplicándose aunque el navegador bloquee storage.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <section className="card card-border bg-base-100">
      <div className="card-body gap-6">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-box p-3">
            <Palette className="size-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Paleta de colores</h2>
            <p className="text-base-content/60 mt-1 text-sm">
              Elegí una combinación. Se guardará en este navegador.
            </p>
          </div>
        </div>

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="radiogroup"
          aria-label="Paleta de colores"
        >
          {THEME_OPTIONS.map((theme) => {
            const selected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectTheme(theme.id)}
                className={`card card-border text-left transition hover:border-primary ${
                  selected ? "border-primary bg-primary/5" : "border-base-300"
                }`}
              >
                <div className="card-body gap-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5" aria-hidden="true">
                      {theme.colors.map((color) => (
                        <span
                          key={color}
                          className="border-base-content/10 size-6 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {selected && (
                      <span className="badge badge-primary badge-sm gap-1">
                        <Check className="size-3" strokeWidth={3} />
                        Activa
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{theme.label}</p>
                    <p className="text-base-content/60 text-xs">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
