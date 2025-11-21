import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DynamicSiteConfig } from "@/components/DynamicSiteConfig";
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
import AdminSecretaryManagement from "./pages/admin/AdminSecretaryManagement";
import AdminStaffManagement from "./pages/admin/AdminStaffManagement";
import AdminRegionalCoordinators from "./pages/admin/AdminRegionalCoordinators";
import AdminDistrictCoordinators from "./pages/admin/AdminDistrictCoordinators";
import AdminTeamManagement from "./pages/admin/AdminTeamManagement";
import AdminServicesManagement from "./pages/admin/AdminServicesManagement";
import AdminNewsManagement from "./pages/admin/AdminNewsManagement";
import AdminGalleryManagement from "./pages/admin/AdminGalleryManagement";
import AdminEventsManagement from "./pages/admin/AdminEventsManagement";
import AdminEducationTVManagement from "./pages/admin/AdminEducationTVManagement";
import AdminRolesManagement from "./pages/admin/AdminRolesManagement";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import OfficeDashboard from "./pages/office/OfficeDashboard";
import DepartmentsPage from "./pages/office/DepartmentsPage";
import TasksPage from "./pages/office/TasksPage";
import DocumentsPage from "./pages/office/DocumentsPage";
import AppointmentsPage from "./pages/office/AppointmentsPage";
import BookAppointment from "./pages/user/BookAppointment";

// New Public Pages
import TeamPage from "./pages/TeamPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import NewsPage from "./pages/NewsPage";
import GalleryPage from "./pages/GalleryPage";
import EventsPage from "./pages/EventsPage";
import EducationTVPage from "./pages/EducationTVPage";
import AdminSchoolsView from "./pages/admin/AdminSchoolsView";
import AdminFormBuilder from "./pages/admin/AdminFormBuilder";
import AdminSupport from "./pages/admin/AdminSupport";
import StaffForgotRequests from "./pages/admin/StaffForgotRequests";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAwardedCertificates from "./pages/admin/AdminAwardedCertificates";
import AdminPricingSettings from "./pages/admin/AdminPricingSettings";

// User Pages
import UserPayments from "./pages/user/UserPayments";
import UserCertificate from "./pages/user/UserCertificate";
import UserNotifications from "./pages/user/UserNotifications";
import UserAccount from "./pages/user/UserAccount";
import UserSupportTickets from "./pages/user/UserSupportTickets";
import UserSupportTicketDetail from "./pages/user/UserSupportTicketDetail";

// Secretary Pages
import SecretaryPanel from "./pages/SecretaryPanel";
import SecretaryAppointments from "./pages/secretary/SecretaryAppointments";
import SecretaryCalendar from "./pages/secretary/SecretaryCalendar";
import SecretarySupport from "./pages/secretary/SecretarySupport";
import SecretaryAnalytics from "./pages/secretary/SecretaryAnalytics";
import SecretarySyncStatus from "./pages/secretary/SecretarySyncStatus";
import SecretaryEmailTemplates from "./pages/secretary/SecretaryEmailTemplates";
import SecretaryRecurringAppointments from "./pages/secretary/SecretaryRecurringAppointments";
import SecretaryEmailAnalytics from "./pages/secretary/SecretaryEmailAnalytics";

// District Coordinator Pages
import DistrictCoordinatorPanel from "./pages/coordinator/DistrictCoordinatorPanel";
import DistrictDashboardHome from "./pages/coordinator/DistrictDashboardHome";
import DistrictSchoolsList from "./pages/coordinator/DistrictSchoolsList";
import DistrictSchoolDetails from "./pages/coordinator/DistrictSchoolDetails";
import DistrictPaymentsPage from "./pages/coordinator/DistrictPaymentsPage";
import DistrictReportsPage from "./pages/coordinator/DistrictReportsPage";
import DistrictAccountPage from "./pages/coordinator/DistrictAccountPage";

