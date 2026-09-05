/**
 * Side-by-Side Compare view — up to 4 products in a grouped spec table.
 *
 * The table (and its export) follow the numbered-section format used in
 * professional client proposals:
 *   1. General & Model Information
 *   2. Capacity & Performance
 *   3. Electrical Specifications
 *   4. Refrigerant & Piping Details
 *   5. Physical Dimensions & Weight
 *   6. Acoustics, Features & Warranty
 *
 * "Export Excel" downloads a styled .xls (HTML-table) that opens in Excel /
 * Google Sheets with the exact same navy section bars + striped rows.
 */
import { Fragment } from "react";
import { ArrowLeft, Download, Trash2, X } from "lucide-react";
import { useCompare } from "./CompareContext";
import { num, type CatalogueRow } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type ThemeMode } from "../../data/catalogueTheme";

type Props = {
  theme?: ThemeMode;
  onBack: () => void;
};

type SpecDef = {
  label: string;
  get: (r: CatalogueRow) => string;
};
type Section = { title: string; rows: SpecDef[] };

// ── Helpers ────────────────────────────────────────────────────────────────
const mmToInch = (mm: number | null | undefined): string => {
  if (mm == null) return "";
  const eighths = Math.round((mm / 25.4) * 8);
  if (eighths <= 0) return "";
  const whole = Math.floor(eighths / 8);
  const rem = eighths % 8;
  const fracMap: Record<number, string> = { 1: '1/8"', 2: '1/4"', 3: '3/8"', 4: '1/2"', 5: '5/8"', 6: '3/4"', 7: '7/8"' };
  const frac = rem === 0 ? "" : fracMap[rem];
  const label = whole > 0 ? (frac ? `${whole}-${frac}` : `${whole}"`) : frac;
  return label ? ` (${label})` : "";
};

const stars = (r: number) => `${Math.round(r)} Star ${"★".repeat(Math.round(r))}`;

const pipe = (mm: number | null | undefined) =>
  mm != null ? `${num(mm)} mm${mmToInch(mm)}` : "—";

// ── Section definitions (mirrors the proposal sheet format) ────────────────
const SECTIONS: Section[] = [
  {
    title: "1. General & Model Information",
    rows: [
      { label: "Brand", get: (r) => r.brand.name },
      { label: "Series", get: (r) => r.product.series ?? "—" },
      { label: "Category", get: (r) => r.category.name },
      { label: "Product Type", get: (r) => r.product.productType ?? "—" },
      { label: "Country of Origin", get: (r) => `${r.country.name} (${r.country.code.toUpperCase()})` },
      { label: "Color", get: (r) => r.product.color ?? "—" },
    ],
  },
  {
    title: "2. Capacity & Performance",
    rows: [
      { label: "Capacity (TR)", get: (r) => r.product.capacityTon ? num(r.product.capacityTon) + " TR" : "—" },
      { label: "Horsepower (HP)", get: (r) => r.product.capacityHp ? num(r.product.capacityHp) + " HP" : "—" },
      { label: "Nominal Cooling Capacity (kW)", get: (r) => r.product.capacityKw ? num(r.product.capacityKw) + " kW" : "—" },
      { label: "Heating Capacity (kW)", get: (r) => r.product.heatingKw ? num(r.product.heatingKw) + " kW" : "—" },
      { label: "Cooling Capacity (BTU/hr)", get: (r) => r.product.btuHr ? num(r.product.btuHr, 0) + " BTU/hr" : "—" },
      { label: "Airflow (CFM)", get: (r) => r.product.airflowCfm ? num(r.product.airflowCfm, 0) + " CFM" : "—" },
      { label: "Energy Rating", get: (r) => r.product.energyRating ? stars(r.product.energyRating) : "—" },
      { label: "EER", get: (r) => num(r.product.eer) },
      { label: "COP", get: (r) => num(r.product.cop) },
      {
        label: "Operating Temp Range",
        get: (r) =>
          r.product.operatingTempMin != null && r.product.operatingTempMax != null
            ? `${r.product.operatingTempMin}°C to ${r.product.operatingTempMax}°C`
            : "—",
      },
    ],
  },
  {
    title: "3. Electrical Specifications",
    rows: [
      { label: "Power Input", get: (r) => r.product.powerInputW ? num(r.product.powerInputW, 0) + " W" : "—" },
      { label: "Voltage / Supply", get: (r) => r.product.voltage ?? "—" },
      { label: "Running Current", get: (r) => r.product.runningCurrentA != null ? num(r.product.runningCurrentA, 2) + " A" : "—" },
      { label: "Max Current", get: (r) => r.product.maxCurrentA != null ? num(r.product.maxCurrentA, 2) + " A" : "—" },
      { label: "Power Factor", get: (r) => num(r.product.powerFactor, 2) },
      { label: "MCB / Breaker Rating", get: (r) => r.product.breakerA ? num(r.product.breakerA, 0) + " A" : "—" },
    ],
  },
  {
    title: "4. Refrigerant & Piping Details",
    rows: [
      { label: "Refrigerant Type", get: (r) => r.product.refrigerant ?? "—" },
      { label: "Refrigerant Charge", get: (r) => r.product.refrigerantChargeKg ? num(r.product.refrigerantChargeKg, 2) + " kg" : "—" },
      { label: "Liquid Pipe Diameter", get: (r) => pipe(r.product.pipeLiquidMm) },
      { label: "Gas Pipe Diameter", get: (r) => pipe(r.product.pipeGasMm) },
      { label: "Max Pipe Length", get: (r) => r.product.pipeMaxM ? num(r.product.pipeMaxM, 0) + " m" : "—" },
      { label: "Max Height Difference", get: (r) => r.product.pipeHeightM ? num(r.product.pipeHeightM, 0) + " m" : "—" },
    ],
  },
  {
    title: "5. Physical Dimensions & Weight",
    rows: [
      { label: "Indoor Unit Dimensions (W x H x D)", get: (r) => r.product.indoorDimensions ?? "—" },
      { label: "Outdoor Unit Dimensions (W x H x D)", get: (r) => r.product.outdoorDimensions ?? "—" },
      { label: "Indoor Unit Net Weight", get: (r) => r.product.indoorWeightKg ? num(r.product.indoorWeightKg, 2) + " kg" : "—" },
      { label: "Outdoor Unit Net Weight", get: (r) => r.product.outdoorWeightKg ? num(r.product.outdoorWeightKg, 2) + " kg" : "—" },
    ],
  },
  {
    title: "6. Acoustics, Features & Warranty",
    rows: [
      { label: "Indoor Sound Level", get: (r) => r.product.soundLevelDb ? num(r.product.soundLevelDb, 0) + " dB" : "—" },
      { label: "Outdoor Sound Level", get: (r) => r.product.outdoorSoundDb ? num(r.product.outdoorSoundDb, 0) + " dB" : "—" },
      { label: "Warranty Terms", get: (r) => r.product.warrantyYears ?? "—" },
      { label: "Price Range", get: (r) => r.product.priceRange ?? "—" },
    ],
  },
];

