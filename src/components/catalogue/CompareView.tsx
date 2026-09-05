/**
 * Side-by-Side Compare view — up to 4 products in a grouped spec table.
 *
 * Export strategy (same proven pattern as the ESP tool):
 *  • Web / PC  → styled HTML table saved as .xls (opens formatted in Excel)
 *  • Android   → real styled .xlsx via xlsx-js-style, written to the app cache
 *                with @capacitor/filesystem and handed to the OS share sheet
 *                via @capacitor/share — because <a download> silently fails
 *                inside a Capacitor WebView.
 */
import { Fragment, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Loader2, Trash2, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import * as XLSX from "xlsx-js-style";
import { useCompare } from "./CompareContext";
import { num, type CatalogueRow } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type ThemeMode } from "../../data/catalogueTheme";

type Props = {
  theme?: ThemeMode;
  onBack: () => void;
};

type SpecDef = { label: string; get: (r: CatalogueRow) => string };
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
const pipe = (mm: number | null | undefined) => (mm != null ? `${num(mm)} mm${mmToInch(mm)}` : "—");

// ── Section definitions (proposal-sheet format) ────────────────────────────
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
      { label: "Capacity (TR)", get: (r) => (r.product.capacityTon ? num(r.product.capacityTon) + " TR" : "—") },
      { label: "Horsepower (HP)", get: (r) => (r.product.capacityHp ? num(r.product.capacityHp) + " HP" : "—") },
      { label: "Nominal Cooling Capacity (kW)", get: (r) => (r.product.capacityKw ? num(r.product.capacityKw) + " kW" : "—") },
      { label: "Heating Capacity (kW)", get: (r) => (r.product.heatingKw ? num(r.product.heatingKw) + " kW" : "—") },
      { label: "Cooling Capacity (BTU/hr)", get: (r) => (r.product.btuHr ? num(r.product.btuHr, 0) + " BTU/hr" : "—") },
      { label: "Airflow (CFM)", get: (r) => (r.product.airflowCfm ? num(r.product.airflowCfm, 0) + " CFM" : "—") },
      { label: "Energy Rating", get: (r) => (r.product.energyRating ? stars(r.product.energyRating) : "—") },
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
      { label: "Power Input", get: (r) => (r.product.powerInputW ? num(r.product.powerInputW, 0) + " W" : "—") },
      { label: "Voltage / Supply", get: (r) => r.product.voltage ?? "—" },
      { label: "Running Current", get: (r) => (r.product.runningCurrentA != null ? num(r.product.runningCurrentA, 2) + " A" : "—") },
      { label: "Max Current", get: (r) => (r.product.maxCurrentA != null ? num(r.product.maxCurrentA, 2) + " A" : "—") },
      { label: "Power Factor", get: (r) => num(r.product.powerFactor, 2) },
      { label: "MCB / Breaker Rating", get: (r) => (r.product.breakerA ? num(r.product.breakerA, 0) + " A" : "—") },
    ],
  },
  {
    title: "4. Refrigerant & Piping Details",
    rows: [
      { label: "Refrigerant Type", get: (r) => r.product.refrigerant ?? "—" },
      { label: "Refrigerant Charge", get: (r) => (r.product.refrigerantChargeKg ? num(r.product.refrigerantChargeKg, 2) + " kg" : "—") },
      { label: "Liquid Pipe Diameter", get: (r) => pipe(r.product.pipeLiquidMm) },
      { label: "Gas Pipe Diameter", get: (r) => pipe(r.product.pipeGasMm) },
      { label: "Max Pipe Length", get: (r) => (r.product.pipeMaxM ? num(r.product.pipeMaxM, 0) + " m" : "—") },
      { label: "Max Height Difference", get: (r) => (r.product.pipeHeightM ? num(r.product.pipeHeightM, 0) + " m" : "—") },
    ],
  },
  {
    title: "5. Physical Dimensions & Weight",
    rows: [
      { label: "Indoor Unit Dimensions (W x H x D)", get: (r) => r.product.indoorDimensions ?? "—" },
      { label: "Outdoor Unit Dimensions (W x H x D)", get: (r) => r.product.outdoorDimensions ?? "—" },
      { label: "Indoor Unit Net Weight", get: (r) => (r.product.indoorWeightKg ? num(r.product.indoorWeightKg, 2) + " kg" : "—") },
      { label: "Outdoor Unit Net Weight", get: (r) => (r.product.outdoorWeightKg ? num(r.product.outdoorWeightKg, 2) + " kg" : "—") },
    ],
  },
  {
    title: "6. Acoustics, Features & Warranty",
    rows: [
      { label: "Indoor Sound Level", get: (r) => (r.product.soundLevelDb ? num(r.product.soundLevelDb, 0) + " dB" : "—") },
      { label: "Outdoor Sound Level", get: (r) => (r.product.outdoorSoundDb ? num(r.product.outdoorSoundDb, 0) + " dB" : "—") },
      { label: "Warranty Terms", get: (r) => r.product.warrantyYears ?? "—" },
      { label: "Price Range", get: (r) => r.product.priceRange ?? "—" },
    ],
  },
];

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

