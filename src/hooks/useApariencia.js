import { useCallback, useEffect, useState } from "react";

const CLAVE = "apariencia";

export const ACENTOS = {
  trigo: "#D9903D",
  terracota: "#C0654A",
  oliva: "#6B8C4A",
  cielo: "#3B82C4",
  frambuesa: "#C0406A",
};

const POR_DEFECTO = { theme: "light", accentColor: "trigo", textSize: "normal" };

function leer() {
  try {
    return { ...POR_DEFECTO, ...JSON.parse(localStorage.getItem(CLAVE) || "{}") };
  } catch {
    return POR_DEFECTO;
  }
}

// Aplica tema, color de acento y tamaño de texto al <html>.
export function aplicarApariencia({ theme, accentColor, textSize }) {
  const raiz = document.documentElement;
  const oscuro =
    theme === "dark" ||
    (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (oscuro) raiz.setAttribute("data-theme", "dark");
  else raiz.removeAttribute("data-theme");

  raiz.setAttribute("data-textsize", textSize);

  const acento = ACENTOS[accentColor] ?? ACENTOS.trigo;
  raiz.style.setProperty("--pan-accent", acento);
  raiz.style.setProperty("--pan-sidebar-active-bg", acento);
}

export default function useApariencia() {
  const [apariencia, setApariencia] = useState(leer);

  useEffect(() => {
    aplicarApariencia(apariencia);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(apariencia));
    } catch {
      // Si el almacenamiento no está disponible, solo se aplica en memoria.
    }
  }, [apariencia]);

  const setTheme = useCallback((theme) => setApariencia((a) => ({ ...a, theme })), []);
  const setAccentColor = useCallback(
    (accentColor) => setApariencia((a) => ({ ...a, accentColor })),
    [],
  );
  const setTextSize = useCallback((textSize) => setApariencia((a) => ({ ...a, textSize })), []);

  return { ...apariencia, setTheme, setAccentColor, setTextSize };
}

// Se llama una vez al arrancar la app para recuperar la apariencia guardada.
export function iniciarApariencia() {
  aplicarApariencia(leer());
}
