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
import { toast } from 'sonner';
import { Plus, Truck } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketplaceDelivery() {
  const queryClient = useQueryClient();
  const [showAddPersonnelDialog, setShowAddPersonnelDialog] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({
    full_name: '',
    phone: '',
    vehicle_type: '',
    email: '',
  });

  const { data: personnel, isLoading: personnelLoading } = useQuery({
    queryKey: ['delivery-personnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_delivery_personnel')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['delivery-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_delivery_assignments')
        .select('*, marketplace_orders(order_number), marketplace_delivery_personnel(full_name)')
        .order('assigned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addPersonnel = useMutation({
    mutationFn: async () => {
      // First create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newPersonnel.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
        options: {
          data: {
            full_name: newPersonnel.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create delivery personnel record
      const { error } = await supabase
        .from('marketplace_delivery_personnel')
        .insert({
          user_id: authData.user.id,
          full_name: newPersonnel.full_name,
          phone: newPersonnel.phone,
          vehicle_type: newPersonnel.vehicle_type,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-personnel'] });
      toast.success('Delivery personnel added successfully');
      setShowAddPersonnelDialog(false);
      setNewPersonnel({ full_name: '', phone: '', vehicle_type: '', email: '' });
    },
    onError: (error) => {
      toast.error('Failed to add delivery personnel: ' + error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      assigned: 'secondary',
      picked_up: 'default',
      in_transit: 'default',
      delivered: 'default',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (personnelLoading || assignmentsLoading) {
    return <div className="p-6">Loading delivery data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Delivery System</h1>
          <p className="text-muted-foreground">Manage delivery personnel and assignments</p>
        </div>
        <Button onClick={() => setShowAddPersonnelDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Personnel
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Personnel</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deliveries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnel?.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.full_name}</TableCell>
                    <TableCell>{person.phone}</TableCell>
                    <TableCell>{person.vehicle_type}</TableCell>
                    <TableCell>
                      <Badge variant={person.is_active ? 'default' : 'secondary'}>
                        {person.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.successful_deliveries}/{person.total_deliveries}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!personnel || personnel.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No delivery personnel yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Personnel</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.marketplace_orders?.order_number}</TableCell>
                    <TableCell>{assignment.marketplace_delivery_personnel?.full_name}</TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!assignments || assignments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active assignments
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddPersonnelDialog} onOpenChange={setShowAddPersonnelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Delivery Personnel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={newPersonnel.full_name}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newPersonnel.email}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newPersonnel.phone}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select
                value={newPersonnel.vehicle_type}
                onValueChange={(value) => setNewPersonnel({ ...newPersonnel, vehicle_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => addPersonnel.mutate()}
              disabled={!newPersonnel.full_name || !newPersonnel.email || !newPersonnel.phone || !newPersonnel.vehicle_type}
            >
              Add Personnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
