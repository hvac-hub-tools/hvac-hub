/**
 * AllCatalogueApp — now a CONTROLLED component.
 *
 * Why: previously the view state (home / browse / compare) lived *inside* this
 * component, so the host app's back button / Android hardware back knew nothing
 * about it and popped straight out to the app home. Now the host owns the view
 * + a small stack, so every back arrow and the hardware back walk the catalogue
 * screens in reverse order (compare → browse → catalogue home → app).
 */
import AllCatalogue from "./AllCatalogue";
import AllCatalogueHome from "./AllCatalogueHome";
import CompareView from "./CompareView";
import { CompareProvider } from "./CompareContext";
import type { CatalogueData } from "../../data/allCatalogueTypes";
import type { ThemeMode } from "../../data/catalogueTheme";
// Static import — bundled into the app, no fetch/path issues.
import catalogueJson from "../../data/hvac-catalogue.json";

const data = catalogueJson as unknown as CatalogueData;

export type CatalogueView =
  | { screen: "home" }
  | { screen: "browse"; category?: string; brandId?: string }
  | { screen: "compare" };

type Props = {
  theme?: "dark" | "light";
  /** Which catalogue screen to show — owned by the host app. */
  view: CatalogueView;
  /** Push a screen (host remembers the current one for back). */
  onNavigate: (view: CatalogueView) => void;
  /** Pop to the previous screen — wired to every back arrow inside. */
  onBack: () => void;
};

export default function AllCatalogueApp({ theme = "light", view, onNavigate, onBack }: Props) {
  // CompareProvider stays mounted across all three screens so the compare
  // selection survives home ↔ browse ↔ compare navigation.
  return (
    <CompareProvider>
      {view.screen === "compare" ? (
        <CompareView theme={theme as ThemeMode} onBack={onBack} />
      ) : view.screen === "browse" ? (
        <AllCatalogue
          initialCategory={view.category ?? "all"}
          initialBrandId={view.brandId ?? "all"}
          theme={theme as ThemeMode}
          onBack={onBack}
          onOpenCompare={() => onNavigate({ screen: "compare" })}
        />
      ) : (
        <AllCatalogueHome
          data={data}
          theme={theme as ThemeMode}
          onOpenAll={() => onNavigate({ screen: "browse" })}
          onOpenCategory={(categoryValue) =>
            onNavigate({ screen: "browse", category: categoryValue })
          }
          onOpenBrand={(brandId) =>
            onNavigate({ screen: "browse", brandId: String(brandId) })
          }
          onOpenCompare={() => onNavigate({ screen: "compare" })}
        />
      )}
    </CompareProvider>
  );
}
