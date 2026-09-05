/**
 * All Catalogue — home / landing screen
 *
 * Drop this file into: src/components/AllCatalogueHome.tsx
 */
import { useMemo } from "react";
import type { CatalogueData } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type ThemeMode } from "../../data/catalogueTheme";

type Props = {
  data: CatalogueData;
  onOpenCategory: (categoryValue: string) => void;
  onOpenBrand: (brandId: number) => void;
  onOpenAll: () => void;
  theme?: ThemeMode;
};

export default function AllCatalogueHome({
  data,
  onOpenCategory,
  onOpenBrand,
  onOpenAll,
  theme = "light",
}: Props) {
  const p = getCataloguePalette(theme);

  const parentCategories = useMemo(
    () => data.categories.filter((c) => c.parentId == null),
    [data],
  );

  const categoryGroups = useMemo(() => {
    return parentCategories.map((parent) => {
      const subIds = new Set(
        data.categories.filter((c) => c.parentId === parent.id).map((c) => c.id),
      );
      const count = data.products.filter((prod) => subIds.has(prod.categoryId)).length;
      return { ...parent, productCount: count };
    });
  }, [parentCategories, data]);

  const featuredBrands = useMemo(() => data.brands.slice(0, 8), [data]);

  return (
    <div className="min-h-screen px-4 pb-10 pt-4" style={{ background: p.pageBg }}>
      {/* Hero — stays dark navy/cyan in both themes, like the app's own headers */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-xl"
        style={{ background: p.heroFromTo }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            HVAC Master Toolkit
          </span>
          <h1 className="mt-4 max-w-xl text-[clamp(1.6rem,6vw,2.5rem)] font-bold leading-[1.1] tracking-tight">
            Every HVAC unit type. Every brand. Every country.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              One catalogue.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-200">
            Browse every brand across {data.countries.length} countries with full
            specs — TR, CFM, electrical load, pipe sizes, weights and more.
          </p>
          <button
            onClick={onOpenAll}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-cyan-50"
          >
            📚 Open All Catalogue →
          </button>

          {/* Stats */}
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Countries" value={data.countries.length} />
            <Stat label="Brands" value={data.brands.length} />
            <Stat label="Unit Types" value={data.products.length} />
            <Stat label="Categories" value={parentCategories.length} />
          </dl>
        </div>
      </section>

      {/* Category grid */}
      <section className="mt-8 space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: p.textPrimary }}>
            Browse by category
          </h2>
          <p className="mt-1 text-sm" style={{ color: p.textSecondary }}>
            The complete A-to-Z of HVAC equipment — {parentCategories.length} major
            categories covering every unit type worldwide.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categoryGroups.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onOpenCategory(`parent:${cat.slug}`)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-2xl shadow-md">
                  {cat.icon}
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: p.chipActiveBg, color: p.chipActiveText }}
                >
                  {cat.productCount} {cat.productCount === 1 ? "unit" : "units"}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold" style={{ color: p.textPrimary }}>
                {cat.name}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed" style={{ color: p.textSecondary }}>
                {cat.description}
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition group-hover:gap-2"
                style={{ color: p.accent }}
              >
                Browse →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured brands */}
      <section className="mt-8 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: p.textPrimary }}>
              Featured brands
            </h2>
            <p className="mt-1 text-sm" style={{ color: p.textSecondary }}>
              {data.brands.length} brands across {data.countries.length} countries.
            </p>
          </div>
          <button
            onClick={onOpenAll}
            className="hidden shrink-0 cursor-pointer text-sm font-semibold transition sm:block"
            style={{ color: p.accent }}
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {featuredBrands.map((b) => {
            const country = data.countries.find((c) => c.id === b.countryId);
            return (
              <button
                key={b.id}
                onClick={() => onOpenBrand(b.id)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition hover:shadow-sm"
                style={{ background: p.cardBg, border: `1px solid ${p.cardBorder}` }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: b.logoColor ?? "#0ea5e9" }}
                >
                  {b.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: p.textPrimary }}>
                    {b.name}
                  </span>
                  <span className="block truncate text-xs" style={{ color: p.textSecondary }}>
                    {country?.flag} {country?.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
      <dd className="text-xl font-bold text-white sm:text-2xl">{value}</dd>
      <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-cyan-200">
        {label}
      </dt>
    </div>
  );
}
