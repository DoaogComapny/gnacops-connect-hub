import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

interface UserWithStats {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  memberships: any[];
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
  const { logAudit } = useAuditLog();

  useEffect(() => {
    fetchUsers();
    fetchFormStats();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data || []);
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
    
    if (selectedType === 'all') return matchesSearch;
    
    return matchesSearch && user.memberships?.some((m: any) => 
      m.form_categories?.type.toLowerCase() === selectedType.toLowerCase()
    );
  });

  // Calculate dynamic total based on current filter
  const displayTotal = selectedType === 'all' 
    ? users.length 
    : users.filter(user => 
        user.memberships?.some((m: any) => 
          m.form_categories?.type.toLowerCase() === selectedType.toLowerCase()
        )
      ).length;

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
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage all registered members</p>
        </div>
        <Button variant="cta">
          <Users className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>

      {/* Dynamic Total Users Display */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <Users className="h-12 w-12 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedType === 'all' ? 'Total Users' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Members`}
            </p>
            <p className="text-4xl font-bold text-primary">{displayTotal}</p>
          </div>
        </div>
      </Card>

      {/* Form Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formStats.map((stat) => (
          <Card key={stat.category_id} className="p-6">
            <h3 className="font-semibold mb-2">{stat.category_name}</h3>
            <p className="text-3xl font-bold text-primary">{stat.user_count}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>
        ))}
      </div>

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
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Membership Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="institutional">Institutional</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="proprietor">Proprietor</SelectItem>
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
              <TableHead>GNACOPS ID(s)</TableHead>
              <TableHead>Membership Types</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.memberships?.map((m: any) => m.gnacops_id).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.memberships?.map((m: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {m.form_categories?.type || 'Unknown'}
                        </Badge>
                      )) || 'None'}
                    </div>
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
                        <DropdownMenuItem onClick={() => {
                          // TODO: Implement edit user functionality
                          console.log('Edit user:', user.id);
                        }}>
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{userToDelete?.full_name || userToDelete?.email}</strong> and all associated data. This action cannot be undone.
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
