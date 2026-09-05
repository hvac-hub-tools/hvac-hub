/**
 * All Catalogue — top-level wrapper
 *
 * Drop this file into: src/components/catalogue/AllCatalogueApp.tsx
 *
 * Data is bundled at build time via a static import (not fetch), so it works
 * reliably in the dev server, production build, and the Capacitor native app
 * — no network request, no path issues.
 *
 * Usage from App.tsx (same pattern as your other tools):
 *   {page === "catalog" && <AllCatalogueApp theme={theme} />}
 */
import { useState } from "react";
import AllCatalogue from "./AllCatalogue";
import AllCatalogueHome from "./AllCatalogueHome";
import type { CatalogueData } from "../../data/allCatalogueTypes";
import type { ThemeMode } from "../../data/catalogueTheme";
// Static import — bundled into the app, no fetch/path issues.
import catalogueJson from "../../data/hvac-catalogue.json";

const data = catalogueJson as unknown as CatalogueData;

type Props = {
  /** Called when the user backs out of the whole catalogue tool (from Home). */
  onBack?: () => void;
  theme?: "dark" | "light";
};

type View =
  | { screen: "home" }
  | { screen: "browse"; category?: string; brandId?: string };

export default function AllCatalogueApp({ onBack, theme = "light" }: Props) {
  const [view, setView] = useState<View>({ screen: "home" });

  if (view.screen === "browse") {
    return (
      <AllCatalogue
        initialCategory={view.category ?? "all"}
        initialBrandId={view.brandId ?? "all"}
        theme={theme as ThemeMode}
        onBack={() => setView({ screen: "home" })}
      />
    );
  }

  return (
    <AllCatalogueHome
      data={data}
      theme={theme as ThemeMode}
      onOpenAll={() => setView({ screen: "browse" })}
      onOpenCategory={(categoryValue) => setView({ screen: "browse", category: categoryValue })}
      onOpenBrand={(brandId) => setView({ screen: "browse", brandId: String(brandId) })}
    />
  );
}
