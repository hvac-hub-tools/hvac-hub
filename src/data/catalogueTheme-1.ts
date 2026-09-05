/**
 * All Catalogue — shared theme palette
 *
 * Drop this file into: src/data/catalogueTheme.ts
 *
 * Mirrors the exact color tokens your other tools already use (see App.tsx:
 * #0B1F3A / #F8FAFC page backgrounds, #2DD4BF accent, #94a3b8 / #64748b
 * secondary text, etc.) so the catalogue looks native next to every other
 * screen when the user toggles dark/light mode.
 */

export type ThemeMode = "dark" | "light";

export function getCataloguePalette(theme: ThemeMode) {
  const isDark = theme === "dark";
  return {
    isDark,
    pageBg: isDark ? "#0B1F3A" : "#F8FAFC",
    heroFromTo: isDark
      ? "linear-gradient(135deg, #0f2847, #0B1F3A 60%, #06202b)"
      : "linear-gradient(135deg, #0f2847, #17324f 60%, #0e3a4a)",
    cardBg: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
    cardBgSubtle: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    inputBg: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
    textPrimary: isDark ? "#ffffff" : "#1E293B",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    textMuted: isDark ? "#64748b" : "#94a3b8",
    accent: "#2DD4BF",
    accentGradient: "linear-gradient(135deg, #2DD4BF, #2563b0)",
    chipActiveBg: isDark ? "rgba(45,212,191,0.15)" : "#e0f2fe",
    chipActiveBorder: isDark ? "1px solid rgba(45,212,191,0.35)" : "1px solid #7dd3fc",
    chipActiveText: isDark ? "#2DD4BF" : "#0e7490",
    chipInactiveBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    chipInactiveBorder: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
    chipInactiveText: isDark ? "#94a3b8" : "#64748b",
    dangerBg: isDark ? "rgba(244,63,94,0.1)" : "#fff1f2",
    dangerBorder: isDark ? "rgba(244,63,94,0.3)" : "#fecdd3",
    dangerText: isDark ? "#fca5a5" : "#e11d48",
    amberBg: isDark ? "rgba(217,119,6,0.15)" : "#fef3c7",
    amberText: isDark ? "#fbbf24" : "#b45309",
    skeletonBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
  };
}

export type CataloguePalette = ReturnType<typeof getCataloguePalette>;
