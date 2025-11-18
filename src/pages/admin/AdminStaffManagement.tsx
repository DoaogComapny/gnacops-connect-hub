import { useState, useEffect } from "react";
import { UserPlus, Shield, Trash2, Edit, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllRegions, getDistrictsByRegion } from "@/data/ghanaRegions";

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
  assignment?: {
    region: string | null;
    district: string | null;
  };
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
  district_coordinator: "District Coordinator",
  regional_coordinator: "Regional Coordinator",
  user: "User",
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
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchPermissions();
  }, []);

  const fetchStaff = async () => {
    try {
      // Fetch all users with roles
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

      // Fetch roles for each user
      const staffWithRoles = await Promise.all(
        (users || []).map(async (user) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          const { data: assignment } = await supabase
            .from("staff_assignments")
            .select("region, district")
            .eq("user_id", user.id)
            .single();

          return {
            ...user,
            user_id: user.id,
            roles: roles || [],
            assignment: assignment || undefined,
          };
        })
      );

      // Filter out users with only 'user' role
      const staffOnly = staffWithRoles.filter(
        (s) => s.roles.length > 0 && !s.roles.every((r) => r.role === "user")
      );

      setStaff(staffOnly);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("name");

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleAddStaff = async () => {
    if (!email || !fullName || !selectedRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      (selectedRole === "district_coordinator" && (!selectedRegion || !selectedDistrict)) ||
      (selectedRole === "regional_coordinator" && !selectedRegion)
    ) {
      toast.error("Please select region and district for coordinators");
      return;
    }

    setIsSaving(true);

    try {
      // Call secure edge function to create staff account
      const { data, error: functionError } = await supabase.functions.invoke("create-staff", {
        body: {
          email,
          fullName,
          role: selectedRole,
          region: selectedRegion || null,
          district: selectedDistrict || null,
        },
      });

      if (functionError) throw functionError;

      toast.success("Staff member added successfully. Temporary password sent via email.");
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
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      // Delete roles
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Delete assignments
      await supabase.from("staff_assignments").delete().eq("user_id", userId);

      toast.success("Staff member removed");
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to remove staff member");
    }
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setSelectedRole("");
    setSelectedPermissions([]);
    setSelectedRegion("");
    setSelectedDistrict("");
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsRegionDistrict =
    selectedRole === "district_coordinator" || selectedRole === "regional_coordinator";
  const districts = selectedRegion ? getDistrictsByRegion(selectedRegion) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members, roles, and permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsRegionDistrict && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="region">
                      Region <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllRegions().map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole === "district_coordinator" && (
                    <div className="space-y-2">
                      <Label htmlFor="district">
                        District <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={selectedDistrict}
                        onValueChange={setSelectedDistrict}
                        disabled={!selectedRegion}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddStaff} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Staff Member"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      {member.roles.map((r, idx) => (
                        <Badge key={idx} variant="secondary">
                          {roleLabels[r.role] || r.role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.assignment ? (
                      <div className="text-sm">
                        <div className="font-medium">{member.assignment.region}</div>
                        {member.assignment.district && (
                          <div className="text-muted-foreground">
                            {member.assignment.district}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStaff(member.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminStaffManagement;
