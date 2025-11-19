import { useState, useEffect } from "react";
import { useDistrictCoordinatorAuth } from "@/hooks/useDistrictCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsToolbar } from "@/components/coordinator/BulkActionsToolbar";

interface Assignment {
  region: string;
  district: string;
}

interface School {
  id: string;
  submission_data: any;
  submitted_at: string;
  user_id: string;
  memberships: {
    gnacops_id: string;
    status: string;
    payment_status: string;
  };
  profiles: {
    status: string;
  };
}

const DistrictSchoolsList = () => {
  const { user, assignment, error: assignmentError } = useDistrictCoordinatorAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    if (assignment) {
      fetchSchools();
    }
  }, [assignment]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, paymentFilter, schools]);

  const fetchSchools = async () => {
    if (!assignment) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("form_submissions")
        .select(`
          id,
          submission_data,
          submitted_at,
          user_id,
          memberships!inner(
            gnacops_id,
            status,
            payment_status
          ),
          profiles!inner(
            status
          )
        `)
        .filter("submission_data->>region", "eq", assignment.region)
        .filter("submission_data->>district", "eq", assignment.district)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSchools(data || []);
      setFilteredSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(school => {
        const schoolName = school.submission_data?.schoolName?.toLowerCase() || "";
        const gnacopsId = school.memberships?.gnacops_id?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        return schoolName.includes(searchLower) || gnacopsId.includes(searchLower);
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(school => school.profiles?.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(school => school.memberships?.payment_status === paymentFilter);
    }

    setFilteredSchools(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending_payment: { variant: "secondary", label: "Pending Payment" },
      expired: { variant: "destructive", label: "Expired" },
      inactive: { variant: "outline", label: "Inactive" },
    };

    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      unpaid: { variant: "destructive", label: "Unpaid" },
      pending: { variant: "secondary", label: "Pending" },
    };

    const config = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleToggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const handleToggleAll = () => {
    if (selectedSchools.length === filteredSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(filteredSchools.map(s => s.id));
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedSchools([]);
    fetchSchools();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No district assignment found. Please contact admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">All Schools in My District</h1>
        <p className="text-muted-foreground mt-2">
          {assignment.district}, {assignment.region}
        </p>
      </div>

      {/* Filters */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by school name or GNACOPS ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {user && (
        <BulkActionsToolbar
          selectedSchools={selectedSchools}
          onActionComplete={handleBulkActionComplete}
          coordinatorId={user.id}
        />
      )}

      {/* Schools Table */}
      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>
            Schools List ({filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSchools.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No schools found matching your filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>GNACOPS Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Registration Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.submission_data?.schoolName || "N/A"}
                      </TableCell>
                      <TableCell>{school.memberships?.gnacops_id}</TableCell>
                      <TableCell>
                        {school.submission_data?.category || "Institutional"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(school.profiles?.status || "inactive")}
                      </TableCell>
                      <TableCell>
                        {getPaymentBadge(school.memberships?.payment_status || "unpaid")}
                      </TableCell>
                      <TableCell>
                        {new Date(school.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/coordinator/district/school/${school.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View School
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DistrictSchoolsList;
