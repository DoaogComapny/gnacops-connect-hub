import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import AboutPage from "./pages/AboutPage";
import MembershipPage from "./pages/MembershipPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import InstitutionalForm from "./pages/InstitutionalForm";
import TeacherCouncilForm from "./pages/TeacherCouncilForm";
import ParentCouncilForm from "./pages/ParentCouncilForm";
import ProprietorForm from "./pages/ProprietorForm";
import ServiceProviderForm from "./pages/ServiceProviderForm";
import NonTeachingStaffForm from "./pages/NonTeachingStaffForm";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/institutional" element={<InstitutionalForm />} />
          <Route path="/register/teacher" element={<TeacherCouncilForm />} />
          <Route path="/register/parent" element={<ParentCouncilForm />} />
          <Route path="/register/proprietor" element={<ProprietorForm />} />
          <Route path="/register/service-provider" element={<ServiceProviderForm />} />
          <Route path="/register/non-teaching-staff" element={<NonTeachingStaffForm />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
