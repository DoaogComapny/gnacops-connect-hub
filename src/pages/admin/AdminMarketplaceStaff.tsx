import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Ban } from 'lucide-react';
import { useState } from 'react';

const MARKETPLACE_PERMISSIONS = [
  'manage_vendors',
  'manage_products',
  'manage_orders',
  'manage_delivery',
  'manage_payments',
  'manage_marketing',
  'view_reports',
];

export default function AdminMarketplaceStaff() {
  const queryClient = useQueryClient();
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    full_name: '',
    role: '',
    permissions: [] as string[],
  });

  const { data: staff, isLoading } = useQuery({
    queryKey: ['marketplace-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_staff')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addStaff = useMutation({
    mutationFn: async () => {
      // First create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStaff.email,
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            full_name: newStaff.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create marketplace staff record
      const { error } = await supabase
        .from('marketplace_staff')
        .insert({
          user_id: authData.user.id,
          role: newStaff.role,
          permissions: newStaff.permissions,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-staff'] });
      toast.success('Staff member added successfully');
      setShowAddStaffDialog(false);
      setNewStaff({ email: '', full_name: '', role: '', permissions: [] });
    },
    onError: (error) => {
      toast.error('Failed to add staff member: ' + error.message);
    },
  });

  const suspendStaff = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from('marketplace_staff')
        .update({ is_active: false })
        .eq('id', staffId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-staff'] });
      toast.success('Staff member suspended');
    },
  });

  const togglePermission = (permission: string) => {
    setNewStaff((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (isLoading) {
    return <div className="p-6">Loading marketplace staff...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace Staff</h1>
          <p className="text-muted-foreground">Manage marketplace staff members and permissions</p>
        </div>
        <Button onClick={() => setShowAddStaffDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user_id.substring(0, 8)}...</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {Array.isArray(member.permissions) ? member.permissions.length : 0} permissions
                  </TableCell>
                  <TableCell>
                    {member.is_active && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => suspendStaff.mutate(member.id)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!staff || staff.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No staff members yet
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Marketplace Staff Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={newStaff.full_name}
                onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketplace_manager">Marketplace Manager</SelectItem>
                  <SelectItem value="vendor_coordinator">Vendor Coordinator</SelectItem>
                  <SelectItem value="order_manager">Order Manager</SelectItem>
                  <SelectItem value="delivery_coordinator">Delivery Coordinator</SelectItem>
                  <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                {MARKETPLACE_PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={newStaff.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label htmlFor={permission} className="text-sm">
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => addStaff.mutate()}
              disabled={!newStaff.email || !newStaff.full_name || !newStaff.role}
            >
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
