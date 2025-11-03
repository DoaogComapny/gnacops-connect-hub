import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import AboutPage from "./pages/AboutPage";
import MembershipPage from "./pages/MembershipPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import ForgotPage from "./pages/ForgotPage";
import AdminSignup from "./pages/AdminSignup";
import InstitutionalForm from "./pages/InstitutionalForm";
import TeacherCouncilForm from "./pages/TeacherCouncilForm";
import ParentCouncilForm from "./pages/ParentCouncilForm";
import ProprietorForm from "./pages/ProprietorForm";
import ServiceProviderForm from "./pages/ServiceProviderForm";
import NonTeachingStaffForm from "./pages/NonTeachingStaffForm";
import MultiMembershipSelection from "./pages/MultiMembershipSelection";
import MultiMembershipForm from "./pages/MultiMembershipForm";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminSchoolsView from "./pages/admin/AdminSchoolsView";
import AdminFormBuilder from "./pages/admin/AdminFormBuilder";
import AdminSupport from "./pages/admin/AdminSupport";
import StaffForgotRequests from "./pages/admin/StaffForgotRequests";

// User Pages
import UserPayments from "./pages/user/UserPayments";
import UserCertificate from "./pages/user/UserCertificate";
import UserNotifications from "./pages/user/UserNotifications";
import UserAccount from "./pages/user/UserAccount";
import UserSupportTickets from "./pages/user/UserSupportTickets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot" element={<ForgotPage />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/register/multi-select" element={<MultiMembershipSelection />} />
          <Route path="/register/multi-form" element={<MultiMembershipForm />} />
          <Route path="/register/institutional" element={<InstitutionalForm />} />
          <Route path="/register/teacher" element={<TeacherCouncilForm />} />
          <Route path="/register/parent" element={<ParentCouncilForm />} />
          <Route path="/register/proprietor" element={<ProprietorForm />} />
          <Route path="/register/service-provider" element={<ServiceProviderForm />} />
          <Route path="/register/non-teaching-staff" element={<NonTeachingStaffForm />} />
          
          {/* Admin Routes */}
          <Route path="/admin/panel" element={<AdminPanel />}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="schools-view" element={<AdminSchoolsView />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="forgot-requests" element={<StaffForgotRequests />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="form-builder" element={<AdminFormBuilder />} />
            <Route path="support" element={<AdminSupport />} />
          </Route>

          {/* User Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />}>
            <Route path="account" element={<UserAccount />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="certificate" element={<UserCertificate />} />
            <Route path="support" element={<UserSupportTickets />} />
            <Route path="notifications" element={<UserNotifications />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
