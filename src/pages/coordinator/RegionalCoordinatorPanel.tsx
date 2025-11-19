import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  School,
  Users,
  MapPin,
  DollarSign,
  BarChart3,
  FileText,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RegionalCoordinatorPanel = () => {
  const { user, loading } = useRegionalCoordinatorAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/coordinator/regional/dashboard",
    },
    {
      title: "District Coordinators",
      icon: Users,
      path: "/coordinator/regional/coordinators",
    },
    {
      title: "All Schools",
      icon: School,
      path: "/coordinator/regional/schools",
    },
    {
      title: "Districts Overview",
      icon: MapPin,
      path: "/coordinator/regional/districts",
    },
    {
      title: "Payments & Renewals",
      icon: DollarSign,
      path: "/coordinator/regional/payments",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/coordinator/regional/reports",
    },
    {
      title: "My Account",
      icon: User,
      path: "/coordinator/regional/account",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gradient-accent">
                Regional Coordinator
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={location.pathname === item.path}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-gradient-accent">
              GNACOPS Regional Coordinator
            </h1>
          </div>
          
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionalCoordinatorPanel;
