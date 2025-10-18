import { useState } from "react";
import { Search, Send, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

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

interface Member {
  id: string;
  gnacopsId: string;
  fullName: string;
  email: string;
  phone: string;
  membershipType: string;
  region: string;
  schoolName: string;
}

const StaffForgotRequests = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ForgotRequest | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [matchedMembers, setMatchedMembers] = useState<Member[]>([]);

  // Mock data for forgot requests
  const [requests, setRequests] = useState<ForgotRequest[]>([
    {
      id: "1",
      fullName: "John Mensah",
      email: "john.mensah@email.com",
      phone: "+233 24 123 4567",
      dateOfBirth: "1985-05-15",
      membershipType: "Teacher Council",
      schoolName: "Accra Primary School",
      region: "Greater Accra",
      requestType: "both",
      status: "pending",
      submittedDate: "2025-10-15",
    },
    {
      id: "2",
      fullName: "Grace Addo",
      email: "grace.addo@email.com",
      phone: "+233 20 987 6543",
      dateOfBirth: "1990-08-22",
      membershipType: "Proprietor",
      schoolName: "Bright Stars Academy",
      region: "Ashanti",
      requestType: "password",
      status: "pending",
      submittedDate: "2025-10-16",
    },
  ]);

  // Mock member database
  const membersDatabase: Member[] = [
    {
      id: "1",
      gnacopsId: "GNC/AM/01/0042",
      fullName: "John Mensah",
      email: "john.mensah@email.com",
      phone: "+233 24 123 4567",
      membershipType: "Teacher Council",
      region: "Greater Accra",
      schoolName: "Accra Primary School",
    },
    {
      id: "2",
      gnacopsId: "GNC/PM/02/0015",
      fullName: "Grace Addo",
      email: "grace.addo@email.com",
      phone: "+233 20 987 6543",
      membershipType: "Proprietor",
      region: "Ashanti",
      schoolName: "Bright Stars Academy",
    },
  ];

  const handleViewRequest = (request: ForgotRequest) => {
    setSelectedRequest(request);
    
    // Search for matching members
    const matches = membersDatabase.filter(
      (member) =>
        member.fullName.toLowerCase().includes(request.fullName.toLowerCase()) ||
        member.email.toLowerCase() === request.email.toLowerCase() ||
        member.phone === request.phone
    );
    
    setMatchedMembers(matches);
    setViewDetailsOpen(true);
  };

  const handleGenerateAndSend = (member: Member) => {
    if (!selectedRequest) return;

    // Update request status
    setRequests(requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: "resolved" }
        : req
    ));

    toast({
      title: "Password Reset Email Sent",
      description: `A new password has been generated and sent to ${member.email}`,
    });

    setViewDetailsOpen(false);
    setSelectedRequest(null);
  };

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
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No requests found
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
                        onClick={() => handleViewRequest(request)}
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

      {/* Request Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details & Member Search</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">Request Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-medium">{selectedRequest.fullName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Membership Type:</span>
                    <p className="font-medium">{selectedRequest.membershipType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">School:</span>
                    <p className="font-medium">{selectedRequest.schoolName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <p className="font-medium">{selectedRequest.region}</p>
                  </div>
                </div>
              </Card>

              <div>
                <h3 className="font-semibold mb-3">Matched Members in Database</h3>
                {matchedMembers.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    No matching members found in the database
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {matchedMembers.map((member) => (
                      <Card key={member.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <Label>GNACOPS ID</Label>
                              <p className="font-mono font-bold text-lg text-accent">
                                {member.gnacopsId}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Name:</span>
                                <p className="font-medium">{member.fullName}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p className="font-medium">{member.email}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Phone:</span>
                                <p className="font-medium">{member.phone}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <p className="font-medium">{member.membershipType}</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleGenerateAndSend(member)}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Generate & Send
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffForgotRequests;
