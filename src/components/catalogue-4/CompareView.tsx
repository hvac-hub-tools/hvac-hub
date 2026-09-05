/**
 * Side-by-Side Compare view — up to 4 products in a scrollable spec table.
 * Matches the dark card/table style from the screenshots.
 * Includes Export CSV + Clear All actions.
 */
import { ArrowLeft, Download, Trash2, X } from "lucide-react";
import { useCompare } from "./CompareContext";
import { num } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type ThemeMode } from "../../data/catalogueTheme";

type Props = {
  theme?: ThemeMode;
  onBack: () => void;
};

/** Specification row definition — label + getter function */
type SpecDef = {
  label: string;
  get: (r: ReturnType<typeof useCompare>["items"][number]) => string;
  highlight?: boolean;
};

const specRows: SpecDef[] = [
  { label: "Category", get: (r) => r.category.name },
  { label: "Country of Origin", get: (r) => `${r.country.flag} ${r.country.name}` },
  { label: "Product Type", get: (r) => r.product.productType ?? "—" },
  { label: "Series", get: (r) => r.product.series ?? "—" },

  // Capacity
  { label: "Capacity (TR)", get: (r) => num(r.product.capacityTon), highlight: true },
  { label: "Capacity (HP)", get: (r) => r.product.capacityHp ? num(r.product.capacityHp) + " HP" : "—" },
  { label: "Cooling (kW)", get: (r) => num(r.product.capacityKw) },
  { label: "Heating (kW)", get: (r) => num(r.product.heatingKw) },
  { label: "BTU/hr", get: (r) => num(r.product.btuHr, 0) },

  // Airflow
  { label: "Airflow (CFM)", get: (r) => r.product.airflowCfm ? num(r.product.airflowCfm, 0) + " CFM" : "—", highlight: true },

  // Electrical
  { label: "Power Input", get: (r) => r.product.powerInputW ? num(r.product.powerInputW, 0) + " W" : "—", highlight: true },
  { label: "Voltage / Supply", get: (r) => r.product.voltage ?? "—" },
  { label: "Running Current", get: (r) => num(r.product.runningCurrentA) + " A" },
  { label: "Max Current", get: (r) => num(r.product.maxCurrentA) + " A" },
  { label: "Power Factor", get: (r) => num(r.product.powerFactor) },
  { label: "MCB (Breaker)", get: (r) => num(r.product.breakerA) + " A" },

  // Refrigerant
  { label: "Refrigerant", get: (r) => r.product.refrigerant ?? "—", highlight: true },
  { label: "Refrigerant Charge", get: (r) => r.product.refrigerantChargeKg ? num(r.product.refrigerantChargeKg) + " kg" : "—" },

  // Piping
  { label: "Liquid Pipe (mm)", get: (r) => num(r.product.pipeLiquidMm) },
  { label: "Gas Pipe (mm)", get: (r) => num(r.product.pipeGasMm) },
  { label: "Max Pipe Length", get: (r) => r.product.pipeMaxM ? num(r.product.pipeMaxM, 0) + " m" : "—" },
  { label: "Max Height Diff.", get: (r) => r.product.pipeHeightM ? num(r.product.pipeHeightM, 0) + " m" : "—" },

  // Physical
  { label: "Indoor Weight", get: (r) => r.product.indoorWeightKg ? num(r.product.indoorWeightKg) + " kg" : "—" },
  { label: "Outdoor Weight", get: (r) => r.product.outdoorWeightKg ? num(r.product.outdoorWeightKg) + " kg" : "—" },
  { label: "Indoor Dimensions", get: (r) => r.product.indoorDimensions ?? "—" },
  { label: "Outdoor Dimensions", get: (r) => r.product.outdoorDimensions ?? "—" },
  { label: "Indoor Sound (dB)", get: (r) => r.product.soundLevelDb ? num(r.product.soundLevelDb, 0) + " dB" : "—" },
  { label: "Outdoor Sound (dB)", get: (r) => r.product.outdoorSoundDb ? num(r.product.outdoorSoundDb, 0) + " dB" : "—" },
  { label: "Color", get: (r) => r.product.color ?? "—" },

  // Performance
  { label: "Energy Rating", get: (r) => r.product.energyRating ? num(r.product.energyRating, 1) + " ★" : "—" },
  { label: "EER", get: (r) => num(r.product.eer) },
  { label: "COP", get: (r) => num(r.product.cop) },
  { label: "Operating Temp", get: (r) =>
    r.product.operatingTempMin != null && r.product.operatingTempMax != null
      ? `${r.product.operatingTempMin}°C to ${r.product.operatingTempMax}°C`
      : "—"
  },
  { label: "Warranty", get: (r) => r.product.warrantyYears ?? "—" },
  { label: "Price Range", get: (r) => r.product.priceRange ?? "—", highlight: true },
];

