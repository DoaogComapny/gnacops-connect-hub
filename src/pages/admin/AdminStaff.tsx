import { useState } from "react";
import { UserPlus, Shield, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  addedDate: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: "generate_certificate", name: "Generate Certificate", description: "Can generate and issue certificates" },
  { id: "reply_tickets", name: "Reply to Support Tickets", description: "Can view and respond to support tickets" },
  { id: "manage_users", name: "Manage Users", description: "Can view, edit, and deactivate users" },
  { id: "approve_applications", name: "Approve Applications", description: "Can approve or reject membership applications" },
  { id: "view_payments", name: "View Payments", description: "Can view payment records and transactions" },
  { id: "edit_content", name: "Edit Content", description: "Can edit website content and announcements" },
  { id: "view_analytics", name: "View Analytics", description: "Can access analytics and reports" },
  { id: "manage_staff", name: "Manage Staff", description: "Can add, edit, and remove staff members" },
  { id: "forgot_id_password", name: "Forgot ID and Passwords", description: "Can handle forgot GNACOPS ID and password recovery requests" },
];

const AdminStaff = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@gnacops.com",
      role: "Support Manager",
      permissions: ["reply_tickets", "view_payments"],
      addedDate: "2025-01-10",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "",
    permissions: [] as string[],
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const staffMember: StaffMember = {
      id: Date.now().toString(),
      ...newStaff,
      addedDate: new Date().toISOString().split("T")[0],
    };

    setStaff([...staff, staffMember]);
    setIsAddDialogOpen(false);
    setNewStaff({ name: "", email: "", role: "", permissions: [] });
    
    toast({
      title: "Staff Added",
      description: `${staffMember.name} has been added successfully`,
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    toast({
      title: "Staff Removed",
      description: "Staff member has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members and their permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="cta">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role/Position *</Label>
                <Input
                  id="role"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  placeholder="e.g., Support Manager, Admin Assistant"
                />
              </div>
              <div>
                <Label className="mb-3 block">Permissions</Label>
                <div className="space-y-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={newStaff.permissions.includes(permission.id)}
                        onCheckedChange={() => handleTogglePermission(permission.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                          {permission.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStaff}>Add Staff Member</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permissions Overview */}
      <Card className="p-6 hover-card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Available Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_PERMISSIONS.map((permission) => (
            <div key={permission.id} className="p-4 border rounded-lg">
              <h3 className="font-medium mb-1">{permission.name}</h3>
              <p className="text-sm text-muted-foreground">{permission.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="p-6 hover-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.permissions.map((permId) => {
                      const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                      return perm ? (
                        <Badge key={permId} variant="secondary" className="text-xs">
                          {perm.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </TableCell>
                <TableCell>{member.addedDate}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminStaff;
