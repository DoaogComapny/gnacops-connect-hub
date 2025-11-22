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
import { getAllRegions, getDistrictsByRegion } from "@/data/ghanaRegions";

interface Coordinator {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  region: string | null;
  district: string | null;
  created_at: string;
}

const AdminDistrictCoordinators = () => {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const regions = getAllRegions();
  const districts = selectedRegion ? getDistrictsByRegion(selectedRegion) : [];

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      // Fetch staff assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("staff_assignments")
        .select("id, user_id, region, district, created_at")
        .eq("role", "district_coordinator")
        .order("created_at", { ascending: false });

      if (assignmentsError) throw assignmentsError;

      if (!assignments || assignments.length === 0) {
        setCoordinators([]);
        return;
      }

      // Fetch profiles for these users
      const userIds = assignments.map((a) => a.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      const formattedData = assignments.map((a) => {
        const profile = profilesMap.get(a.user_id);
        return {
          id: a.id,
          user_id: a.user_id,
          email: profile?.email || "N/A",
          full_name: profile?.full_name || "Unknown",
          region: a.region,
          district: a.district,
          created_at: a.created_at,
        };
      });

      setCoordinators(formattedData);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      toast.error("Failed to fetch district coordinators");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoordinator = async () => {
    if (!email || !fullName || !selectedRegion || !selectedDistrict || !password || !confirmPassword) {
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

    // Check if email already exists in coordinators
    const existingCoordinator = coordinators.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    if (existingCoordinator) {
      toast.error(`The email "${email}" is already assigned to ${existingCoordinator.full_name}`);
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-staff", {
        body: {
          email,
          fullName,
          role: "district_coordinator",
          password: password,
          region: selectedRegion,
          district: selectedDistrict,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create coordinator");
      }

      if (data?.error) {
        // Provide user-friendly error messages
        if (data.error.includes('already exists') || data.error.includes('already been registered')) {
          throw new Error(`The email "${email}" is already registered in the system. Please use a different email address.`);
        }
        throw new Error(data.error);
      }

      toast.success(`District coordinator "${fullName}" added successfully!`);
      setIsAddDialogOpen(false);
      resetForm();
      await fetchCoordinators();
    } catch (error: any) {
      console.error("Error adding coordinator:", error);
      const errorMessage = error.message || "Failed to add district coordinator";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoordinator = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this district coordinator?")) return;

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

      toast.success("District coordinator deleted successfully");
      fetchCoordinators();
    } catch (error) {
      console.error("Error deleting coordinator:", error);
      toast.error("Failed to delete district coordinator");
    }
  };

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setSelectedRegion("");
    setSelectedDistrict("");
  };

  const filteredCoordinators = coordinators.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">District Coordinators</h1>
          <p className="text-muted-foreground">
            Manage district coordinators and their assignments
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add District Coordinator
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search district coordinators..."
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
              <TableHead>District</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoordinators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No district coordinators found
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
                    <Badge variant="outline">{coordinator.district}</Badge>
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
            <DialogTitle>Add District Coordinator</DialogTitle>
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
              <Label htmlFor="region">Select Region *</Label>
              <Select
                value={selectedRegion}
                onValueChange={(value) => {
                  setSelectedRegion(value);
                  setSelectedDistrict("");
                }}
              >
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
            </div>

            {selectedRegion && (
              <div className="space-y-2">
                <Label htmlFor="district">Select District *</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This coordinator will have read-only access to all schools in this district
                </p>
              </div>
            )}

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
                Add District Coordinator
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDistrictCoordinators;
