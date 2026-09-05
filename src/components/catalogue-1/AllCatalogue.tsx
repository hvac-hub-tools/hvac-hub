/**
 * All Catalogue — main tool screen (browse / filter / product grid)
 *
 * Drop this file into: src/components/AllCatalogue.tsx
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import AllCatalogueCard from "./AllCatalogueCard";
import AllCatalogueDetailModal from "./AllCatalogueDetailModal";
import AllCatalogueSelect, { type SelectGroup } from "./AllCatalogueSelect";
import {
  joinCatalogue,
  type CatalogueData,
  type CatalogueRow,
} from "../../data/allCatalogueTypes";
import { getCataloguePalette, type CataloguePalette, type ThemeMode } from "../../data/catalogueTheme";
// Static import — bundled into the app, no fetch/path issues.
import catalogueJson from "../../data/hvac-catalogue.json";

const data = catalogueJson as unknown as CatalogueData;

type Props = {
  /** Called when the user taps the back arrow — wire this to your navigation. */
  onBack?: () => void;
  /** Pre-select a category (slug or "parent:slug") when opening this screen. */
  initialCategory?: string;
  /** Pre-select a brand id when opening this screen. */
  initialBrandId?: string;
  theme?: ThemeMode;
};

export default function AllCatalogue({
  onBack,
  initialCategory = "all",
  initialBrandId = "all",
  theme = "light",
}: Props) {
  const p = getCataloguePalette(theme);

  // Filters
  const [countryCode, setCountryCode] = useState<string>("all");
  const [brandId, setBrandId] = useState<string>(initialBrandId);
  const [categoryValue, setCategoryValue] = useState<string>(initialCategory);
  const [capValue, setCapValue] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CatalogueRow | null>(null);

  const allRows = useMemo(() => (data ? joinCatalogue(data) : []), [data]);

  const categoryTree = useMemo(() => {
    if (!data) return [];
    const parents = data.categories.filter((c) => c.parentId == null);
    return parents.map((parent) => ({
      parent,
      children: data.categories.filter((c) => c.parentId === parent.id),
    }));
  }, [data]);

  const availableBrands = useMemo(() => {
    if (!data) return [];
    if (countryCode === "all") return data.brands;
    return data.brands.filter((b) => {
      const c = data.countries.find((co) => co.id === b.countryId);
      return c?.code === countryCode;
    });
  }, [data, countryCode]);

  const preCapRows = useMemo(() => {
    return allRows.filter((row) => {
      if (countryCode !== "all" && row.country.code !== countryCode) return false;
      if (brandId !== "all" && row.brand.id !== Number(brandId)) return false;
      if (categoryValue !== "all") {
        if (categoryValue.startsWith("parent:")) {
          const parentSlug = categoryValue.slice("parent:".length);
          const parentCat = data?.categories.find(
            (c) => c.slug === parentSlug && c.parentId == null,
          );
          if (!parentCat) return false;
          const subIds = data!.categories
            .filter((c) => c.parentId === parentCat.id)
            .map((c) => c.id);
          if (!subIds.includes(row.category.id)) return false;
        } else if (row.category.slug !== categoryValue) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [
          row.product.modelName,
          row.product.series,
          row.product.description,
          row.product.productType,
          row.brand.name,
          row.product.refrigerant,
          row.product.keySpecs ? JSON.stringify(row.product.keySpecs) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, countryCode, brandId, categoryValue, search, data]);

  const selectMetric = useMemo<"HP" | "CFM" | "KW" | "TR" | "MODEL" | "MIXED">(() => {
    const kinds = new Set(preCapRows.map((r) => r.product.selectBy ?? "TR"));
    if (kinds.size === 0) return "TR";
    if (kinds.size === 1) return Array.from(kinds)[0] as "HP" | "CFM" | "KW" | "TR" | "MODEL";
    return "MIXED";
  }, [preCapRows]);

  const metricConfig = useMemo(() => {
    switch (selectMetric) {
      case "HP":
        return {
          label: "Capacity (HP — VRF Outdoor)",
          unit: "HP",
          get: (p: CatalogueRow["product"]) => p.capacityHp ?? null,
        };
      case "CFM":
        return {
          label: "Airflow (CFM)",
          unit: "CFM",
          get: (p: CatalogueRow["product"]) => p.airflowCfm ?? null,
        };
      case "KW":
        return {
          label: "Heating Capacity (kW)",
          unit: "kW",
          get: (p: CatalogueRow["product"]) => p.heatingKw ?? p.capacityKw ?? null,
        };
      default:
        return {
          label: "Capacity (TR / Tonnage)",
          unit: "TR",
          get: (p: CatalogueRow["product"]) => p.capacityTon ?? null,
        };
    }
  }, [selectMetric]);

  const availableCaps = useMemo(() => {
    if (selectMetric === "MODEL" || selectMetric === "MIXED") return [];
    const set = new Set<number>();
    for (const row of preCapRows) {
      const v = metricConfig.get(row.product);
      if (v != null && !Number.isNaN(v)) set.add(v);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [preCapRows, selectMetric, metricConfig]);

  useEffect(() => {
    if (capValue === "all") return;
    if (!availableCaps.includes(parseFloat(capValue))) setCapValue("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCaps]);

  const brandGroups = useMemo<SelectGroup[]>(() => {
    return [
      { options: [{ value: "all", label: "All brands" }] },
      {
        options: availableBrands.map((b) => {
          const c = data.countries.find((co) => co.id === b.countryId);
          return {
            value: String(b.id),
            label: `${b.name}${c ? ` (${c.flag} ${c.name})` : ""}`,
          };
        }),
      },
    ];
  }, [availableBrands]);

  const categoryGroups = useMemo<SelectGroup[]>(() => {
    return [
      { options: [{ value: "all", label: "All categories" }] },
      ...categoryTree.map(({ parent, children }) => ({
        label: `${parent.icon ?? ""}  ${parent.name}`,
        options: [
          { value: `parent:${parent.slug}`, label: `All in ${parent.name}` },
          ...children.map((child) => ({
            value: child.slug,
            label: `${child.icon} ${child.name}`,
          })),
        ],
      })),
    ];
  }, [categoryTree]);

  const filtered = useMemo(() => {
    if (capValue === "all") return preCapRows;
    return preCapRows.filter((row) => {
      const v = metricConfig.get(row.product);
      return v != null && Math.abs(v - parseFloat(capValue)) <= 0.001;
    });
  }, [preCapRows, capValue, metricConfig]);

  function clearFilters() {
    setCountryCode("all");
    setBrandId("all");
    setCategoryValue("all");
    setCapValue("all");
    setSearch("");
  }

  const hasActiveFilters =
    countryCode !== "all" ||
    brandId !== "all" ||
    categoryValue !== "all" ||
    capValue !== "all" ||
    search.trim().length > 0;

  return (
    <div className="min-h-screen px-4 pb-10 pt-4" style={{ background: p.pageBg }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full shadow-sm"
            style={{ background: p.cardBg, color: p.textPrimary }}
          >
            ←
          </button>
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: p.chipActiveBg, color: p.chipActiveText }}
            >
              A–Z Catalogue
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: p.textPrimary }}>
            All Catalogue
          </h1>
        </div>
      </div>

      {(
        <>
          <p className="mb-4 text-sm" style={{ color: p.textSecondary }}>
            {data.brands.length} brands across {data.countries.length} countries — every unit
            type in its full tonnage range. Filter by country, brand, category or{" "}
            <strong className="font-semibold" style={{ color: p.textPrimary }}>
              capacity
            </strong>{" "}
            to view full specs: CFM, electrical load, pipe sizes, weights and more.
          </p>

          {/* Filter bar */}
          <div
            className="mb-4 rounded-2xl p-4 shadow-sm"
            style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
          >
            {/* Search */}
            <div className="relative mb-4">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: p.textMuted }}
              >
                🔍
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by model, series, brand, refrigerant…"
                className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none transition"
                style={{
                  background: p.inputBg,
                  border: `1px solid ${p.cardBorder}`,
                  color: p.textPrimary,
                }}
              />
            </div>

            {/* Country chips */}
            <div className="mb-3">
              <div
                className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: p.textSecondary }}
              >
                Country / Region
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip
                  palette={p}
                  active={countryCode === "all"}
                  onClick={() => {
                    setCountryCode("all");
                    setBrandId("all");
                  }}
                >
                  🌐 All countries
                </Chip>
                {data.countries.map((c) => (
                  <Chip
                    key={c.id}
                    palette={p}
                    active={countryCode === c.code}
                    onClick={() => {
                      setCountryCode(c.code);
                      setBrandId("all");
                    }}
                  >
                    {c.flag} {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Adaptive capacity chips (HP / CFM / kW / TR) */}
            {availableCaps.length > 0 ? (
              <div className="mb-3">
                <div
                  className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: p.textSecondary }}
                >
                  {metricConfig.label}
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: p.chipActiveBg, color: p.chipActiveText }}
                  >
                    Select by {metricConfig.unit}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip palette={p} active={capValue === "all"} onClick={() => setCapValue("all")}>
                    All {metricConfig.unit}
                  </Chip>
                  {availableCaps.map((v) => (
                    <Chip
                      key={v}
                      palette={p}
                      active={capValue === String(v)}
                      onClick={() => setCapValue(String(v))}
                    >
                      {metricConfig.unit === "CFM"
                        ? `${v.toLocaleString()} ${metricConfig.unit}`
                        : `${v} ${metricConfig.unit}`}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Brand + Category dropdowns */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: p.textSecondary }}
                >
                  Brand
                </span>
                <AllCatalogueSelect
                  ariaLabel="Brand"
                  value={brandId}
                  onChange={setBrandId}
                  groups={brandGroups}
                  palette={p}
                  placeholder="All brands"
                />
              </label>
              <label className="block">
                <span
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: p.textSecondary }}
                >
                  Category
                </span>
                <AllCatalogueSelect
                  ariaLabel="Category"
                  value={categoryValue}
                  onChange={setCategoryValue}
                  groups={categoryGroups}
                  palette={p}
                  placeholder="All categories"
                />
              </label>
            </div>

            {/* Results count + clear */}
            <div
              className="mt-4 flex items-center justify-between pt-3"
              style={{ borderTop: `1px solid ${p.cardBorder}` }}
            >
              <p className="text-xs" style={{ color: p.textSecondary }}>
                Showing{" "}
                <span className="font-bold" style={{ color: p.textPrimary }}>
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "product" : "products"}
                {hasActiveFilters && " matching filters"}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition"
                  style={{ color: p.accent }}
                >
                  Clear filters ✕
                </button>
              ) : null}
            </div>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed p-10 text-center"
              style={{ borderColor: p.cardBorder, background: p.cardBg }}
            >
              <div className="text-4xl">🗂️</div>
              <p className="mt-3 text-sm font-semibold" style={{ color: p.textPrimary }}>
                No products match your filters
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold text-white transition"
                style={{ background: p.accentGradient }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((row) => (
                <AllCatalogueCard
                  key={row.product.id}
                  product={row.product}
                  brand={row.brand}
                  country={row.country}
                  category={row.category}
                  theme={theme}
                  onSelect={() => setSelected(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selected ? (
        <AllCatalogueDetailModal
          product={selected.product}
          brand={selected.brand}
          country={selected.country}
          category={selected.category}
          theme={theme}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  palette,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  palette: CataloguePalette;
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition"
      style={{
        background: active ? palette.chipActiveBg : palette.chipInactiveBg,
        border: active ? palette.chipActiveBorder : palette.chipInactiveBorder,
        color: active ? palette.chipActiveText : palette.chipInactiveText,
      }}
    >
      {children}
    </button>
  );
}
