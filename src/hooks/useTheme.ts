import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import type { Theme } from "@owlbear-rodeo/sdk";

/** Tracks the host Owlbear theme so our UI can follow light/dark automatically. */
export function useObrTheme(): Theme | null {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    OBR.onReady(async () => {
      const initial = await OBR.theme.getTheme();
      if (cancelled) return;
      setTheme(initial);
      unsub = OBR.theme.onChange(setTheme);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return theme;
}

/**
 * Applies the OBR theme to the document root as `data-theme="dark"|"light"`
 * so our plain-CSS custom properties (see index.css) follow the host's
 * light/dark mode instead of only the OS preference.
 */
export function useApplyObrTheme(): Theme | null {
  const theme = useObrTheme();

  useEffect(() => {
    if (!theme) return;
    document.documentElement.dataset.theme =
      theme.mode === "DARK" ? "dark" : "light";
    document.documentElement.style.setProperty("--accent", theme.primary.main);
    document.documentElement.style.setProperty(
      "--accent-contrast",
      theme.primary.contrastText,
    );
  }, [theme]);

  return theme;
}
