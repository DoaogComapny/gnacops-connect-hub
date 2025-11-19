import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegionalCoordinatorAuth } from "@/hooks/useRegionalCoordinatorAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { BulkActionsToolbar } from "@/components/coordinator/BulkActionsToolbar";

interface School {
  id: string;
  submission_data: any;
  submitted_at: string;
  memberships: {
    gnacops_id: string;
    payment_status: string;
    status: string;
  };
  profiles: {
    status: string;
    paid_until: string;
  };
}

const RegionalSchoolsList = () => {
  const { assignment, error: authError } = useRegionalCoordinatorAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (assignment) {
      fetchSchools();
    }
  }, [assignment]);

  useEffect(() => {
    applyFilters();
  }, [schools, searchTerm, districtFilter, statusFilter, paymentFilter]);

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
          memberships!inner(
            gnacops_id,
            payment_status,
            status
          ),
          profiles!inner(
            status,
            paid_until
          )
        `)
        .eq("submission_data->>region", assignment.region);

      if (error) throw error;

      setSchools(data || []);

      // Extract unique districts
      const uniqueDistricts = Array.from(
        new Set(
          (data || [])
            .map((s: any) => s.submission_data?.district)
            .filter(Boolean)
        )
      ).sort();
      setDistricts(uniqueDistricts);

    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schools];

    if (searchTerm) {
      filtered = filtered.filter((school) => {
        const data = school.submission_data;
        const searchLower = searchTerm.toLowerCase();
        return (
          data?.schoolName?.toLowerCase().includes(searchLower) ||
          data?.district?.toLowerCase().includes(searchLower) ||
          school.memberships?.[0]?.gnacops_id?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (districtFilter !== "all") {
      filtered = filtered.filter(
        (s) => s.submission_data?.district === districtFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => {
        const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        return profile?.status === statusFilter;
      });
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((s) => {
        const membership = Array.isArray(s.memberships) ? s.memberships[0] : s.memberships;
        return membership?.payment_status === paymentFilter;
      });
    }

    setFilteredSchools(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending_payment: { variant: "secondary", label: "Pending" },
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

  const handleSelectSchool = (schoolId: string) => {
    const newSelected = new Set(selectedSchools);
    if (newSelected.has(schoolId)) {
      newSelected.delete(schoolId);
    } else {
      newSelected.add(schoolId);
    }
    setSelectedSchools(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSchools.size === filteredSchools.length) {
      setSelectedSchools(new Set());
    } else {
      setSelectedSchools(new Set(filteredSchools.map((s) => s.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-semibold">
          {authError || 'No regional assignment found'}
        </p>
        <p className="text-sm text-muted-foreground">Please contact an administrator</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-accent">All Schools in {assignment.region} Region</h1>
        <p className="text-muted-foreground mt-2">View all institutions across all districts</p>
      </div>

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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

      {selectedSchools.size > 0 && assignment && (
        <BulkActionsToolbar
          selectedSchools={Array.from(selectedSchools)}
          onActionComplete={fetchSchools}
          coordinatorId={assignment.region || ""}
        />
      )}

      <Card className="hover-glow">
        <CardHeader>
          <CardTitle>
            Schools List ({filteredSchools.length} of {schools.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedSchools.size === filteredSchools.length && filteredSchools.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>School Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>GNACOPS Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No schools found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => {
                    const data = school.submission_data;
                    const membership = Array.isArray(school.memberships) ? school.memberships[0] : school.memberships;
                    const profile = Array.isArray(school.profiles) ? school.profiles[0] : school.profiles;

                    return (
                      <TableRow key={school.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedSchools.has(school.id)}
                            onChange={() => handleSelectSchool(school.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{data?.schoolName || "N/A"}</TableCell>
                        <TableCell>{data?.district || "N/A"}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {membership?.gnacops_id || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(profile?.status || "unknown")}</TableCell>
                        <TableCell>{getPaymentBadge(membership?.payment_status || "unknown")}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/coordinator/regional/schools/${school.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalSchoolsList;
