import { useState } from "react";
import { Users, FileText, Settings, BarChart, Mail, Shield, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Dashboard", icon: BarChart, path: "/admin" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Applications", icon: FileText, path: "/admin/applications" },
  { title: "Staff", icon: Shield, path: "/admin/staff" },
  { title: "Certificates", icon: Shield, path: "/admin/certificates" },
  { title: "Messages", icon: Mail, path: "/admin/messages" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/admin";
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

  const handleLogout = () => {
    navigate("/login");
  };

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
            <Button variant="outline" onClick={handleLogout} className="w-full">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.type}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === "Approved" ? "default" : "secondary"}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate("/admin/applications")}>View</Button>
                            {app.status === "Pending" && (
                              <Button size="sm" variant="cta">Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Manage Users</h3>
                  <p className="text-sm text-muted-foreground mb-4">View and manage all members</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/users")}>View Users</Button>
                </Card>

                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Generate Certificates</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create and send certificates</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/certificates")}>Manage</Button>
                </Card>

                <Card className="p-6 hover-card">
                  <h3 className="font-semibold mb-2">Site Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Update logo, colors, content</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/admin/settings")}>Settings</Button>
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
