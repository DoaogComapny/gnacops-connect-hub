import { useState } from "react";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  description: string;
  createdDate: string;
  lastUpdate: string;
  replies?: number;
}

const UserSupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TICKET-001",
      subject: "Certificate Download Issue",
      category: "technical",
      status: "in-progress",
      priority: "high",
      description: "Unable to download my membership certificate",
      createdDate: "2025-01-15",
      lastUpdate: "2025-01-16",
      replies: 2,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const ticket: Ticket = {
      id: `TICKET-${String(tickets.length + 1).padStart(3, "0")}`,
      ...newTicket,
      status: "open",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdate: new Date().toISOString().split("T")[0],
      replies: 0,
    };

    setTickets([ticket, ...tickets]);
    setIsCreateDialogOpen(false);
    setNewTicket({ subject: "", category: "", priority: "medium", description: "" });
    
    toast({
      title: "Ticket Created",
      description: `Your support ticket ${ticket.id} has been created successfully`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in-progress":
        return "secondary";
      case "resolved":
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage your support requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="cta">
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="account">Account Management</SelectItem>
                      <SelectItem value="certificate">Certificate Issues</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewTicket({ ...newTicket, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === "open").length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === "in-progress").length}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{tickets.filter(t => t.status === "resolved").length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{tickets.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-6 hover-card cursor-pointer transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1 capitalize">{ticket.status.replace("-", " ")}</span>
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>ID: {ticket.id}</span>
                  <span>•</span>
                  <span>Created: {ticket.createdDate}</span>
                  <span>•</span>
                  <span>Updated: {ticket.lastUpdate}</span>
                  {ticket.replies && ticket.replies > 0 && (
                    <>
                      <span>•</span>
                      <span>{ticket.replies} replies</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserSupportTickets;
