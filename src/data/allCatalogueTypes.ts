/**
 * All Catalogue — shared types + small helpers
 *
 * Drop this file into: src/data/allCatalogueTypes.ts
 *
 * These types describe the shape of `public/data/hvac-catalogue.json`
 * (countries, categories, brands, products). The JSON is fetched at runtime
 * (see AllCatalogue.tsx) so it never gets bundled into your JS — it stays a
 * lightweight static asset that Vite/Capacitor ships alongside your app.
 */

export interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  region: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
}

export interface Brand {
  id: number;
  name: string;
  countryId: number;
  logoColor: string | null;
  tagline?: string | null;
  website?: string | null;
  description?: string | null;
}

export type SelectBy = "HP" | "TR" | "CFM" | "KW" | "MODEL";

export interface AirflowLevel {
  label: string;
  cfm: number;
}

export interface Product {
  id: number;
  brandId: number;
  categoryId: number;
  modelName: string;
  series?: string | null;
  productType?: string | null;
  description?: string | null;

  // Capacity
  capacityTon?: number | null;
  capacityKw?: number | null;
  heatingKw?: number | null;
  capacityHp?: number | null;
  selectBy?: SelectBy;
  btuHr?: number | null;

  // Airflow
  airflowCfm?: number | null;
  airflowLevels?: AirflowLevel[] | null;

  // Electrical
  powerInputW?: number | null;
  voltage?: string | null;
  runningCurrentA?: number | null;
  maxCurrentA?: number | null;
  powerFactor?: number | null;
  electricalSupply?: string | null;
  breakerA?: number | null;

  // Refrigerant
  refrigerant?: string | null;
  refrigerantChargeKg?: number | null;

  // Piping
  pipeLiquidMm?: number | null;
  pipeGasMm?: number | null;
  pipeMaxM?: number | null;
  pipeHeightM?: number | null;

  // Physical
  indoorWeightKg?: number | null;
  outdoorWeightKg?: number | null;
  indoorDimensions?: string | null;
  outdoorDimensions?: string | null;
  soundLevelDb?: number | null;
  outdoorSoundDb?: number | null;

  // Performance
  energyRating?: number | null;
  eer?: number | null;
  cop?: number | null;
  operatingTempMin?: number | null;
  operatingTempMax?: number | null;

  // Misc
  color?: string | null;
  warrantyYears?: string | null;
  priceRange?: string | null;
  keySpecs?: Record<string, string | number | boolean> | null;
}

export interface CatalogueData {
  countries: Country[];
  categories: ProductCategory[];
  brands: Brand[];
  products: Product[];
}

/** A product joined with its brand / country / category — used by the UI. */
export interface CatalogueRow {
  product: Product;
  brand: Brand;
  country: Country;
  category: ProductCategory;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Format a number (or null) for display, e.g. num(1.5) => "1.5". */
export function num(v: number | null | undefined, digits = 2): string {
  if (v == null) return "—";
  if (Number.isNaN(v)) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(digits);
}

/** The value a technician actually selects a unit by (HP / CFM / kW / TR). */
export function primarySelection(p: Product): string | null {
  switch (p.selectBy) {
    case "HP":
      return p.capacityHp ? `${num(p.capacityHp)} HP` : null;
    case "CFM":
      return p.airflowCfm ? `${p.airflowCfm.toLocaleString()} CFM` : null;
    case "KW":
      return p.heatingKw
        ? `${num(p.heatingKw)} kW`
        : p.capacityKw
          ? `${num(p.capacityKw)} kW`
          : null;
    case "MODEL":
      return null;
    default:
      return p.capacityTon ? `${num(p.capacityTon)} TR` : null;
  }
}

/** Build the {product, brand, country, category} rows from raw tables. */
export function joinCatalogue(data: CatalogueData): CatalogueRow[] {
  const brandById = new Map(data.brands.map((b) => [b.id, b]));
  const countryById = new Map(data.countries.map((c) => [c.id, c]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));

  const rows: CatalogueRow[] = [];
  for (const product of data.products) {
    const brand = brandById.get(product.brandId);
    const category = categoryById.get(product.categoryId);
    if (!brand || !category) continue;
    const country = countryById.get(brand.countryId);
    if (!country) continue;
    rows.push({ product, brand, country, category });
  }
  return rows;
}