// Numeric "best value" detection (green highlight) for comparable rows
const LOWER_BETTER = /sound|power input|current|weight/i;
function getBestIdx(row: SpecDef, items: CatalogueRow[]): number | null {
  const nums = items.map((item) => {
    const raw = row.get(item).replace(/[^0-9.]/g, "");
    return raw ? parseFloat(raw) : null;
  });
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length < 2 || new Set(valid).size < 2) return null;
  const lower = LOWER_BETTER.test(row.label);
  let best = -1;
  let bestVal = Infinity;
  nums.forEach((n, i) => {
    if (n == null) return;
    const target = lower ? n : -n;
    if (target < bestVal) { bestVal = target; best = i; }
  });
  return best;
}

export default function CompareView({ theme = "light", onBack }: Props) {
  const { items, remove, clearAll, count, max } = useCompare();
  const p = getCataloguePalette(theme);

  // Extra manufacturer specs (from keySpecs) become section 7 when present
  const keySpecKeys = Array.from(
    new Set(items.flatMap((r) => (r.product.keySpecs ? Object.keys(r.product.keySpecs!) : []))),
  );
  const sections: Section[] = keySpecKeys.length
    ? [
        ...SECTIONS,
        {
          title: "7. Additional Specifications",
          rows: keySpecKeys.map((k) => ({
            label: k,
            get: (r: CatalogueRow) =>
              r.product.keySpecs?.[k] != null ? String(r.product.keySpecs![k]) : "—",
          })),
        },
      ]
    : SECTIONS;

  const isNA = (v: string) => v === "—" || v.startsWith("NaN");

  // ── Export styled Excel sheet (.xls) matching the proposal format ────────
  function exportExcel() {
    const NAVY = "#1F3864";
    const STRIPE = "#F2F7FB";
    const BORDER = "#9EB3CC";
    const cols = items.length + 1;
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const sameBrand = items.every((r) => r.brand.id === items[0].brand.id);
    const title = sameBrand
      ? `${items[0].brand.name.toUpperCase()} - TECHNICAL COMPARISON SPECIFICATION`
      : "HVAC EQUIPMENT - TECHNICAL COMPARISON SPECIFICATION";

    let html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">` +
      `<head><meta charset="UTF-8">` +
      `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>` +
      `<x:Name>Comparison</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>` +
      `</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->` +
      `</head><body><table border="1" cellspacing="0" cellpadding="0" ` +
      `style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11px;">`;

    // Title + subtitle bars
    html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-size:15px;font-weight:bold;text-align:center;padding:10px 8px;border:1px solid ${NAVY};">${esc(title)}</td></tr>`;
    html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-size:10px;font-style:italic;text-align:center;padding:4px 8px;border:1px solid ${NAVY};">Client Proposal &amp; Equipment Data Sheet&nbsp;&nbsp;|&nbsp;&nbsp;Prepared for Commercial Review</td></tr>`;

    // Column headers
    html += `<tr><td style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:8px;text-align:center;border:1px solid ${BORDER};width:230px;">Specification Parameter</td>`;
    for (const r of items) {
      const cap =
        r.product.capacityTon != null ? `${num(r.product.capacityTon)} TR`
        : r.product.capacityHp != null ? `${num(r.product.capacityHp)} HP`
        : r.product.airflowCfm != null ? `${num(r.product.airflowCfm, 0)} CFM`
        : r.product.heatingKw != null ? `${num(r.product.heatingKw)} kW` : "";
      html += `<td style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:8px;text-align:center;border:1px solid ${BORDER};width:180px;">${esc(r.brand.name)} ${esc(r.product.modelName)}${cap ? `<br/>(${esc(cap)})` : ""}</td>`;
    }
    html += `</tr>`;

    // Sections
    for (const sec of sections) {
      const visible = sec.rows.filter((row) => items.some((it) => !isNA(row.get(it))));
      if (visible.length === 0) continue;
      html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:5px 8px;border:1px solid ${BORDER};">${esc(sec.title)}</td></tr>`;
      visible.forEach((row, i) => {
        const bg = i % 2 === 0 ? STRIPE : "#FFFFFF";
        html += `<tr><td style="background:${bg};font-weight:bold;padding:5px 8px;border:1px solid ${BORDER};">${esc(row.label)}</td>`;
        for (const it of items) {
          html += `<td style="background:${bg};padding:5px 8px;text-align:center;border:1px solid ${BORDER};">${esc(row.get(it))}</td>`;
        }
        html += `</tr>`;
      });
    }

    html += `</table></body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = items.map((r) => r.product.modelName.replace(/\s+/g, "-")).join("_vs_");
    a.href = url;
    a.download = `HVAC_Comparison_${slug}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Section bar colors per theme (navy in light, tinted cyan in dark)
  const sectionBg = p.isDark ? "rgba(45,212,191,0.10)" : "#1F3864";
  const sectionFg = p.isDark ? p.accent : "#ffffff";

  return (
    <div className="min-h-screen px-4 pb-24 pt-4" style={{ background: p.pageBg }}>
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
              Compare up to {max} products • Live specs
            </p>
          </div>
        </div>
        {count >= 2 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}`, color: p.textPrimary }}
            >
              <Download size={14} /> Export Excel
            </button>
            <button
              onClick={() => { clearAll(); onBack(); }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-400 shadow-sm transition hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      {count < 2 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-12 text-center"
          style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
        >
          <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: p.accentGradient }}>
            <Download size={26} className="text-white" />
          </div>
          <h2 className="mt-4 text-lg font-bold" style={{ color: p.textPrimary }}>
            {count === 0 ? "No products selected" : "Add one more product"}
          </h2>
          <p className="mt-2 max-w-sm text-sm" style={{ color: p.textSecondary }}>
            {count === 0
              ? "Catalogue me jaake product cards pe \"+ Compare\" tap karo — 2 se 4 products select karke yahan side-by-side dekho."
              : "Comparison ke liye kam se kam 2 products chahiye. Catalogue me jaake ek aur add karo."}
          </p>
          <button
            onClick={onBack}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
            style={{ background: p.accentGradient }}
          >
            <ArrowLeft size={15} /> Back to Catalogue
          </button>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl shadow-lg"
          style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              {/* Product header row */}
              <thead>
                <tr style={{ borderBottom: `2px solid ${p.cardBorder}` }}>
                  <th
                    className="sticky left-0 z-10 px-4 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ background: p.cardBg, color: p.textMuted, minWidth: 190 }}
                  >
                    Specification Parameter
                  </th>
                  {items.map((row) => (
                    <th key={row.product.id} className="px-4 py-4 text-left" style={{ minWidth: 170 }}>
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

              <tbody>
                {sections.map((sec) => {
                  const visible = sec.rows.filter((row) => items.some((it) => !isNA(row.get(it))));
                  if (visible.length === 0) return null;
                  return (
                    <Fragment key={sec.title}>
                      {/* Numbered section bar */}
                      <tr>
                        <td
                          colSpan={items.length + 1}
                          className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                          style={{ background: sectionBg, color: sectionFg }}
                        >
                          {sec.title}
                        </td>
                      </tr>
                      {visible.map((row, idx) => {
                        const bestIdx = getBestIdx(row, items);
                        const stripe = idx % 2 === 0 ? "transparent" : p.cardBgSubtle;
                        return (
                          <tr key={row.label} style={{ borderBottom: `1px solid ${p.cardBorder}`, background: stripe }}>
                            <td
                              className="sticky left-0 z-10 px-4 py-2.5 text-xs font-semibold"
                              style={{
                                color: p.textSecondary,
                                background: idx % 2 === 0 ? p.cardBg : p.cardBgSubtle,
                              }}
                            >
                              {row.label}
                            </td>
                            {items.map((item, colIdx) => {
                              const val = row.get(item);
                              const na = isNA(val);
                              return (
                                <td
                                  key={item.product.id}
                                  className="px-4 py-2.5 text-center text-[13px] font-semibold"
                                  style={{
                                    color: na ? p.textMuted : bestIdx === colIdx ? "#10b981" : p.textPrimary,
                                  }}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </Fragment>
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
