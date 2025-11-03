import { useState, useEffect } from "react";
import { Users, FileText, Settings, BarChart, Mail, Shield, LogOut, Menu, MapPin, KeyRound, LayoutDashboard, Globe, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Applications", icon: FileText, path: "/admin/panel/applications" },
  { title: "Users", icon: Users, path: "/admin/panel/users" },
  { title: "Staff", icon: Shield, path: "/admin/panel/staff" },
  { title: "Schools", icon: MapPin, path: "/admin/panel/schools-view" },
  { title: "Certificates", icon: Shield, path: "/admin/panel/certificates" },
  { title: "Messages", icon: Mail, path: "/admin/panel/messages" },
  { title: "Support", icon: HelpCircle, path: "/admin/panel/support" },
  { title: "Form Builder", icon: LayoutDashboard, path: "/admin/panel/form-builder" },
  { title: "Web Settings", icon: Globe, path: "/admin/panel/web-settings" },
  { title: "Settings", icon: Settings, path: "/admin/panel/settings" },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();
  const isDashboard = location.pathname === "/admin/panel";
  
  // All useState hooks MUST come before any conditional returns
  const [stats] = useState({
    totalMembers: 245,
    pendingApplications: 12,
    totalRevenue: "GHS 123,450",
    activeUsers: 198,
  });

  const [recentApplications] = useState([
    { id: 1, name: "John Doe", type: "Institutional", status: "Pending", date: "2025-01-15" },
    { id: 2, name: "Jane Smith", type: "Teacher Council", status: "Approved", date: "2025-01-14" },
    { id: 3, name: "Bob Johnson", type: "Proprietor", status: "Pending", date: "2025-01-13" },
  ]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
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
          <div className="p-4 border-b border-card-border">
            <h2 className="text-xl font-bold text-gradient-accent">GNACOPS Admin</h2>
            <p className="text-sm text-muted-foreground">Control Panel</p>
          </div>
          
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

              {/* Recent Applications */}
              <Card className="p-6 hover-card">
                <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
                {/* Application table will be populated from database */}
                <p className="text-muted-foreground">Recent applications will appear here</p>
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
