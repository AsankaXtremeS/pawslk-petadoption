import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import BrowseAnimals from "./pages/BrowseAnimals";
import AnimalDetail from "./pages/AnimalDetail";
import ReportStray from "./pages/ReportStray";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import { UserProvider, useUser } from "@/contexts/UserContext";

const queryClient = new QueryClient();

function AppContent() {
  const { isRegistered } = useUser();

  // If user hasn't registered, show the Welcome/GetStarted flow
  if (!isRegistered) {
    return <Welcome />;
  }

  // Once registered, show the main app
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/animals" element={<BrowseAnimals />} />
          <Route path="/animals/:id" element={<AnimalDetail />} />
          <Route path="/report" element={<ReportStray />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <AppContent />
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
