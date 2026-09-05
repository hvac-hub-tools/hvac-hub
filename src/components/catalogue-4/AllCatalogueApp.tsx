import { useState } from "react";
import AllCatalogue from "./AllCatalogue";
import AllCatalogueHome from "./AllCatalogueHome";
import CompareView from "./CompareView";
import { CompareProvider } from "./CompareContext";
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
  | { screen: "browse"; category?: string; brandId?: string }
  | { screen: "compare" };

export default function AllCatalogueApp({ theme = "light" }: Props) {
  const [view, setView] = useState<View>({ screen: "home" });

  // All screens share the same CompareProvider so compare state persists
  // when navigating between home ↔ browse ↔ compare.
  return (
    <CompareProvider>
      {view.screen === "compare" ? (
        <CompareView
          theme={theme as ThemeMode}
          onBack={() => setView({ screen: "browse" })}
        />
      ) : view.screen === "browse" ? (
        <AllCatalogue
          initialCategory={view.category ?? "all"}
          initialBrandId={view.brandId ?? "all"}
          theme={theme as ThemeMode}
          onBack={() => setView({ screen: "home" })}
          onOpenCompare={() => setView({ screen: "compare" })}
        />
      ) : (
        <AllCatalogueHome
          data={data}
          theme={theme as ThemeMode}
          onOpenAll={() => setView({ screen: "browse" })}
          onOpenCategory={(categoryValue) => setView({ screen: "browse", category: categoryValue })}
          onOpenBrand={(brandId) => setView({ screen: "browse", brandId: String(brandId) })}
          onOpenCompare={() => setView({ screen: "compare" })}
        />
      )}
    </CompareProvider>
  );
}
