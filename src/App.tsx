import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import BrowseAnimals from "./pages/BrowseAnimals";
import AnimalDetail from "./pages/AnimalDetail";
import ReportStray from "./pages/ReportStray";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import { UserProvider } from "@/contexts/UserContext";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — rendered WITHOUT the main Layout (full-screen) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main app pages — rendered WITH the Layout (navbar, footer, bottom tabs) */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                {/* Public routes — accessible to everyone */}
                <Route path="/" element={<Index />} />
                <Route path="/animals" element={<BrowseAnimals />} />
                <Route path="/animals/:id" element={<AnimalDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Protected routes — require authentication */}
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportStray />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
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
        <Analytics />
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
