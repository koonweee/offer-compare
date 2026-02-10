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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold tracking-tight hover:opacity-80 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center text-sm font-bold">$</span>
              Offer compare
            </Link>
            <nav className="hidden md:flex gap-1">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <nav className="md:hidden border-t px-4 py-2 flex gap-2 overflow-x-auto">
             {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</main>
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
