import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const UserSupportTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    fetchTicket();
    fetchMessages();

    const subscription = supabase
      .channel(`ticket_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${id}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, user]);

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id, subject, status, created_at')
      .eq('id', id!)
      .maybeSingle();

    if (error || !data) {
      toast({ title: 'Error', description: 'Ticket not found or access denied', variant: 'destructive' });
      navigate('/user/dashboard/support');
      return;
    }

    setTicket(data);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('id, message, is_admin, created_at')
      .eq('ticket_id', id!)
      .order('created_at');

    if (!error) setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!id || !newMessage.trim() || !user) return;

    const { error } = await supabase.from('support_messages').insert({
      ticket_id: id,
      sender_id: user.id,
      message: newMessage.trim(),
      is_admin: false,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      return;
    }

    setNewMessage("");
    fetchMessages();
  };

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ticket: {ticket.subject}</CardTitle>
            <CardDescription>
              <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'in-progress' ? 'secondary' : 'outline'}>
                {ticket.status.replace('_', '-')}
              </Badge>
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/user/dashboard/support')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[420px] overflow-y-auto space-y-4 p-4 border rounded">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${msg.is_admin ? 'bg-muted' : 'bg-primary text-primary-foreground ml-auto'} max-w-[80%]`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground">No messages yet. Start the conversation below.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
            <Button onClick={sendMessage} variant="cta" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSupportTicketDetail;
