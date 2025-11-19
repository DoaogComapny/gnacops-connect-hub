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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllRegions } from "@/data/ghanaRegions";

interface Coordinator {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  region: string | null;
  created_at: string;
}

const AdminRegionalCoordinators = () => {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const regions = getAllRegions();

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from("staff_assignments")
        .select(`
          id,
          user_id,
          region,
          profiles!inner(email, full_name),
          created_at
        `)
        .eq("role", "regional_coordinator")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (assignments || []).map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        email: a.profiles.email,
        full_name: a.profiles.full_name,
        region: a.region,
        created_at: a.created_at,
      }));

      setCoordinators(formattedData);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      toast.error("Failed to fetch regional coordinators");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoordinator = async () => {
    if (!email || !fullName || !selectedRegion) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-staff", {
        body: {
          email,
          fullName,
          role: "regional_coordinator",
          region: selectedRegion,
        },
      });

      if (error) throw error;

      toast.success("Regional coordinator added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchCoordinators();
    } catch (error: any) {
      console.error("Error adding coordinator:", error);
      toast.error(error.message || "Failed to add regional coordinator");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoordinator = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this regional coordinator?")) return;

    try {
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      const { error: assignmentError } = await supabase
        .from("staff_assignments")
        .delete()
        .eq("user_id", userId);

      if (assignmentError) throw assignmentError;

      toast.success("Regional coordinator deleted successfully");
      fetchCoordinators();
    } catch (error) {
      console.error("Error deleting coordinator:", error);
      toast.error("Failed to delete regional coordinator");
    }
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setSelectedRegion("");
  };

  const filteredCoordinators = coordinators.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Regional Coordinators</h1>
          <p className="text-muted-foreground">
            Manage regional coordinators and their assignments
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Regional Coordinator
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regional coordinators..."
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
              <TableHead>Region</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoordinators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No regional coordinators found
                </TableCell>
              </TableRow>
            ) : (
              filteredCoordinators.map((coordinator) => (
                <TableRow key={coordinator.id}>
                  <TableCell className="font-medium">{coordinator.full_name}</TableCell>
                  <TableCell>{coordinator.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{coordinator.region}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(coordinator.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCoordinator(coordinator.user_id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Regional Coordinator</DialogTitle>
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

            <div className="space-y-2">
              <Label htmlFor="region">Assign Region *</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This coordinator will have read-only access to all schools in this region
              </p>
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
              <Button onClick={handleAddCoordinator} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Regional Coordinator
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegionalCoordinators;
