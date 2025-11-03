import { useState, useEffect } from "react";
import { Mail, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminMessages = () => {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ sent: 0, inbox: 0 });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load real data from database - currently empty until implemented
    setStats({ sent: 0, inbox: 0 });
    setRecentMessages([]);
  };

  const handleSendMessage = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });
    setRecipient("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Send notifications and announcements to members</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent Messages</p>
              <p className="text-3xl font-bold text-primary">{stats.sent}</p>
            </div>
            <Send className="h-10 w-10 text-primary/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inbox</p>
              <p className="text-3xl font-bold text-accent">{stats.inbox}</p>
            </div>
            <Inbox className="h-10 w-10 text-accent/50" />
          </div>
        </Card>
      </div>

      {/* Send Message Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Send New Message</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Recipient</label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="institutional">Institutional Members</SelectItem>
                <SelectItem value="teachers">Teacher Council</SelectItem>
                <SelectItem value="proprietors">Proprietors</SelectItem>
                <SelectItem value="parents">Parent Council</SelectItem>
                <SelectItem value="pending">Pending Applications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input 
              placeholder="Enter message subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea 
              placeholder="Type your message here..." 
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button variant="cta" onClick={handleSendMessage} disabled={!recipient || !subject || !message}>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </Card>

      {/* Recent Messages */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        <div className="space-y-4">
          {recentMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages sent yet</p>
            </div>
          ) : (
            recentMessages.map((msg, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover-card">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{msg.subject}</p>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Sent to: {msg.recipient}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminMessages;
