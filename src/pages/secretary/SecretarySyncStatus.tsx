import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useSecretaryAuth } from "@/hooks/useSecretaryAuth";

interface SyncLog {
  id: string;
  sync_type: string;
  entity_id: string;
  status: string;
  error_message: string | null;
  google_event_id: string | null;
  synced_at: string | null;
  created_at: string;
}

const SecretarySyncStatus = () => {
  const { toast } = useToast();
  const { user } = useSecretaryAuth();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      toast({
        title: "Error",
        description: "Failed to load sync logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSyncLogs();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Sync logs refreshed",
    });
  };

  const retrySync = async (log: SyncLog) => {
    try {
      if (log.sync_type === 'appointment' && log.entity_id) {
        const { error } = await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'sync_appointment',
            appointmentId: log.entity_id,
          },
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Sync retry initiated",
        });
        
        await fetchSyncLogs();
      }
    } catch (error) {
      console.error('Error retrying sync:', error);
      toast({
        title: "Error",
        description: "Failed to retry sync",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gradient-accent">Sync Status Dashboard</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 hover-glow">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Syncs</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-6 hover-glow">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-3xl font-bold text-green-600">{stats.success}</p>
          </div>
        </Card>
        <Card className="p-6 hover-glow">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </Card>
        <Card className="p-6 hover-glow">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </Card>
      </div>

      {/* Sync Logs Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sync Activity</h2>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sync logs found</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover-glow">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{log.sync_type.replace('_', ' ')}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.error_message && (
                      <p className="text-sm text-red-600 mt-2">{log.error_message}</p>
                    )}
                    {log.google_event_id && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Event ID: {log.google_event_id}
                      </p>
                    )}
                  </div>
                </div>
                {log.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retrySync(log)}
                  >
                    Retry
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecretarySyncStatus;
