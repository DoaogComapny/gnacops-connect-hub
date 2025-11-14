import { useState, useEffect } from "react";
import { Users, FileText, Settings, BarChart, Mail, Shield, LogOut, Menu, MapPin, LayoutDashboard, HelpCircle, User, Loader2, FileEdit, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminSidebarHeader } from "@/components/admin/AdminSidebarHeader";
import { ModuleSelector } from "@/components/admin/ModuleSelector";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/panel" },
  { title: "Applications", icon: FileText, path: "/admin/panel/applications" },
  { title: "Users", icon: Users, path: "/admin/panel/users" },
  { title: "Staff", icon: Shield, path: "/admin/panel/staff" },
  { title: "Schools", icon: MapPin, path: "/admin/panel/schools-view" },
  { title: "Certificates", icon: Shield, path: "/admin/panel/certificates" },
  { title: "Messages", icon: Mail, path: "/admin/panel/messages" },
  { title: "Support", icon: HelpCircle, path: "/admin/panel/support" },
  { title: "Form Builder", icon: LayoutDashboard, path: "/admin/panel/form-builder" },
  { title: "Pricing", icon: BarChart, path: "/admin/panel/pricing" },
  { title: "Editable Pages", icon: FileEdit, path: "/admin/panel/editable-pages" },
  { title: "Roles & Permissions", icon: Shield, path: "/admin/panel/roles" },
  { title: "Audit Logs", icon: FileText, path: "/admin/panel/audit-logs" },
  { title: "Profile", icon: User, path: "/admin/panel/profile" },
  { title: "Settings", icon: Settings, path: "/admin/panel/settings" },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();
  const isDashboard = location.pathname === "/admin/panel";
  
  // Real-time stats from database
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    totalRevenue: "GHS 0",
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch total members
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch pending applications
      const { count: pendingCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch active users (approved memberships)
      const { count: activeCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      setStats({
        totalMembers: memberCount || 0,
        pendingApplications: pendingCount || 0,
        totalRevenue: `GHS ${revenue.toLocaleString()}`,
        activeUsers: activeCount || 0,
      });
    };

    if (!loading && user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-card-border">
          <AdminSidebarHeader />
          <ModuleSelector />
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.path} 
                          end
                          className={({ isActive }) => 
                            `transition-all duration-200 ${isActive ? "bg-accent/20 text-accent" : "hover:bg-accent/10"}`
                          }
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="p-4 border-t border-card-border mt-auto">
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 p-8">
          {isDashboard ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage GNACOPS platform</p>
                </div>
                <SidebarTrigger />
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
                    </div>
                    <Users className="h-10 w-10 text-primary/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Apps</p>
                      <p className="text-3xl font-bold text-accent">{stats.pendingApplications}</p>
                    </div>
                    <FileText className="h-10 w-10 text-accent/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalRevenue}</p>
                    </div>
                    <BarChart className="h-10 w-10 text-green-500/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
                    </div>
                    <Shield className="h-10 w-10 text-blue-500/50" />
                  </div>
                </Card>
              </div>

              {/* Recent Applications - Real Data */}
              <Card className="p-6 hover-card">
                <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
                {stats.pendingApplications > 0 ? (
                  <p className="text-muted-foreground">{stats.pendingApplications} pending applications</p>
                ) : (
                  <p className="text-muted-foreground">No pending applications</p>
                )}
              </Card>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Manage Users</h3>
                  <p className="text-sm text-muted-foreground mb-4">View and manage all members</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/panel/users")}>View Users</Button>
                </Card>

                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Generate Certificates</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create and send certificates</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/panel/certificates")}>Manage</Button>
                </Card>

                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Site Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Update logo, colors, content</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/panel/settings")}>Settings</Button>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <SidebarTrigger />
              </div>
              <Outlet />
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
