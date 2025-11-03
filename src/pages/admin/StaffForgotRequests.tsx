import { useState } from "react";
import { Search, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ForgotRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipType: string;
  schoolName: string;
  region: string;
  requestType: string;
  status: "pending" | "processing" | "resolved";
  submittedDate: string;
}

const StaffForgotRequests = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<ForgotRequest[]>([]);

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.filter(req => req.id !== requestId));
    toast({
      title: "Request Rejected",
      description: "The request has been rejected",
      variant: "destructive",
    });
  };

  const filteredRequests = requests.filter((request) =>
    request.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.phone.includes(searchQuery) ||
    request.membershipType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      processing: "default",
      resolved: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getRequestTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      both: "ID & Password",
      gnacops_id: "GNACOPS ID",
      password: "Password",
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Forgot ID/Password Requests</h1>
        <p className="text-muted-foreground">Manage member recovery requests</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or membership type..."
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
              <TableHead>Phone</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No forgot password/ID requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.fullName}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.phone}</TableCell>
                  <TableCell>{getRequestTypeBadge(request.requestType)}</TableCell>
                  <TableCell>{request.membershipType}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{request.submittedDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={request.status === "resolved"}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={request.status === "resolved"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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

export default StaffForgotRequests;
