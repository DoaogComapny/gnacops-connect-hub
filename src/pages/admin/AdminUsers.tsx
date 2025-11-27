import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Filter, MoreVertical, UserCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Loader2 } from "lucide-react";

interface UserWithStats {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  memberships: any[];
  user_roles?: Array<{ role: string }>;
  staff_assignments?: Array<{ role: string; region?: string; district?: string }>;
  department_staff_assignments?: Array<{ department_code: string; role: string }>;
  isUser?: boolean;
  isStaff?: boolean;
}

interface FormStats {
  category_id: string;
  category_name: string;
  user_count: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [formStats, setFormStats] = useState<FormStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithStats | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { logAudit } = useAuditLog();

  useEffect(() => {
    fetchUsers();
    fetchFormStats();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with memberships
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          memberships (
            gnacops_id,
            status,
            category_id,
            form_categories (name, type)
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch all user roles
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch all staff assignments
      const { data: staffAssignmentsData } = await supabase
        .from('staff_assignments')
        .select('user_id, role, region, district');

      // Fetch all department staff assignments
      const { data: deptAssignmentsData } = await supabase
        .from('department_staff_assignments')
        .select('user_id, department_code, role');

      // Create maps for quick lookup
      const rolesMap = new Map<string, Array<{ role: string }>>();
      userRolesData?.forEach((ur: any) => {
        if (!rolesMap.has(ur.user_id)) {
          rolesMap.set(ur.user_id, []);
        }
        rolesMap.get(ur.user_id)!.push({ role: ur.role });
      });

      const staffAssignmentsMap = new Map<string, Array<{ role: string; region?: string; district?: string }>>();
      staffAssignmentsData?.forEach((sa: any) => {
        if (!staffAssignmentsMap.has(sa.user_id)) {
          staffAssignmentsMap.set(sa.user_id, []);
        }
        staffAssignmentsMap.get(sa.user_id)!.push({
          role: sa.role,
          region: sa.region,
          district: sa.district
        });
      });

      const deptAssignmentsMap = new Map<string, Array<{ department_code: string; role: string }>>();
      deptAssignmentsData?.forEach((da: any) => {
        if (!deptAssignmentsMap.has(da.user_id)) {
          deptAssignmentsMap.set(da.user_id, []);
        }
        deptAssignmentsMap.get(da.user_id)!.push({
          department_code: da.department_code,
          role: da.role
        });
      });

      // Classify each profile as user or staff
      const classifiedProfiles = (profilesData || []).map((profile: any) => {
        const hasMemberships = profile.memberships && profile.memberships.length > 0;
        
        const userRoles = rolesMap.get(profile.id) || [];
        // Check if user has staff roles (non-user roles)
        const staffRoles = userRoles.filter((r: any) => 
          r.role !== 'user' && r.role !== 'admin' && r.role !== 'super_admin'
        );
        
        const staffAssignments = staffAssignmentsMap.get(profile.id) || [];
        const departmentAssignments = deptAssignmentsMap.get(profile.id) || [];
        
        const hasStaffAssignments = staffAssignments.length > 0;
        const hasDepartmentAssignments = departmentAssignments.length > 0;
        
        // User: has memberships (signed up via membership forms)
        // Staff: has staff roles/assignments but no memberships
        const isUser = hasMemberships;
        const isStaff = !hasMemberships && (staffRoles.length > 0 || hasStaffAssignments || hasDepartmentAssignments);

        return {
          ...profile,
          user_roles: userRoles,
          staff_assignments: staffAssignments,
          department_staff_assignments: departmentAssignments,
          isUser,
          isStaff
        };
      });

      setUsers(classifiedProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users and staff');
    }
  };

  const fetchFormStats = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        category_id,
        form_categories!inner (
          id,
          name
        )
      `);

    if (error) {
      console.error('Error fetching form stats:', error);
      return;
    }

    // Count users per category
    const statsMap = new Map<string, { name: string; count: number }>();
    
    data?.forEach((item: any) => {
      const categoryId = item.category_id;
      const categoryName = item.form_categories?.name || 'Unknown';
      
      if (statsMap.has(categoryId)) {
        statsMap.get(categoryId)!.count++;
      } else {
        statsMap.set(categoryId, { name: categoryName, count: 1 });
      }
    });

    const stats = Array.from(statsMap.entries()).map(([id, data]) => ({
      category_id: id,
      category_name: data.name,
      user_count: data.count
    }));

    setFormStats(stats);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by account type (Users vs Staff)
    if (selectedType === 'users') {
      return matchesSearch && user.isUser;
    }
    
    if (selectedType === 'staff') {
      return matchesSearch && user.isStaff;
    }
    
    // Filter by membership type (for users only)
    if (selectedType !== 'all' && selectedType !== 'users' && selectedType !== 'staff') {
      return matchesSearch && user.isUser && user.memberships?.some((m: any) => 
        m.form_categories?.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    return matchesSearch;
  });

  // Calculate dynamic total based on current filter
  const getDisplayTotal = () => {
    if (selectedType === 'users') {
      return users.filter(u => u.isUser).length;
    }
    if (selectedType === 'staff') {
      return users.filter(u => u.isStaff).length;
    }
    if (selectedType !== 'all' && selectedType !== 'users' && selectedType !== 'staff') {
      return users.filter(user => 
        user.isUser && user.memberships?.some((m: any) => 
          m.form_categories?.type.toLowerCase() === selectedType.toLowerCase()
        )
      ).length;
    }
    return users.length;
  };

  const displayTotal = getDisplayTotal();
  
  // Get counts for stats
  const userCount = users.filter(u => u.isUser).length;
  const staffCount = users.filter(u => u.isStaff).length;

  const handleEditUser = (user: UserWithStats) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name || '',
      email: user.email || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    if (!editFormData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsSaving(true);
    try {
      const oldData = {
        full_name: editingUser.full_name,
        email: editingUser.email
      };

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editFormData.full_name.trim() })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Note: Email changes require admin privileges and should be done via edge function
      // For now, we only update the profile. Email changes should be handled separately
      if (editFormData.email !== editingUser.email) {
        toast.warning('Email changes require admin privileges. Please use the Supabase dashboard or an edge function to update email addresses.');
      }

      // Log the update
      await logAudit({
        action: 'update_user',
        entityType: 'profile',
        entityId: editingUser.id,
        oldData,
        newData: {
          full_name: editFormData.full_name.trim(),
          email: editFormData.email.trim()
        }
      });

      toast.success('User updated successfully');
      setEditDialogOpen(false);
      setEditingUser(null);
      
      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Delete user profile (this should cascade to related records)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      // Log the deletion
      await logAudit({
        action: 'delete_user',
        entityType: 'profile',
        entityId: userToDelete.id,
        oldData: { email: userToDelete.email, full_name: userToDelete.full_name }
      });

      toast.success('User deleted successfully');
      
      // Refresh the users list
      fetchUsers();
      fetchFormStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users & Staff Management</h1>
          <p className="text-muted-foreground">Manage all registered users and staff members</p>
        </div>
        <Button variant="cta">
          <Users className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <UserCheck className="h-12 w-12 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-4xl font-bold text-primary">{userCount}</p>
              <p className="text-xs text-muted-foreground">Membership signups</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-4">
            <Briefcase className="h-12 w-12 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-4xl font-bold text-blue-600">{staffCount}</p>
              <p className="text-xs text-muted-foreground">Coordinators, Secretaries, etc.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-4">
            <Users className="h-12 w-12 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedType === 'all' ? 'Total Accounts' : 
                 selectedType === 'users' ? 'Filtered Users' :
                 selectedType === 'staff' ? 'Filtered Staff' :
                 `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Members`}
              </p>
              <p className="text-4xl font-bold text-green-600">{displayTotal}</p>
              <p className="text-xs text-muted-foreground">Current filter</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Form Statistics - Only show for Users */}
      {selectedType === 'all' || selectedType === 'users' || (selectedType !== 'staff' && selectedType !== 'users') ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formStats.map((stat) => (
            <Card key={stat.category_id} className="p-6">
              <h3 className="font-semibold mb-2">{stat.category_name}</h3>
              <p className="text-3xl font-bold text-primary">{stat.user_count}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="users">Users Only</SelectItem>
              <SelectItem value="staff">Staff Only</SelectItem>
              <SelectItem value="institutional">Institutional Members</SelectItem>
              <SelectItem value="teacher">Teacher Members</SelectItem>
              <SelectItem value="proprietor">Proprietor Members</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role/Details</TableHead>
              <TableHead>GNACOPS ID(s)</TableHead>
              <TableHead>Membership Types</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                // Get staff roles
                const staffRoles = user.user_roles?.filter((r: any) => 
                  r.role !== 'user' && r.role !== 'admin' && r.role !== 'super_admin'
                ) || [];
                const staffAssignments = user.staff_assignments || [];
                const deptAssignments = user.department_staff_assignments || [];
                
                // Determine role display
                let roleDisplay = 'N/A';
                if (user.isStaff) {
                  if (staffAssignments.length > 0) {
                    const assignment = staffAssignments[0];
                    roleDisplay = `${assignment.role}${assignment.region ? ` (${assignment.region}${assignment.district ? `, ${assignment.district}` : ''})` : ''}`;
                  } else if (deptAssignments.length > 0) {
                    const dept = deptAssignments[0];
                    roleDisplay = `${dept.department_code} - ${dept.role}`;
                  } else if (staffRoles.length > 0) {
                    roleDisplay = staffRoles.map((r: any) => r.role).join(', ');
                  }
                }

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isUser ? (
                        <Badge variant="default" className="bg-primary">User</Badge>
                      ) : user.isStaff ? (
                        <Badge variant="secondary" className="bg-blue-600">Staff</Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isStaff ? (
                        <div className="flex flex-wrap gap-1">
                          {roleDisplay.split(', ').map((role, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.memberships?.length > 0 
                        ? user.memberships.map((m: any) => m.gnacops_id).join(', ')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.memberships?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.memberships.map((m: any, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {m.form_categories?.type || 'Unknown'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            Edit {user.isStaff ? 'Staff' : 'User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete {user.isStaff ? 'Staff' : 'User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-full-name">Full Name</Label>
              <Input
                id="edit-full-name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter email address"
              />
              <p className="text-xs text-muted-foreground">
                Note: Changing email will update the authentication email as well.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {userToDelete?.isStaff ? 'staff member' : 'user'} <strong>{userToDelete?.full_name || userToDelete?.email}</strong> and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
