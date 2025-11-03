import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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

export default AdminUsers;
