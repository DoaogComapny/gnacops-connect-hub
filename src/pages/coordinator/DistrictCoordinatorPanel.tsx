import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDistrictCoordinatorAuth } from "@/hooks/useDistrictCoordinatorAuth";
import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  School,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DistrictCoordinatorPanel = () => {
  const { user, loading } = useDistrictCoordinatorAuth();
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
      path: "/coordinator/district/dashboard",
    },
    {
      title: "All Schools",
      icon: School,
      path: "/coordinator/district/schools",
    },
    {
      title: "Payments & Renewals",
      icon: DollarSign,
      path: "/coordinator/district/payments",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/coordinator/district/reports",
    },
    {
      title: "My Account",
      icon: User,
      path: "/coordinator/district/account",
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
                District Coordinator
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
              GNACOPS District Coordinator
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

export default DistrictCoordinatorPanel;
