/**
 * All Catalogue — theme palettes.
 *
 * ⚠️  FIX #1 (light-mode text invisible) lives here.
 * The light palette MUST use dark text tokens on light surfaces.
 * If your own copy of this file had light values like textPrimary:"#f8fafc"
 * (copied from the dark theme), every inline `style={{ color: p.textPrimary }}`
 * rendered white-on-white and disappeared in light mode.
 */

export type ThemeMode = "light" | "dark";

export type CataloguePalette = {
  isDark: boolean;
  pageBg: string;
  cardBg: string;
  cardBgSubtle: string;
  cardBorder: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGradient: string;
  chipActiveBg: string;
  chipActiveText: string;
  chipActiveBorder: string;
  chipInactiveBg: string;
  chipInactiveText: string;
  chipInactiveBorder: string;
  amberBg: string;
  amberText: string;
  heroFromTo: string;
};

const light: CataloguePalette = {
  isDark: false,
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBgSubtle: "#f8fafc",
  cardBorder: "#e2e8f0",
  inputBg: "#ffffff",
  // Dark text on light surfaces — strong contrast in light mode.
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
  accent: "#0369a1",
  accentGradient: "linear-gradient(135deg, #0891b2, #0369a1)",
  chipActiveBg: "#e0f2fe",
  chipActiveText: "#075985",
  chipActiveBorder: "#7dd3fc",
  chipInactiveBg: "#f1f5f9",
  chipInactiveText: "#475569",
  chipInactiveBorder: "#e2e8f0",
  amberBg: "#fef3c7",
  amberText: "#92400e",
  heroFromTo: "linear-gradient(135deg, #0c4a6e 0%, #075985 45%, #0e7490 100%)",
};

const dark: CataloguePalette = {
  isDark: true,
  pageBg: "#0b1220",
  cardBg: "#111c30",
  cardBgSubtle: "#0f192b",
  cardBorder: "#223047",
  inputBg: "#0b1424",
  textPrimary: "#f1f5f9",
  textSecondary: "#9fb0c7",
  textMuted: "#64748b",
  accent: "#38bdf8",
  accentGradient: "linear-gradient(135deg, #22d3ee, #0284c7)",
  chipActiveBg: "rgba(34, 211, 238, 0.14)",
  chipActiveText: "#67e8f9",
  chipActiveBorder: "rgba(34, 211, 238, 0.35)",
  chipInactiveBg: "rgba(148, 163, 184, 0.08)",
  chipInactiveText: "#cbd5e1",
  chipInactiveBorder: "#223047",
  amberBg: "rgba(245, 158, 11, 0.16)",
  amberText: "#fbbf24",
  heroFromTo: "linear-gradient(135deg, #0c4a6e 0%, #075985 45%, #0e7490 100%)",
};

export function getCataloguePalette(theme: ThemeMode): CataloguePalette {
  return theme === "dark" ? dark : light;
}
