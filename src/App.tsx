import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingScreen from "@/components/LoadingScreen";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const BrowseAnimals = lazy(() => import("./pages/BrowseAnimals"));
const AnimalDetail = lazy(() => import("./pages/AnimalDetail"));
const ReportStray = lazy(() => import("./pages/ReportStray"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { UserProvider } from "@/contexts/UserContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
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
                  
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Information Pages */}
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
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
        <SpeedInsights />
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
