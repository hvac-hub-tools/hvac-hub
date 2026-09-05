/**
 * Skeleton loaders for the catalogue.
 *
 * Why these exist: joining/filtering thousands of rows can take a beat, and
 * without feedback the app *feels* hung — users tap repeatedly. These shimmer
 * placeholders appear instantly on every tap so the UI always answers back.
 */
import type { CSSProperties } from "react";
import {
  getCataloguePalette,
  type CataloguePalette,
  type ThemeMode,
} from "../../data/catalogueTheme";

function Block({
  p,
  className,
  style,
}: {
  p: CataloguePalette;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        borderRadius: 6,
        background: p.isDark ? "rgba(148,163,184,0.10)" : "#e4eaf1",
        ...style,
      }}
    >
      <span
        className="absolute inset-0 animate-[cat-shimmer_1.5s_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${
            p.isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.8)"
          }, transparent)`,
        }}
      />
    </div>
  );
}

/** Skeleton that mirrors AllCatalogueCard's exact layout. */
export function ProductGridSkeleton({
  theme = "light",
  count = 6,
}: {
  theme?: ThemeMode;
  count?: number;
}) {
  const p = getCataloguePalette(theme);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: p.cardBg,
            border: `1px solid ${p.cardBorder}`,
            animationDelay: `${i * 60}ms`,
          }}
        >
          {/* Brand header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: `1px solid ${p.cardBorder}`, background: p.cardBgSubtle }}
          >
            <Block p={p} className="h-9 w-9 shrink-0" style={{ borderRadius: 10 }} />
            <div className="flex-1 space-y-2">
              <Block p={p} className="h-3 w-2/5" />
              <Block p={p} className="h-2.5 w-3/5" />
            </div>
            <Block p={p} className="h-4 w-8" style={{ borderRadius: 6 }} />
          </div>

          {/* Model + specs */}
          <div className="flex-1 px-4 py-3">
            <Block p={p} className="h-3.5 w-3/4" />
            <Block p={p} className="mt-2.5 h-6 w-24" style={{ borderRadius: 8 }} />
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <Block p={p} className="h-2 w-1/2" />
                  <Block p={p} className="h-2.5 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: `1px solid ${p.cardBorder}` }}
          >
            <Block p={p} className="h-2.5 w-16" />
            <Block p={p} className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full first-load skeleton: intro line + filter card + product grid. */
export default function CatalogueSkeleton({ theme = "light" }: { theme?: ThemeMode }) {
  const p = getCataloguePalette(theme);
  return (
    <div aria-busy="true" aria-label="Loading catalogue">
      {/* Intro line */}
      <Block p={p} className="mb-4 h-4 w-full max-w-2xl" />

      {/* Filter card */}
      <div
        className="mb-4 rounded-2xl p-4"
        style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
      >
        <Block p={p} className="mb-4 h-10 w-full" style={{ borderRadius: 12 }} />

        <Block p={p} className="mb-2 h-2.5 w-28" />
        <div className="mb-4 flex flex-wrap gap-2">
          {[88, 72, 96, 64, 80].map((w, i) => (
            <Block key={i} p={p} className="h-7" style={{ width: w, borderRadius: 999 }} />
          ))}
        </div>

        <Block p={p} className="mb-2 h-2.5 w-36" />
        <div className="mb-4 flex flex-wrap gap-2">
          {[56, 64, 60, 68].map((w, i) => (
            <Block key={i} p={p} className="h-7" style={{ width: w, borderRadius: 999 }} />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Block p={p} className="h-2.5 w-14" />
            <Block p={p} className="h-10 w-full" style={{ borderRadius: 12 }} />
          </div>
          <div className="space-y-2">
            <Block p={p} className="h-2.5 w-20" />
            <Block p={p} className="h-10 w-full" style={{ borderRadius: 12 }} />
          </div>
        </div>
      </div>

      <ProductGridSkeleton theme={theme} />
    </div>
  );
}
