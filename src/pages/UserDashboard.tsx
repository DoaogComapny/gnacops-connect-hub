import { useState } from "react";
import { Download, Bell, User, CreditCard, FileText, LogOut, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Overview", icon: User, path: "/dashboard" },
  { title: "My Account", icon: Settings, path: "/dashboard/account" },
  { title: "Payments", icon: CreditCard, path: "/dashboard/payments" },
  { title: "Certificate", icon: FileText, path: "/dashboard/certificate" },
  { title: "Support", icon: MessageSquare, path: "/dashboard/support" },
  { title: "Notifications", icon: Bell, path: "/dashboard/notifications" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [userData] = useState({
    gnacopsId: "GNACOPS251002",
    name: "John Doe",
    email: "john@example.com",
    membershipType: "Institutional Membership",
    membershipPrice: 500,
    status: "Approved",
    paymentStatus: "Unpaid",
  });

  const handlePayNow = () => {
    navigate("/dashboard/payments");
  };

  const handleLogout = () => {
    // Placeholder: Will connect to auth later
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-card-border">
          <div className="p-4 border-b border-card-border">
            <h2 className="text-xl font-bold text-gradient-accent">GNACOPS</h2>
            <p className="text-sm text-muted-foreground">{userData.gnacopsId}</p>
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
                  <h1 className="text-3xl font-bold">Welcome back, {userData.name}!</h1>
                  <p className="text-muted-foreground">Here's your membership overview</p>
                </div>
                <SidebarTrigger />
              </div>

              {/* Overview Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">GNACOPS ID</p>
                      <p className="text-2xl font-bold text-primary">{userData.gnacopsId}</p>
                    </div>
                    <User className="h-10 w-10 text-primary/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Membership Type</p>
                      <p className="text-lg font-semibold text-accent">{userData.membershipType}</p>
                    </div>
                    <FileText className="h-10 w-10 text-accent/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-yellow-600">{userData.status}</p>
                    </div>
                    <Bell className="h-10 w-10 text-yellow-500/50" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment</p>
                      <p className="text-lg font-semibold text-red-600">{userData.paymentStatus}</p>
                    </div>
                    <CreditCard className="h-10 w-10 text-red-500/50" />
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 hover-card">
                  <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                  <p className="text-muted-foreground mb-4">
                    Your membership fee payment is pending. Complete payment to receive your certificate.
                  </p>
                  <Button variant="cta" onClick={handlePayNow} disabled={userData.status === "Pending Approval"}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {userData.status === "Pending Approval" 
                      ? "* Payment will be enabled after admin approval"
                      : `Amount due: GHS ₵${userData.membershipPrice}`
                    }
                  </p>
                </Card>

                <Card className="p-6 hover-card">
                  <h2 className="text-xl font-semibold mb-4">Certificate</h2>
                  <p className="text-muted-foreground mb-4">
                    Your certificate will be available for download after payment is confirmed.
                  </p>
                  <Button variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    * Certificate available after payment
                  </p>
                </Card>
              </div>

              {/* Recent Notifications */}
              <Card className="p-6 mt-6 hover-card">
                <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/5">
                    <Bell className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <p className="font-medium">Application Received</p>
                      <p className="text-sm text-muted-foreground">Your membership application is being reviewed by our admin team.</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>
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

export default UserDashboard;
