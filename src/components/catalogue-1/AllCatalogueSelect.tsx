/**
 * All Catalogue — custom dropdown (replaces native <select>)
 *
 * Drop this file into: src/components/catalogue/AllCatalogueSelect.tsx
 *
 * WHY THIS EXISTS:
 * Native <select>/<option> popups are rendered by the OS/browser, not by our
 * CSS. On some Windows/Chromium combinations the option list ignores the
 * text `color` we set and only shows text on the hovered row (OS applies its
 * own highlight there). This component renders the whole dropdown ourselves
 * (a plain absolutely-positioned panel), so every colour comes from our own
 * theme palette and is guaranteed to render correctly in light + dark mode.
 */
import { useEffect, useRef, useState } from "react";
import type { CataloguePalette } from "../../data/catalogueTheme";

export type SelectOption = { value: string; label: string };
export type SelectGroup = { label?: string; options: SelectOption[] };

type Props = {
  value: string;
  onChange: (value: string) => void;
  groups: SelectGroup[];
  palette: CataloguePalette;
  placeholder?: string;
  /** Accessible label, e.g. "Brand" — used for aria-label only. */
  ariaLabel?: string;
};

export default function AllCatalogueSelect({
  value,
  onChange,
  groups,
  palette: p,
  placeholder = "Select…",
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape — same behaviour users expect from a select.
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectedLabel =
    groups.flatMap((g) => g.options).find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm outline-none transition"
        style={{
          background: p.inputBg,
          border: `1px solid ${open ? p.accent : p.cardBorder}`,
          color: p.textPrimary,
          boxShadow: open ? `0 0 0 3px ${p.chipActiveBg}` : "none",
        }}
      >
        <span className="truncate">{selectedLabel}</span>
        <span
          aria-hidden
          className="shrink-0 text-[10px] transition-transform duration-150"
          style={{
            color: p.textSecondary,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl py-1.5 shadow-2xl"
          style={{
            background: p.cardBg,
            border: `1px solid ${p.cardBorder}`,
          }}
        >
          {groups.map((group, gi) => {
            if (group.options.length === 0) return null;
            return (
              <div key={gi}>
                {group.label ? (
                  <div
                    className="sticky top-0 px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: p.textMuted, background: p.cardBg }}
                  >
                    {group.label}
                  </div>
                ) : null}
                {group.options.map((opt) => {
                  const isSelected = opt.value === value;
                  const isHovered = hovered === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHovered(opt.value)}
                      onMouseLeave={() => setHovered((h) => (h === opt.value ? null : h))}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className="block w-full cursor-pointer truncate px-3 py-2 text-left text-sm transition"
                      style={{
                        background: isSelected
                          ? p.chipActiveBg
                          : isHovered
                            ? p.cardBgSubtle
                            : "transparent",
                        color: isSelected ? p.chipActiveText : p.textPrimary,
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
