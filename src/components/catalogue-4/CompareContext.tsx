/**
 * Compare context — holds up to 4 product IDs for side-by-side comparison.
 * Wrap your <AllCatalogueApp> (or the whole app) with <CompareProvider>.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { CatalogueRow } from "../../data/allCatalogueTypes";

const MAX = 4;

type CompareCtx = {
  items: CatalogueRow[];
  /** Max items allowed */
  max: number;
  /** Whether the item is already in the compare list */
  has: (productId: number) => boolean;
  /** Toggle add/remove */
  toggle: (row: CatalogueRow) => void;
  /** Remove by product id */
  remove: (productId: number) => void;
  /** Nuke everything */
  clearAll: () => void;
  /** Count */
  count: number;
};

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogueRow[]>([]);

  const has = useCallback(
    (pid: number) => items.some((r) => r.product.id === pid),
    [items],
  );

  const toggle = useCallback(
    (row: CatalogueRow) => {
      setItems((prev) => {
        const exists = prev.some((r) => r.product.id === row.product.id);
        if (exists) return prev.filter((r) => r.product.id !== row.product.id);
        if (prev.length >= MAX) return prev; // silently cap
        return [...prev, row];
      });
    },
    [],
  );

  const remove = useCallback(
    (pid: number) => setItems((prev) => prev.filter((r) => r.product.id !== pid)),
    [],
  );

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <Ctx.Provider value={{ items, max: MAX, has, toggle, remove, clearAll, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare(): CompareCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompare() must be used inside <CompareProvider>");
  return ctx;
}
