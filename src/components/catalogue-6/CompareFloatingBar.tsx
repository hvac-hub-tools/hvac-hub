/**
 * Floating bottom bar — shows when 2+ products are selected for comparison.
 * Displays brand-color initials + "Compare N products →".
 */
import { ArrowRight, X } from "lucide-react";
import { useCompare } from "./CompareContext";
import type { ThemeMode } from "../../data/catalogueTheme";

type Props = {
  theme?: ThemeMode;
  onOpenCompare: () => void;
};

export default function CompareFloatingBar({ theme = "light", onOpenCompare }: Props) {
  const { items, count, remove, clearAll } = useCompare();

  if (count === 0) return null;

  return (
    // The app switches to its fixed bottom-nav (75px) below 880px, so the bar
    // floats above it there; on the desktop sidebar layout it sits at bottom-4.
    <div
      className="fixed inset-x-0 bottom-[88px] z-40 px-4 min-[880px]:bottom-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-2xl"
        style={{
          pointerEvents: "auto",
          background: theme === "dark"
            ? "rgba(17,28,48,0.96)"
            : "rgba(15,23,42,0.96)",
          border: `1px solid ${theme === "dark" ? "#223047" : "#334155"}`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {items.map((row) => (
              <span
                key={row.product.id}
                className="relative grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-bold text-white shadow-md"
                style={{
                  backgroundColor: row.brand.logoColor ?? "#0ea5e9",
                  borderColor: theme === "dark" ? "#111c30" : "#0f172a",
                }}
                title={`${row.brand.name} — ${row.product.modelName}`}
              >
                {row.brand.name.charAt(0)}
                {/* Tiny X to remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(row.product.id);
                  }}
                  className="absolute -right-0.5 -top-0.5 grid h-4 w-4 cursor-pointer place-items-center rounded-full bg-red-500 text-[8px] text-white shadow transition hover:bg-red-400"
                  aria-label={`Remove ${row.product.modelName}`}
                >
                  <X size={8} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Label + action */}
        <div className="flex items-center gap-3">
          {count >= 2 ? (
            <button
              onClick={onOpenCompare}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "linear-gradient(135deg, #0891b2, #0284c7)" }}
            >
              Compare {count} products <ArrowRight size={15} />
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-300">
              Add {2 - count} more to compare
            </span>
          )}

          <button
            onClick={clearAll}
            className="cursor-pointer rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:text-white"
            aria-label="Clear compare list"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
