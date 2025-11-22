import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Settings,
  User,
  LogOut,
  School,
  CheckCircle,
  DollarSign,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Shield
} from "lucide-react";
import { useDepartmentAuth } from "@/hooks/useDepartmentAuth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebarHeader } from "@/components/admin/AdminSidebarHeader";

const departmentMenus: Record<string, any[]> = {
  CPDU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/cpdu" },
    { title: "Policy Management", icon: FileText, path: "/office/department/cpdu/policies" },
    { title: "Stakeholder Collaboration", icon: Users, path: "/office/department/cpdu/stakeholders" },
    { title: "Implementation Tracking", icon: TrendingUp, path: "/office/department/cpdu/tracking" },
    { title: "Internal Memos", icon: MessageSquare, path: "/office/department/cpdu/memos" },
    { title: "Gov Directives", icon: Shield, path: "/office/department/cpdu/directives" },
  ],
  ESCU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/escu" },
    { title: "Standards Monitoring", icon: CheckCircle, path: "/office/department/escu/monitoring" },
    { title: "School Inspections", icon: School, path: "/office/department/escu/inspections" },
    { title: "Compliance Checker", icon: Shield, path: "/office/department/escu/compliance" },
    { title: "Inspection Reports", icon: FileText, path: "/office/department/escu/reports" },
    { title: "School Ratings", icon: TrendingUp, path: "/office/department/escu/ratings" },
  ],
  FSDSU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/fsdsu" },
    { title: "Grant Applications", icon: DollarSign, path: "/office/department/fsdsu/grants" },
    { title: "Financial Resources", icon: FileText, path: "/office/department/fsdsu/resources" },
    { title: "Partnerships", icon: Users, path: "/office/department/fsdsu/partnerships" },
    { title: "Financial Reports", icon: TrendingUp, path: "/office/department/fsdsu/reports" },
  ],
  CSEDU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/csedu" },
    { title: "Curriculum Resources", icon: BookOpen, path: "/office/department/csedu/curriculum" },
    { title: "Assessment Tools", icon: CheckCircle, path: "/office/department/csedu/assessments" },
    { title: "Training Programs", icon: Users, path: "/office/department/csedu/training" },
    { title: "Resource Library", icon: FileText, path: "/office/department/csedu/library" },
  ],
  RISEU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/riseu" },
    { title: "Research Projects", icon: Lightbulb, path: "/office/department/riseu/research" },
    { title: "Innovation Hub", icon: TrendingUp, path: "/office/department/riseu/innovation" },
    { title: "Stakeholder Engagement", icon: Users, path: "/office/department/riseu/engagement" },
    { title: "EduTech Integration", icon: BookOpen, path: "/office/department/riseu/edutech" },
  ],
  SSAU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/ssau" },
    { title: "Support Cases", icon: MessageSquare, path: "/office/department/ssau/cases" },
    { title: "Dispute Resolution", icon: Shield, path: "/office/department/ssau/disputes" },
    { title: "Health Programs", icon: CheckCircle, path: "/office/department/ssau/health" },
    { title: "Legal Support", icon: FileText, path: "/office/department/ssau/legal" },
    { title: "Counseling Services", icon: Users, path: "/office/department/ssau/counseling" },
  ],
  PECU: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/office/department/pecu" },
    { title: "Compliance Monitoring", icon: Shield, path: "/office/department/pecu/monitoring" },
    { title: "Irregularity Reports", icon: FileText, path: "/office/department/pecu/reports" },
    { title: "Stakeholder Education", icon: BookOpen, path: "/office/department/pecu/education" },
    { title: "Enforcement Actions", icon: CheckCircle, path: "/office/department/pecu/enforcement" },
  ],
};

const departmentNames: Record<string, string> = {
  CPDU: "Coordination & Policy Development Unit",
  ESCU: "Educational Standards & Compliance Unit",
  FSDSU: "Financial Sustainability & Development Support Unit",
  CSEDU: "Curriculum Standardization & Educational Development Unit",
  RISEU: "Research, Innovation & Stakeholder Engagement Unit",
  SSAU: "Support Services & Advocacy Unit",
  PECU: "Private Education & Compliance Unit",
};

const DepartmentPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDepartmentStaff, departmentData, loading } = useDepartmentAuth();
  const { signOut } = useAuth();

  const departmentCode = departmentData?.department || '';
  const menuItems = departmentMenus[departmentCode] || [];
  const departmentName = departmentNames[departmentCode] || 'Department';

  const isDashboard = location.pathname === `/office/department/${departmentCode.toLowerCase()}`;

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

  if (!isDepartmentStaff || !departmentCode) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background/95 to-accent/5">
        <Sidebar className="border-r border-card-border bg-card/50 backdrop-blur-sm">
          <AdminSidebarHeader />
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-4">
                {departmentName}
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
            <Outlet context={{ departmentCode, departmentName }} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DepartmentPanel;
