import { ArrowRight, Check, Plus } from "lucide-react";
import type { Product, Brand, Country, ProductCategory } from "../../data/allCatalogueTypes";
import { num, primarySelection } from "../../data/allCatalogueTypes";
import { getCataloguePalette, type CataloguePalette, type ThemeMode } from "../../data/catalogueTheme";
import { useCompare } from "./CompareContext";

type Props = {
  product: Product;
  brand: Brand;
  country: Country;
  category: ProductCategory;
  onSelect: () => void;
  theme?: ThemeMode;
};

export default function AllCatalogueCard({
  product,
  brand,
  country,
  category,
  onSelect,
  theme = "light",
}: Props) {
  const p = getCataloguePalette(theme);
  const selection = primarySelection(product);
  const { has, toggle, count, max } = useCompare();
  const isAdded = has(product.id);
  const isFull = count >= max && !isAdded;
  const row = { product, brand, country, category };

  return (
    <div
      className="group flex w-full flex-col overflow-hidden rounded-2xl text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: p.cardBg,
        border: isAdded ? `2px solid ${p.accent}` : `1px solid ${p.cardBorder}`,
      }}
    >
      {/* Clickable card body → opens detail modal */}
      <button
        onClick={onSelect}
        className="flex flex-1 cursor-pointer flex-col text-left"
      >
        {/* Brand header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: `1px solid ${p.cardBorder}`, background: p.cardBgSubtle }}
        >
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: brand.logoColor ?? "#0ea5e9" }}
          >
            {brand.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold" style={{ color: p.textPrimary }}>
              {brand.name}
            </div>
            <div className="truncate text-[11px]" style={{ color: p.textSecondary }}>
              {country.flag} {country.name} · {category.name}
            </div>
          </div>
          {product.energyRating ? (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ background: p.amberBg, color: p.amberText }}
            >
              {num(product.energyRating, 1)}★
            </span>
          ) : null}
        </div>

        {/* Model + key specs */}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-sm font-bold" style={{ color: p.textPrimary }}>
              {product.modelName}
            </h3>
            {product.series ? (
              <span className="shrink-0 text-[11px]" style={{ color: p.textMuted }}>
                {product.series}
              </span>
            ) : null}
          </div>

          {selection ? (
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-sm"
              style={{ background: p.accentGradient }}
            >
              <span
                className="text-[10px] font-medium uppercase tracking-wide"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Select by
              </span>
              {selection}
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {product.airflowCfm ? (
              <Spec palette={p} label="Airflow" value={`${product.airflowCfm.toLocaleString()} CFM`} />
            ) : null}
            {product.powerInputW ? (
              <Spec palette={p} label="Power" value={`${num(product.powerInputW, 0)} W`} />
            ) : null}
            {product.refrigerant ? (
              <Spec palette={p} label="Refrigerant" value={product.refrigerant} />
            ) : null}
            {product.pipeLiquidMm && product.pipeGasMm ? (
              <Spec
                palette={p}
                label="Pipe (L/G)"
                value={`${num(product.pipeLiquidMm)}/${num(product.pipeGasMm)} mm`}
              />
            ) : null}
            {product.keySpecs
              ? Object.entries(product.keySpecs)
                  .slice(0, 2)
                  .map(([k, v]) => <Spec key={k} palette={p} label={k} value={String(v)} />)
              : null}
          </div>
        </div>
      </button>

      {/* Footer — CTA + Compare button */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2.5"
        style={{ borderTop: `1px solid ${p.cardBorder}` }}
      >
        <button
          onClick={onSelect}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
          style={{ color: p.accent }}
        >
          View specs <ArrowRight size={13} />
        </button>

        {/* + COMPARE / ✓ ADDED */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isFull) toggle(row);
          }}
          disabled={isFull}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition active:scale-95 ${
            isFull ? "cursor-not-allowed opacity-40" : ""
          }`}
          style={{
            background: isAdded
              ? (theme === "dark" ? "rgba(34,211,238,0.12)" : "#e0f2fe")
              : "transparent",
            borderColor: isAdded ? p.accent : p.cardBorder,
            color: isAdded ? p.accent : p.textSecondary,
          }}
          title={isFull ? "Max 4 products" : isAdded ? "Remove from compare" : "Add to compare"}
        >
          {isAdded ? <Check size={12} /> : <Plus size={12} />}
          {isAdded ? "Added" : "Compare"}
        </button>
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: CataloguePalette;
}) {
  return (
    <div className="min-w-0">
      <div
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: palette.textMuted }}
      >
        {label}
      </div>
      <div className="truncate text-xs font-semibold" style={{ color: palette.textPrimary }}>
        {value}
      </div>
    </div>
  );
}