export default function CompareView({ theme = "light", onBack }: Props) {
  const { items, remove, clearAll, count } = useCompare();
  const p = getCataloguePalette(theme);

  // --- Flatten key specs from all products ---
  const allKeySpecKeys = Array.from(
    new Set(items.flatMap((r) => (r.product.keySpecs ? Object.keys(r.product.keySpecs) : []))),
  );

  const dynamicRows: SpecDef[] = allKeySpecKeys.map((key) => ({
    label: key,
    get: (r) => (r.product.keySpecs?.[key] != null ? String(r.product.keySpecs[key]) : "—"),
  }));

  const allRows = [...specRows, ...dynamicRows];

  // --- Filter out rows where ALL products have "—" ---
  const visibleRows = allRows.filter((row) =>
    items.some((item) => {
      const v = row.get(item);
      return v !== "—" && !v.startsWith("NaN");
    }),
  );

  // --- Export CSV ---
  function exportCSV() {
    const headers = ["Specification", ...items.map((r) => `${r.brand.name} ${r.product.modelName}`)];
    const csvRows = [headers.join(",")];
    for (const row of visibleRows) {
      const cells = [
        `"${row.label}"`,
        ...items.map((item) => `"${row.get(item).replace(/"/g, '""')}"`),
      ];
      csvRows.push(cells.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hvac-compare-${items.map((r) => r.product.modelName).join("-vs-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Highlight best values where numeric comparison is meaningful ---
  function getBestIdx(row: SpecDef): number | null {
    // Only highlight for numeric specs where "best" is obvious
    const nums = items.map((item) => {
      const raw = row.get(item).replace(/[^0-9.]/g, "");
      return raw ? parseFloat(raw) : null;
    });
    if (nums.every((n) => n == null)) return null;
    // For "Energy Rating", "EER", "COP" → higher is better
    // For "Sound", "Power Input", "Current" → lower is better
    const lowerBetter = /sound|power input|current|weight/i.test(row.label);
    let bestVal: number | null = null;
    let bestIdx: number | null = null;
    for (let i = 0; i < nums.length; i++) {
      const n = nums[i];
      if (n == null) continue;
      if (bestVal == null) {
        bestVal = n;
        bestIdx = i;
      } else if (lowerBetter ? n < bestVal : n > bestVal) {
        bestVal = n;
        bestIdx = i;
      }
    }
    // Only highlight if not all the same
    const unique = new Set(nums.filter((n) => n != null));
    if (unique.size <= 1) return null;
    return bestIdx;
  }

  return (
    <div className="min-h-screen px-4 pb-10 pt-4" style={{ background: p.pageBg }}>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full shadow-sm transition hover:scale-105 active:scale-95"
            style={{ background: p.cardBg, color: p.textPrimary, border: `1px solid ${p.cardBorder}` }}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: p.textPrimary }}>
              Side-by-Side Compare
            </h1>
            <p className="text-sm" style={{ color: p.textSecondary }}>
              Compare up to {4} products • Live specs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {count >= 2 && (
            <button
              onClick={exportCSV}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5"
              style={{
                background: p.cardBg,
                border: `1px solid ${p.cardBorder}`,
                color: p.textPrimary,
              }}
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          <button
            onClick={() => { clearAll(); onBack(); }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-400 shadow-sm transition hover:-translate-y-0.5"
            style={{
              background: p.cardBg,
              border: `1px solid ${p.cardBorder}`,
            }}
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {count < 2 ? (
        /* Empty / needs-more state */
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-12 text-center"
          style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
        >
          <div className="text-5xl">⚖️</div>
          <h2 className="mt-4 text-lg font-bold" style={{ color: p.textPrimary }}>
            {count === 0 ? "No products selected" : "Add one more product"}
          </h2>
          <p className="mt-2 max-w-sm text-sm" style={{ color: p.textSecondary }}>
            {count === 0
              ? "Go to the catalogue and tap \"+ Compare\" on at least 2 products to see them side-by-side."
              : "You need at least 2 products for comparison. Go back to the catalogue and add one more."}
          </p>
          <button
            onClick={onBack}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ background: p.accentGradient }}
          >
            ← Back to Catalogue
          </button>
        </div>
      ) : (
        /* The comparison table */
        <div
          className="overflow-hidden rounded-2xl shadow-lg"
          style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              {/* Product headers */}
              <thead>
                <tr style={{ borderBottom: `2px solid ${p.cardBorder}` }}>
                  <th
                    className="sticky left-0 z-10 px-4 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ background: p.cardBg, color: p.textMuted, minWidth: 140 }}
                  >
                    Specification
                  </th>
                  {items.map((row) => (
                    <th
                      key={row.product.id}
                      className="relative px-4 py-4 text-left"
                      style={{ minWidth: 160 }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold text-white shadow-md"
                          style={{ backgroundColor: row.brand.logoColor ?? "#0ea5e9" }}
                        >
                          {row.brand.name.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold" style={{ color: p.textPrimary }}>
                            {row.product.modelName}
                          </div>
                          <div className="truncate text-xs" style={{ color: p.accent }}>
                            {row.brand.name}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(row.product.id)}
                          aria-label="Remove"
                          className="shrink-0 cursor-pointer rounded-md p-1 transition hover:bg-red-500/20"
                          style={{ color: p.textMuted }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Spec rows */}
              <tbody>
                {visibleRows.map((row, idx) => {
                  const bestIdx = getBestIdx(row);
                  return (
                    <tr
                      key={row.label + idx}
                      style={{
                        borderBottom: `1px solid ${p.cardBorder}`,
                        background: idx % 2 === 0 ? "transparent" : p.cardBgSubtle,
                      }}
                    >
                      <td
                        className="sticky left-0 z-10 px-4 py-3 text-xs font-medium"
                        style={{
                          color: p.textSecondary,
                          background: idx % 2 === 0 ? p.cardBg : p.cardBgSubtle,
                        }}
                      >
                        {row.label}
                      </td>
                      {items.map((item, colIdx) => {
                        const val = row.get(item);
                        const isBest = bestIdx === colIdx;
                        const isNA = val === "—" || val.startsWith("NaN");
                        return (
                          <td
                            key={item.product.id}
                            className="px-4 py-3 text-sm font-semibold"
                            style={{
                              color: isNA
                                ? p.textMuted
                                : isBest
                                  ? "#34d399" // green highlight for best
                                  : row.highlight
                                    ? p.accent
                                    : p.textPrimary,
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
