import { useEffect, type ComponentType } from "react";
import {
  ClipboardList,
  Droplets,
  Gauge,
  Ruler,
  Scale,
  Star,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Product, Brand, Country, ProductCategory } from "../../data/allCatalogueTypes";
import { num } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type ThemeMode } from "../../data/catalogueTheme";

type Props = {
  product: Product;
  brand: Brand;
  country: Country;
  category: ProductCategory;
  onClose: () => void;
  theme?: ThemeMode;
};

type SpecRow = { label: string; value: string; highlight?: boolean };

export default function AllCatalogueDetailModal({
  product,
  brand,
  country,
  category,
  onClose,
  theme = "light",
}: Props) {
  const p = getCataloguePalette(theme);

  // Lock page scroll while the sheet is open (prevents the page behind from
  // scrolling and keeps the sheet from being visually "cut" on mobile).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const keySpecRows: SpecRow[] =
    product.keySpecs && typeof product.keySpecs === "object"
      ? Object.entries(product.keySpecs).map(([k, v]) => ({ label: k, value: String(v) }))
      : [];

  const groups: Array<{ title: string; icon: LucideIcon; rows: SpecRow[] }> = [
    {
      title: "Capacity & Selection",
      icon: Gauge,
      rows: [
        {
          label: "Selected By",
          value:
            product.selectBy === "HP"
              ? "Horsepower (HP)"
              : product.selectBy === "CFM"
                ? "Airflow (CFM)"
                : product.selectBy === "KW"
                  ? "Heating (kW)"
                  : product.selectBy === "MODEL"
                    ? "Model / Type"
                    : "Tonnage (TR)",
          highlight: true,
        },
        {
          label: "Horsepower (HP)",
          value: product.capacityHp ? num(product.capacityHp) + " HP" : "—",
          highlight: product.selectBy === "HP",
        },
        {
          label: "Capacity (TR)",
          value: num(product.capacityTon),
          highlight: product.selectBy === "TR" || product.selectBy == null,
        },
        { label: "Cooling (kW)", value: num(product.capacityKw) },
        {
          label: "Heating (kW)",
          value: num(product.heatingKw),
          highlight: product.selectBy === "KW",
        },
        { label: "BTU/hr", value: num(product.btuHr, 0) },
      ],
    },
    {
      title: "Airflow",
      icon: Wind,
      rows: [
        {
          label: "Rated CFM",
          value: product.airflowCfm ? num(product.airflowCfm, 0) + " CFM" : "—",
          highlight: product.selectBy === "CFM",
        },
        ...(Array.isArray(product.airflowLevels)
          ? product.airflowLevels.map((lvl) => ({
              label: `Fan — ${lvl.label}`,
              value: `${lvl.cfm} CFM`,
            }))
          : []),
      ],
    },
    {
      title: "Electrical Load",
      icon: Zap,
      rows: [
        { label: "Power Input", value: num(product.powerInputW, 0) + " W", highlight: true },
        { label: "Voltage / Supply", value: product.voltage ?? "—" },
        { label: "Running Current", value: num(product.runningCurrentA) + " A" },
        { label: "Max Current", value: num(product.maxCurrentA) + " A" },
        { label: "Power Factor", value: num(product.powerFactor) },
        { label: "Recommended MCB", value: num(product.breakerA) + " A" },
        { label: "Electrical Supply", value: product.electricalSupply ?? "—" },
      ],
    },
    {
      title: "Refrigerant",
      icon: Droplets,
      rows: [
        { label: "Refrigerant", value: product.refrigerant ?? "—", highlight: true },
        { label: "Charge", value: num(product.refrigerantChargeKg) + " kg" },
      ],
    },
    {
      title: "Refrigerant Piping",
      icon: Ruler,
      rows: [
        { label: "Liquid Line OD", value: num(product.pipeLiquidMm) + " mm", highlight: true },
        { label: "Gas / Suction Line OD", value: num(product.pipeGasMm) + " mm", highlight: true },
        { label: "Max Pipe Length", value: num(product.pipeMaxM, 0) + " m" },
        { label: "Max Vertical Lift", value: num(product.pipeHeightM, 0) + " m" },
      ],
    },
    {
      title: "Physical",
      icon: Scale,
      rows: [
        { label: "Indoor Weight", value: num(product.indoorWeightKg) + " kg" },
        { label: "Outdoor Weight", value: num(product.outdoorWeightKg) + " kg" },
        { label: "Indoor Size (W×H×D)", value: product.indoorDimensions ?? "—" },
        { label: "Outdoor Size (W×H×D)", value: product.outdoorDimensions ?? "—" },
        { label: "Indoor Sound", value: num(product.soundLevelDb, 0) + " dB" },
        { label: "Outdoor Sound", value: num(product.outdoorSoundDb, 0) + " dB" },
        { label: "Color", value: product.color ?? "—" },
      ],
    },
    {
      title: "Performance & Compliance",
      icon: Star,
      rows: [
        {
          label: "Energy Rating",
          value: product.energyRating ? num(product.energyRating, 1) + " ★" : "—",
        },
        { label: "EER", value: num(product.eer) },
        { label: "COP", value: num(product.cop) },
        {
          label: "Operating Temp Range",
          value:
            product.operatingTempMin != null && product.operatingTempMax != null
              ? `${product.operatingTempMin}°C to ${product.operatingTempMax}°C`
              : "—",
        },
        { label: "Warranty", value: product.warrantyYears ?? "—" },
        { label: "Price Range", value: product.priceRange ?? "—" },
      ],
    },
    { title: "Additional Specifications", icon: ClipboardList, rows: keySpecRows },
  ];

  return (
    // z-[2100] — must sit ABOVE the app's fixed bottom-nav (z-1000) on mobile,
    // otherwise the nav clips the bottom of the sheet.
    <div
      className="fixed inset-0 z-[2100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(2,6,23,0.65)", animation: "catFadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes catSheetUp {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes catFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cat-sheet-scroll::-webkit-scrollbar { width: 6px; }
        .cat-sheet-scroll::-webkit-scrollbar-thumb { background: ${p.cardBorder}; border-radius: 6px; }
      `}</style>
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl"
        style={{
          background: p.pageBg,
          animation: "catSheetUp 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start gap-4 p-5 sm:p-6"
          style={{
            borderBottom: `1px solid ${p.cardBorder}`,
            background: p.isDark
              ? "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(255,255,255,0.02))"
              : "linear-gradient(135deg, #f8fafc, rgba(224,242,254,0.5))",
          }}
        >
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white shadow-md"
            style={{ backgroundColor: brand.logoColor ?? "#0ea5e9" }}
          >
            {brand.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
                style={{ background: p.isDark ? "rgba(255,255,255,0.12)" : "#0f172a" }}
              >
                {country.flag} {country.name}
              </span>
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: p.chipActiveBg, color: p.chipActiveText }}
              >
                {category.icon} {category.name}
              </span>
              {product.productType ? (
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: p.chipInactiveBg, color: p.chipInactiveText }}
                >
                  {product.productType}
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 truncate text-xl font-bold" style={{ color: p.textPrimary }}>
              {brand.name} — {product.modelName}
            </h2>
            {product.series ? (
              <p className="text-sm" style={{ color: p.textSecondary }}>
                {product.series}
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full shadow-sm transition hover:scale-105 active:scale-95"
            style={{ background: p.cardBg, color: p.textSecondary, border: `1px solid ${p.cardBorder}` }}
          >
            <X size={16} />
          </button>
        </div>

        {product.description ? (
          <p
            className="px-5 py-4 text-sm leading-relaxed sm:px-6"
            style={{ borderBottom: `1px solid ${p.cardBorder}`, color: p.textSecondary }}
          >
            {product.description}
          </p>
        ) : null}

        {/* Spec groups — extra bottom padding keeps the last row clear of the
            home indicator / bottom-nav on phones */}
        <div
          className="cat-sheet-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-6"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const visibleRows = group.rows.filter(
                (r) => r.value !== "—" && !r.value.startsWith("NaN"),
              );
              if (visibleRows.length === 0) return null;
              const GroupIcon = group.icon as ComponentType<{ size?: number; style?: React.CSSProperties }>;
              return (
                <div
                  key={group.title}
                  className="rounded-2xl p-4"
                  style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
                >
                  <h3
                    className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
                    style={{ color: p.textSecondary }}
                  >
                    <GroupIcon size={15} style={{ color: p.accent }} />
                    {group.title}
                  </h3>
                  <dl className="space-y-2">
                    {visibleRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-3 pb-2 last:pb-0"
                        style={{ borderBottom: `1px solid ${p.cardBorder}` }}
                      >
                        <dt className="text-xs font-medium" style={{ color: p.textSecondary }}>
                          {row.label}
                        </dt>
                        <dd
                          className="text-right text-sm font-semibold"
                          style={{ color: row.highlight ? p.accent : p.textPrimary }}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
