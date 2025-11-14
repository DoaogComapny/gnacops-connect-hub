import { useState, useEffect } from "react";
import { Shield, Users, Eye, Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Permission {
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface RolePermission {
  role: string;
  permissions: Permission[];
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin (Executive Director)",
  admin: "Admin",
  director: "Director",
  head_of_unit: "Head of Unit",
  assistant: "Assistant",
  support_worker: "Support Worker",
  membership_officer: "Membership Officer",
  finance_officer: "Finance Officer",
  secretary: "Secretary",
  user: "User",
};

const roleDescriptions: Record<string, string> = {
  super_admin: "Full access to both modules, audit logs, all settings, manage users, assign roles",
  director: "Manage department data, assign staff, view analytics, approve applications, manage staff",
  head_of_unit: "Assign and monitor tasks, upload files, view payments, generate certificates",
  assistant: "Upload docs, manage unit reports, respond to support tickets",
  support_worker: "View tasks, submit updates",
  membership_officer: "Manage member registration, renewals, payments, approve applications, view analytics",
  finance_officer: "Handle reports, budgets, analytics, view payments",
  secretary: "Handle meeting schedules, virtual sessions",
};

export default function AdminRolesManagement() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RolePermission | null>(null);

  useEffect(() => {
    fetchRolePermissions();
  }, []);

  const fetchRolePermissions = async () => {
    try {
      // Get all permissions
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (permError) throw permError;

      // Get role-permission mappings
      const { data: mappings, error: mapError } = await supabase
        .from('role_permissions')
        .select('role, permission_id');

      if (mapError) throw mapError;

      // Group by role
      const roles = ['super_admin', 'admin', 'director', 'head_of_unit', 'assistant', 'support_worker', 'membership_officer', 'finance_officer', 'secretary', 'user'];
      
      const grouped = roles.map(role => ({
        role,
        permissions: permissions?.filter(p => 
          mappings?.some(m => m.role === role && m.permission_id === p.id)
        ) || [],
      }));

      setRolePermissions(grouped);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast.error('Failed to load role permissions');
    } finally {
      setLoading(false);
    }
  };

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'membership':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'office_management':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'both':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Roles & Permissions Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage role-based access control and granular permissions across modules
        </p>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolePermissions.map((rp) => (
              <TableRow key={rp.role}>
                <TableCell className="font-medium">
                  {roleLabels[rp.role] || rp.role}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md">
                  {roleDescriptions[rp.role] || 'No description available'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {rp.permissions.length} permissions
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRole(rp)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* View Role Details Dialog */}
      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {selectedRole && roleLabels[selectedRole.role]}
            </DialogTitle>
            <DialogDescription>
              {selectedRole && roleDescriptions[selectedRole.role]}
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assigned Permissions ({selectedRole.permissions.length})
                </h3>
                <div className="space-y-2">
                  {selectedRole.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No permissions assigned to this role
                    </p>
                  ) : (
                    selectedRole.permissions.map((perm) => (
                      <div
                        key={perm.code}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{perm.name}</p>
                          {perm.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {perm.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={getModuleBadgeColor(perm.module)}
                        >
                          {perm.module === 'both' ? 'All Modules' : 
                           perm.module === 'membership' ? 'Membership' : 
                           'Office Mgmt'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