// Shared sheet styling constants
const NAVY = "1F3864";
const STRIPE = "F2F7FB";
const BORDERC = "9EB3CC";

export default function CompareView({ theme = "light", onBack }: Props) {
  const { items, remove, clearAll, count, max } = useCompare();
  const p = getCataloguePalette(theme);

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
            get: (r: CatalogueRow) => (r.product.keySpecs?.[k] != null ? String(r.product.keySpecs![k]) : "—"),
          })),
        },
      ]
    : SECTIONS;

  const isNA = (v: string) => v === "—" || v.startsWith("NaN");
  const visibleSections = sections
    .map((sec) => ({ ...sec, rows: sec.rows.filter((row) => items.some((it) => !isNA(row.get(it)))) }))
    .filter((sec) => sec.rows.length > 0);

  const sameBrand = items.length > 0 && items.every((r) => r.brand.id === items[0].brand.id);
  const sheetTitle = sameBrand
    ? `${items[0].brand.name.toUpperCase()} - TECHNICAL COMPARISON SPECIFICATION`
    : "HVAC EQUIPMENT - TECHNICAL COMPARISON SPECIFICATION";
  const capOf = (r: CatalogueRow) =>
    r.product.capacityTon != null ? `${num(r.product.capacityTon)} TR`
    : r.product.capacityHp != null ? `${num(r.product.capacityHp)} HP`
    : r.product.airflowCfm != null ? `${num(r.product.airflowCfm, 0)} CFM`
    : r.product.heatingKw != null ? `${num(r.product.heatingKw)} kW` : "";

  // Clean, professional filename — strip the "(4 HP / 3.8 TR)" capacity suffix
  // from model names and any character that breaks Android's share sheet,
  // then append the sheet type. e.g.
  //   "Blue_Star_IA-MO4HP_vs_Daikin_RXQ8_Technical_Specification_Sheet.xlsx"
  const safeName = (s: string) =>
    s.replace(/[^A-Za-z0-9]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  const fileBase =
    safeName(
      items
        .map((r) => `${r.brand.name} ${r.product.modelName.replace(/\([^)]*\)/g, "")}`)
        .join(" vs "),
    ) || "HVAC";
  const friendlyName = fileBase.replace(/_/g, " ");

  // ── Web builder: styled HTML table → .xls ────────────────────────────────
  function buildExcelHtml(): string {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cols = items.length + 1;
    let html =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">` +
      `<head><meta charset="UTF-8">` +
      `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>` +
      `<x:Name>Comparison</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>` +
      `</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->` +
      `</head><body><table border="1" cellspacing="0" cellpadding="0" ` +
      `style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11px;">`;

    html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-size:15px;font-weight:bold;text-align:center;padding:10px 8px;border:1px solid ${NAVY};">${esc(sheetTitle)}</td></tr>`;
    html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-size:10px;font-style:italic;text-align:center;padding:4px 8px;border:1px solid ${NAVY};">Client Proposal &amp; Equipment Data Sheet&nbsp;&nbsp;|&nbsp;&nbsp;Prepared for Commercial Review</td></tr>`;
    html += `<tr><td style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:8px;text-align:center;border:1px solid ${BORDERC};width:230px;">Specification Parameter</td>`;
    for (const r of items) {
      const cap = capOf(r);
      html += `<td style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:8px;text-align:center;border:1px solid ${BORDERC};width:180px;">${esc(r.brand.name)} ${esc(r.product.modelName)}${cap ? `<br/>(${esc(cap)})` : ""}</td>`;
    }
    html += `</tr>`;

    for (const sec of visibleSections) {
      html += `<tr><td colspan="${cols}" style="background:${NAVY};color:#FFFFFF;font-weight:bold;padding:5px 8px;border:1px solid ${BORDERC};">${esc(sec.title)}</td></tr>`;
      sec.rows.forEach((row, i) => {
        const bg = i % 2 === 0 ? STRIPE : "#FFFFFF";
        html += `<tr><td style="background:${bg};font-weight:bold;padding:5px 8px;border:1px solid ${BORDERC};">${esc(row.label)}</td>`;
        for (const it of items) html += `<td style="background:${bg};padding:5px 8px;text-align:center;border:1px solid ${BORDERC};">${esc(row.get(it))}</td>`;
        html += `</tr>`;
      });
    }
    return html + `</table></body></html>`;
  }

  // ── Native builder: real styled .xlsx workbook ───────────────────────────
  function buildComparisonXlsx() {
    const b = {
      top: { style: "thin", color: { rgb: BORDERC } },
      bottom: { style: "thin", color: { rgb: BORDERC } },
      left: { style: "thin", color: { rgb: BORDERC } },
      right: { style: "thin", color: { rgb: BORDERC } },
    };
    const S = {
      title: { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 15, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: NAVY } }, alignment: { horizontal: "center", vertical: "center" } },
      subtitle: { font: { italic: true, color: { rgb: "FFFFFF" }, sz: 10, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: NAVY } }, alignment: { horizontal: "center", vertical: "center" } },
      header: { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: NAVY } }, border: b, alignment: { horizontal: "center", vertical: "center", wrapText: true } },
      section: { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: NAVY } }, border: b, alignment: { horizontal: "left", vertical: "center" } },
    };
    const labelS = (stripe: boolean) => ({ font: { bold: true, sz: 11, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: stripe ? STRIPE : "FFFFFF" } }, border: b, alignment: { horizontal: "left", vertical: "center" } });
    const valueS = (stripe: boolean) => ({ font: { sz: 11, name: "Calibri" }, fill: { patternType: "solid", fgColor: { rgb: stripe ? STRIPE : "FFFFFF" } }, border: b, alignment: { horizontal: "center", vertical: "center", wrapText: true } });

    const C = (v: string | number, s: any) => ({ v, s, t: typeof v === "number" ? "n" : "s" });
    const E = (s: any) => C("", s);
    const cols = items.length + 1;
    const rows: any[][] = [];
    const merges: any[] = [];
    const rowH: any[] = [];
    const mergeRow = (r: number) => merges.push({ s: { r, c: 0 }, e: { r, c: cols - 1 } });

    rows.push([C(sheetTitle, S.title), ...Array(cols - 1).fill(null).map(() => E(S.title))]);
    mergeRow(0); rowH.push({ hpt: 30 });
    rows.push([C("Client Proposal & Equipment Data Sheet  |  Prepared for Commercial Review", S.subtitle), ...Array(cols - 1).fill(null).map(() => E(S.subtitle))]);
    mergeRow(1); rowH.push({ hpt: 18 });

    rows.push([
      C("Specification Parameter", S.header),
      ...items.map((r) => {
        const cap = capOf(r);
        return C(`${r.brand.name} ${r.product.modelName}${cap ? ` (${cap})` : ""}`, S.header);
      }),
    ]);
    rowH.push({ hpt: 34 });

    let r = 3;
    for (const sec of visibleSections) {
      rows.push([C(sec.title, S.section), ...Array(cols - 1).fill(null).map(() => E(S.section))]);
      mergeRow(r); rowH.push({ hpt: 20 }); r++;
      sec.rows.forEach((row, i) => {
        const stripe = i % 2 === 0;
        rows.push([C(row.label, labelS(stripe)), ...items.map((it) => C(row.get(it), valueS(stripe)))]);
        rowH.push({ hpt: 18 }); r++;
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(rows.map((row) => row.map((c) => c.v)));
    rows.forEach((row, ri) =>
      row.forEach((cell, ci) => {
        const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
        if (!ws[addr]) ws[addr] = {};
        ws[addr].v = cell.v;
        ws[addr].t = cell.t;
        if (cell.s) ws[addr].s = cell.s;
      }),
    );
    ws["!merges"] = merges;
    ws["!cols"] = [{ wch: 34 }, ...items.map(() => ({ wch: 26 }))];
    ws["!rows"] = rowH;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comparison");
    return wb;
  }

  // ── Export dispatcher — web vs native ────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    setExportMsg(null);
    try {
      if (Capacitor.isNativePlatform()) {
        // ANDROID — real .xlsx into cache, then OS share sheet (Save / Drive / WhatsApp…)
        const wb = buildComparisonXlsx();
        const fileName = `${fileBase}_Technical_Specification_Sheet.xlsx`;
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
        await Filesystem.writeFile({ path: fileName, data: wbout, directory: Directory.Cache, recursive: true });
        const { uri } = await Filesystem.getUri({ directory: Directory.Cache, path: fileName });
        await Share.share({
          title: sheetTitle,
          text: fileName,
          url: uri,
          dialogTitle: "Save or share the comparison sheet",
        });
        const short = friendlyName.length > 44 ? friendlyName.slice(0, 44) + "…" : friendlyName;
        setExportMsg({ ok: true, text: `${short} — Technical Specification Sheet ready. Select an option from the share menu to save or send..` });
      } else {
        // WEB / PC — styled HTML .xls blob download
        const html = buildExcelHtml();
        const fileName = `${fileBase}_Technical_Specification_Sheet.xls`;
        const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        const short = friendlyName.length > 44 ? friendlyName.slice(0, 44) + "…" : friendlyName;
        setExportMsg({ ok: true, text: `${short} — Technical Specification Sheet download ho rahi hai.` });
      }
    } catch (err: any) {
      // Share sheet dismiss sometimes throws — not a real failure
      if (!/cancel/i.test(String(err?.message ?? ""))) {
        setExportMsg({ ok: false, text: `Export fail: ${err?.message ?? "unknown error"}` });
      }
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(null), 5000);
    }
  }

  const sectionBg = p.isDark ? "rgba(45,212,191,0.10)" : "#1F3864";
  const sectionFg = p.isDark ? p.accent : "#ffffff";

  return (
    <div className="min-h-screen px-4 pb-24 pt-4" style={{ background: p.pageBg }}>
      {/* Export status toast */}
      {exportMsg && (
        <div className="fixed inset-x-0 bottom-[150px] z-[2300] flex justify-center px-4 min-[880px]:bottom-8">
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl"
            style={{
              background: exportMsg.ok ? (p.isDark ? "#052e16" : "#dcfce7") : (p.isDark ? "#2d0a0a" : "#fee2e2"),
              border: `1px solid ${exportMsg.ok ? "#16a34a" : "#ef4444"}`,
              color: exportMsg.ok ? "#16a34a" : "#ef4444",
              animation: "catSheetUp 0.25s cubic-bezier(0.175,0.885,0.32,1.1)",
            }}
          >
            {exportMsg.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {exportMsg.text}
          </div>
        </div>
      )}

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
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
              style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}`, color: p.textPrimary }}
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Generating…" : "Export Excel"}
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
                {visibleSections.map((sec) => (
                  <Fragment key={sec.title}>
                    <tr>
                      <td
                        colSpan={items.length + 1}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: sectionBg, color: sectionFg }}
                      >
                        {sec.title}
                      </td>
                    </tr>
                    {sec.rows.map((row, idx) => {
                      const bestIdx = getBestIdx(row, items);
                      const stripe = idx % 2 === 0 ? "transparent" : p.cardBgSubtle;
                      return (
                        <tr key={row.label} style={{ borderBottom: `1px solid ${p.cardBorder}`, background: stripe }}>
                          <td
                            className="sticky left-0 z-10 px-4 py-2.5 text-xs font-semibold"
                            style={{ color: p.textSecondary, background: idx % 2 === 0 ? p.cardBg : p.cardBgSubtle }}
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
                                style={{ color: na ? p.textMuted : bestIdx === colIdx ? "#10b981" : p.textPrimary }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
