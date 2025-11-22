import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

interface StaffFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  permissions: string[];
}

const membershipRoles = [
  { value: "membership_officer", label: "Membership Officer" },
  { value: "finance_officer", label: "Finance Officer" },
  { value: "support_worker", label: "Support Worker" },
];

const officeManagementRoles = [
  { value: "director", label: "Director" },
  { value: "head_of_unit", label: "Head of Unit" },
  { value: "assistant", label: "Assistant" },
];

const departmentRoles = [
  { value: "CPDU", label: "CPDU - Coordination & Policy Development" },
  { value: "ESCU", label: "ESCU - Educational Standards & Compliance" },
  { value: "FSDSU", label: "FSDSU - Financial Sustainability & Development Support" },
  { value: "CSEDU", label: "CSEDU - Curriculum Standardization & Educational Development" },
  { value: "RISEU", label: "RISEU - Research, Innovation & Stakeholder Engagement" },
  { value: "SSAU", label: "SSAU - Support Services & Advocacy" },
  { value: "PECU", label: "PECU - Private Education & Compliance" },
];

const marketplaceRoles = [
  { value: "marketplace_manager", label: "Marketplace Manager" },
  { value: "vendor_coordinator", label: "Vendor Coordinator" },
  { value: "order_manager", label: "Order Manager" },
  { value: "delivery_coordinator", label: "Delivery Coordinator" },
  { value: "marketing_manager", label: "Marketing Manager" },
];

const MARKETPLACE_PERMISSIONS = [
  { id: 'mp_manage_vendors', code: 'manage_vendors', name: 'Manage Vendors', module: 'marketplace' },
  { id: 'mp_manage_products', code: 'manage_products', name: 'Manage Products', module: 'marketplace' },
  { id: 'mp_manage_orders', code: 'manage_orders', name: 'Manage Orders', module: 'marketplace' },
  { id: 'mp_manage_delivery', code: 'manage_delivery', name: 'Manage Delivery', module: 'marketplace' },
  { id: 'mp_manage_payments', code: 'manage_payments', name: 'Manage Payments', module: 'marketplace' },
  { id: 'mp_manage_marketing', code: 'manage_marketing', name: 'Manage Marketing', module: 'marketplace' },
  { id: 'mp_view_reports', code: 'view_reports', name: 'View Reports', module: 'marketplace' },
];

export default function AdminStaffManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    permissions: [],
  });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch permissions
  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch existing staff
  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const allRoles = [
        ...membershipRoles.map(r => r.value),
        ...officeManagementRoles.map(r => r.value),
        ...departmentRoles.map(r => r.value),
        ...marketplaceRoles.map(r => r.value),
      ] as string[];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          profiles!inner(
            id,
            full_name,
            email,
            created_at
          )
        `);

      if (error) throw error;
      
      // Filter results client-side to match our role list
      const filtered = data?.filter((item: any) => allRoles.includes(item.role));
      return filtered;
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Determine if role is a department role
      const isDepartmentRole = departmentRoles.some(d => d.value === formData.role);
      
      const { data, error } = await supabase.functions.invoke("create-staff", {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          permissions: formData.permissions,
          department: isDepartmentRole ? formData.role : undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff account created successfully",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        permissions: [],
      });

      queryClient.invalidateQueries({ queryKey: ["staff"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff account",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const togglePermission = (permissionCode: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter((p) => p !== permissionCode)
        : [...prev.permissions, permissionCode],
    }));
  };

  // Combine database permissions with marketplace permissions
  const allPermissions = [
    ...(permissions || []),
    ...MARKETPLACE_PERMISSIONS,
  ];

  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage staff accounts with roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Staff Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStaff} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Role / Department</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role or department" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      Membership Roles
                    </div>
                    {membershipRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                      Office Management Roles
                    </div>
                    {officeManagementRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                      Department Roles (with Dashboard Access)
                    </div>
                    {departmentRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                      Marketplace Roles
                    </div>
                    {marketplaceRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Department roles grant access to specific department dashboards
                </p>
              </div>
            </div>

            {groupedPermissions && (
              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <Card key={module}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium capitalize">
                          {module.replace("_", " ")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(
                                permission.code
                              )}
                              onCheckedChange={() =>
                                togglePermission(permission.code)
                              }
                            />
                            <label
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isCreating} className="w-full md:w-auto">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Staff Member
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : staff && staff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member: any) => (
                  <TableRow key={member.user_id}>
                    <TableCell>{member.profiles.full_name}</TableCell>
                    <TableCell>{member.profiles.email}</TableCell>
                    <TableCell className="capitalize">
                      {member.role.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      {new Date(member.profiles.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(member.user_id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No staff members found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
