import { useState, useEffect } from "react";
import { FileText, Search, Filter, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  module: string | null;
  created_at: string;
  profiles?: { // Made optional
    full_name: string;
    email: string;
  } | null;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch profile data separately for users
      const userIds = logsData?.map(l => l.user_id).filter(Boolean) || [];
      const uniqueUserIds = [...new Set(userIds)];

      let profilesMap: Record<string, any> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', uniqueUserIds);

        profilesMap = (profilesData || []).reduce((acc, p) => {
          acc[p.id] = { full_name: p.full_name, email: p.email };
          return acc;
        }, {} as Record<string, any>);
      }

      const enrichedLogs = logsData?.map(log => ({
        ...log,
        profiles: log.user_id ? profilesMap[log.user_id] : null,
      })) || [];

      setLogs(enrichedLogs as AuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const getModuleBadge = (module: string | null) => {
    if (!module) return <Badge variant="outline">System</Badge>;
    if (module === 'membership') return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Membership</Badge>;
    if (module === 'office_management') return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Office Mgmt</Badge>;
    return <Badge variant="outline">{module}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground mt-2">
          Track all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, entity, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
              <SelectItem value="office_management">Office Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || moduleFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Audit logs will appear here as actions are performed"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.profiles?.full_name || 'System'}</p>
                      {log.profiles?.email && (
                        <p className="text-xs text-muted-foreground">{log.profiles.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.entity_type}</TableCell>
                  <TableCell>{getModuleBadge(log.module)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.created_at), 'MMMM dd, yyyy HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.profiles?.full_name || 'System'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="text-sm text-muted-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Entity Type</label>
                  <p className="text-sm text-muted-foreground">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Module</label>
                  <div className="mt-1">{getModuleBadge(selectedLog.module)}</div>
                </div>
              </div>

              {selectedLog.old_data && (
                <div>
                  <label className="text-sm font-medium">Old Data</label>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <label className="text-sm font-medium">New Data</label>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
