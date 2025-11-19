import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Award, 
  MessageSquare, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart, 
  Shield, 
  Calendar as CalendarIcon,
  Settings,
  User,
  LogOut,
  Key
} from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebarHeader } from "@/components/admin/AdminSidebarHeader";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/secretary/panel" },
  { title: "Generate Certificates", icon: Award, path: "/secretary/panel/certificates" },
  { title: "Support Tickets", icon: MessageSquare, path: "/secretary/panel/support" },
  { title: "Manage Users", icon: Users, path: "/secretary/panel/users" },
  { title: "Approve Applications", icon: FileText, path: "/secretary/panel/applications" },
  { title: "Payments", icon: CreditCard, path: "/secretary/panel/payments" },
  { title: "Analytics", icon: BarChart, path: "/secretary/panel/analytics" },
  { title: "Staff Management", icon: Shield, path: "/secretary/panel/staff" },
  { title: "Appointments", icon: CalendarIcon, path: "/secretary/panel/appointments" },
  { title: "Calendar Setup", icon: CalendarIcon, path: "/secretary/panel/calendar" },
  { title: "Password Reset", icon: Key, path: "/secretary/panel/password-reset" },
  { title: "Profile", icon: User, path: "/secretary/panel/profile" },
  { title: "Settings", icon: Settings, path: "/secretary/panel/settings" },
];

const SecretaryPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSecretary, loading } = useSecretaryAuth();
  const { signOut } = useAuth();
  
  const isDashboard = location.pathname === "/secretary/panel";
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingTickets: 0,
    pendingApplications: 0,
    pendingAppointments: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && isSecretary) {
      fetchStats();
    }
  }, [user, isSecretary]);

  const fetchStats = async () => {
    try {
      const [membersRes, ticketsRes, appsRes, appointmentsRes] = await Promise.all([
        supabase.from('memberships').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalMembers: membersRes.count || 0,
        pendingTickets: ticketsRes.count || 0,
        pendingApplications: appsRes.count || 0,
        pendingAppointments: appointmentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background/95 to-accent/5">
        <Sidebar className="border-r border-card-border bg-card/50 backdrop-blur-sm">
          <AdminSidebarHeader />
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-4">
                Secretary Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                              isActive
                                ? "bg-accent/20 text-accent font-medium"
                                : "hover:bg-accent/10 text-foreground/80"
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 border-t border-card-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">
            {isDashboard ? (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gradient-accent mb-2">
                    Secretary Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Manage appointments, support tickets, applications, and more
                  </p>
                </div>

                {loadingStats ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card className="p-6 hover-glow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Members</p>
                            <p className="text-3xl font-bold text-gradient-accent">
                              {stats.totalMembers}
                            </p>
                          </div>
                          <Users className="h-10 w-10 text-accent/50" />
                        </div>
                      </Card>

                      <Card className="p-6 hover-glow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Tickets</p>
                            <p className="text-3xl font-bold text-gradient-accent">
                              {stats.pendingTickets}
                            </p>
                          </div>
                          <MessageSquare className="h-10 w-10 text-accent/50" />
                        </div>
                      </Card>

                      <Card className="p-6 hover-glow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Applications</p>
                            <p className="text-3xl font-bold text-gradient-accent">
                              {stats.pendingApplications}
                            </p>
                          </div>
                          <FileText className="h-10 w-10 text-accent/50" />
                        </div>
                      </Card>

                      <Card className="p-6 hover-glow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Appointments</p>
                            <p className="text-3xl font-bold text-gradient-accent">
                              {stats.pendingAppointments}
                            </p>
                          </div>
                          <CalendarIcon className="h-10 w-10 text-accent/50" />
                        </div>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="p-6 hover-glow">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-accent" />
                          Quick Actions - Appointments
                        </h3>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/secretary/panel/appointments')}
                          >
                            View All Appointments
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/secretary/panel/calendar')}
                          >
                            Manage Calendar
                          </Button>
                        </div>
                      </Card>

                      <Card className="p-6 hover-glow">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-accent" />
                          Quick Actions - Support
                        </h3>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/secretary/panel/support')}
                          >
                            View Support Tickets
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/secretary/panel/applications')}
                          >
                            Review Applications
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SecretaryPanel;
