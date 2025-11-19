import { useState, useEffect } from "react";
import { UserPlus, Trash2, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface StaffMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  roles: { role: string }[];
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  director: "Director",
  head_of_unit: "Head of Unit",
  assistant: "Assistant",
  support_worker: "Support Worker",
  membership_officer: "Membership Officer",
  finance_officer: "Finance Officer",
  secretary: "Secretary",
};

const AdminStaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    fetchStaff();
    fetchPermissions();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      const staffWithRoles = await Promise.all(
        (users || []).map(async (user) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          return {
            ...user,
            user_id: user.id,
            roles: roles || [],
          };
        })
      );

      // Filter for staff roles only (exclude coordinators and regular users)
      const staffOnly = staffWithRoles.filter((s) => {
        const hasStaffRole = s.roles.some((r) => 
          ['admin', 'director', 'head_of_unit', 'assistant', 'support_worker', 'membership_officer', 'finance_officer', 'secretary'].includes(r.role)
        );
        return hasStaffRole;
      });

      setStaff(staffOnly);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions");
    }
  };

  const handleAddStaff = async () => {
    if (!email || !fullName || !selectedRole || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-staff", {
        body: {
          email,
          fullName,
          role: selectedRole,
          password: password,
          permissions: selectedPermissions,
        },
      });

      if (error) throw error;

      toast.success("Staff member added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      console.error("Error adding staff:", error);
      toast.error(error.message || "Failed to add staff member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      toast.success("Staff member deleted successfully");
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member");
    }
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setSelectedRole("");
    setSelectedPermissions([]);
    setEditingStaff(null);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setEmail(member.email);
    setFullName(member.full_name);
    setSelectedRole(member.roles[0]?.role || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !fullName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", editingStaff.user_id);

      if (profileError) throw profileError;

      // Update role if changed
      if (selectedRole && selectedRole !== editingStaff.roles[0]?.role) {
        // Delete old roles
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editingStaff.user_id);

        if (deleteError) throw deleteError;

        // Insert new role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert([{ user_id: editingStaff.user_id, role: selectedRole as any }]);

        if (roleError) throw roleError;
      }

      toast.success("Staff member updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast.error(error.message || "Failed to update staff member");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members and their permissions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((r) => (
                        <Badge key={r.role} variant="secondary">
                          {roleLabels[r.role] || r.role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStaff(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStaff(member.user_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Permissions</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select permissions to grant to this staff member
              </p>
              
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <Card key={module} className="p-4 mb-4">
                  <h3 className="font-semibold mb-3 capitalize">
                    {module.replace(/_/g, " ")} Module
                  </h3>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={perm.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {perm.name}
                          </label>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddStaff} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name *</Label>
              <Input
                id="editFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStaff} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaffManagement;