// Regional Coordinator Pages
import RegionalCoordinatorPanel from "./pages/coordinator/RegionalCoordinatorPanel";
import RegionalDashboardHome from "./pages/coordinator/RegionalDashboardHome";
import RegionalDistrictCoordinators from "./pages/coordinator/RegionalDistrictCoordinators";
import RegionalSchoolsList from "./pages/coordinator/RegionalSchoolsList";
import RegionalDistrictsOverview from "./pages/coordinator/RegionalDistrictsOverview";
import RegionalSchoolDetails from "./pages/coordinator/RegionalSchoolDetails";
import RegionalPaymentsPage from "./pages/coordinator/RegionalPaymentsPage";
import RegionalReportsPage from "./pages/coordinator/RegionalReportsPage";
import RegionalAccountPage from "./pages/coordinator/RegionalAccountPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <DynamicSiteConfig />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/education-tv" element={<EducationTVPage />} />
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
            <Route path="secretary" element={<AdminSecretaryManagement />} />
            <Route path="staff" element={<AdminStaffManagement />} />
            <Route path="regional-coordinators" element={<AdminRegionalCoordinators />} />
            <Route path="district-coordinators" element={<AdminDistrictCoordinators />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="awarded-certificates" element={<AdminAwardedCertificates />} />
            <Route path="schools-view" element={<AdminSchoolsView />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="forgot-requests" element={<StaffForgotRequests />} />
            <Route path="pricing" element={<AdminPricingSettings />} />
              <Route path="settings" element={<AdminSettings />} />
            <Route path="team-management" element={<AdminTeamManagement />} />
            <Route path="services-management" element={<AdminServicesManagement />} />
            <Route path="news-management" element={<AdminNewsManagement />} />
            <Route path="gallery-management" element={<AdminGalleryManagement />} />
            <Route path="events-management" element={<AdminEventsManagement />} />
            <Route path="education-tv-management" element={<AdminEducationTVManagement />} />
            <Route path="roles" element={<AdminRolesManagement />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="form-builder" element={<AdminFormBuilder />} />
            <Route path="office-management" element={<OfficeDashboard />} />
            <Route path="office-management/departments" element={<DepartmentsPage />} />
            <Route path="office-management/tasks" element={<TasksPage />} />
            <Route path="office-management/documents" element={<DocumentsPage />} />
            <Route path="office-management/appointments" element={<AppointmentsPage />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Secretary Routes */}
          <Route path="/secretary/panel" element={<SecretaryPanel />}>
            <Route path="appointments" element={<SecretaryAppointments />} />
            <Route path="calendar" element={<SecretaryCalendar />} />
            <Route path="recurring-appointments" element={<SecretaryRecurringAppointments />} />
            <Route path="sync-status" element={<SecretarySyncStatus />} />
            <Route path="email-templates" element={<SecretaryEmailTemplates />} />
            <Route path="support" element={<SecretarySupport />} />
            <Route path="analytics" element={<SecretaryAnalytics />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="password-reset" element={<StaffForgotRequests />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* User Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />}>
            <Route path="account" element={<UserAccount />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="certificate" element={<UserCertificate />} />
            <Route path="support" element={<UserSupportTickets />} />
            <Route path="support/:id" element={<UserSupportTicketDetail />} />
            <Route path="notifications" element={<UserNotifications />} />
          </Route>
          <Route path="/book-appointment" element={<BookAppointment />} />

          {/* District Coordinator Routes */}
          <Route path="/coordinator/district/*" element={<DistrictCoordinatorPanel />}>
            <Route path="dashboard" element={<DistrictDashboardHome />} />
            <Route path="schools" element={<DistrictSchoolsList />} />
            <Route path="school/:schoolId" element={<DistrictSchoolDetails />} />
            <Route path="payments" element={<DistrictPaymentsPage />} />
            <Route path="reports" element={<DistrictReportsPage />} />
            <Route path="account" element={<DistrictAccountPage />} />
          </Route>

          {/* Regional Coordinator Routes */}
          <Route path="/coordinator/regional/*" element={<RegionalCoordinatorPanel />}>
            <Route path="dashboard" element={<RegionalDashboardHome />} />
            <Route path="coordinators" element={<RegionalDistrictCoordinators />} />
            <Route path="schools" element={<RegionalSchoolsList />} />
            <Route path="schools/:schoolId" element={<RegionalSchoolDetails />} />
            <Route path="districts" element={<RegionalDistrictsOverview />} />
            <Route path="payments" element={<RegionalPaymentsPage />} />
            <Route path="reports" element={<RegionalReportsPage />} />
            <Route path="account" element={<RegionalAccountPage />} />
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
