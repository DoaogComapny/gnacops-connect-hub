import { useState, useEffect } from "react";
import { MessageSquare, Clock, CheckCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  name: string;
  email: string;
  user_id: string | null;
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  sender_id: string | null;
}

const SecretarySupport = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
    await fetchMessages(ticket.id);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          message: replyText.trim(),
          is_admin: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      setReplyText("");
      await fetchMessages(selectedTicket.id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ticket marked as ${newStatus}`,
      });

      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "secondary",
      in_progress: "default",
      resolved: "outline",
      closed: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-900",
      normal: "bg-gray-100 text-gray-900",
      high: "bg-orange-100 text-orange-900",
    };
    return (
      <Badge className={colors[priority] || colors.normal}>
        {priority}
      </Badge>
    );
  };

  const filterTickets = (status?: string) => {
    if (!status) return tickets;
    return tickets.filter(t => t.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gradient-accent mb-6">Support Tickets</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({filterTickets('open').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({filterTickets('in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({filterTickets('resolved').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="p-6">
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-glow cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <MessageSquare className="h-5 w-5 text-accent mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        From: {ticket.name} ({ticket.email})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="open">
          <Card className="p-6">
            <div className="space-y-4">
              {filterTickets('open').map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-glow cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <MessageSquare className="h-5 w-5 text-accent mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        From: {ticket.name} ({ticket.email})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress">
          <Card className="p-6">
            <div className="space-y-4">
              {filterTickets('in_progress').map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-glow cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <MessageSquare className="h-5 w-5 text-accent mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        From: {ticket.name} ({ticket.email})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card className="p-6">
            <div className="space-y-4">
              {filterTickets('resolved').map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-glow cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <MessageSquare className="h-5 w-5 text-accent mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        From: {ticket.name} ({ticket.email})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    From: {selectedTicket.name} ({selectedTicket.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Conversation</h4>
                <div className="space-y-4 mb-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.is_admin
                          ? "bg-accent/10 ml-8"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {msg.is_admin ? "Secretary" : selectedTicket.name} •{" "}
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Reply</Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSendReply} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "in_progress")}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                  >
                    Close Ticket
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecretarySupport;
