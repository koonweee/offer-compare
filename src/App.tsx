import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { AppProvider, useAppState } from "@/lib/app-context";
import { useThemeEffect } from "@/lib/use-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShareImportHandler } from "@/components/share-import-handler";
import { OffersPage } from "@/pages/offers-page";
import { OfferFormPage } from "@/pages/offer-form-page";
import { ComparePage } from "@/pages/compare-page";
import { SettingsPage } from "@/pages/settings-page";

function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useAppState();
  const location = useLocation();
  useThemeEffect(state.settings.theme);

  const tabs = [
    { label: "Offers", path: "/" },
    { label: "Compare", path: "/compare" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold hover:opacity-80">
            Offer compare $
          </Link>
        </div>
        <nav className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ShareImportHandler />
      <TooltipProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<OffersPage />} />
              <Route path="/offer/new" element={<OfferFormPage />} />
              <Route path="/offer/:id" element={<OfferFormPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
