import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, MousePointerClick, Eye, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmailAnalytic {
  id: string;
  email_type: string;
  recipient_email: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  bounce_status: string | null;
}

interface Stats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}

export default function SecretaryEmailAnalytics() {
  const [analytics, setAnalytics] = useState<EmailAnalytic[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("email_analytics")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setAnalytics(data || []);

      // Calculate stats
      const totalSent = data?.length || 0;
      const totalOpened = data?.filter((a) => a.opened_at).length || 0;
      const totalClicked = data?.filter((a) => a.clicked_at).length || 0;

      setStats({
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load email analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatEmailType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment_approval":
        return "bg-green-500";
      case "appointment_rejection":
        return "bg-red-500";
      case "appointment_reminder":
        return "bg-blue-500";
      case "welcome":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
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
        <h1 className="text-3xl font-bold text-gradient-accent">Email Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track email engagement and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold">{stats.totalSent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Eye className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opened</p>
              <p className="text-2xl font-bold">{stats.totalOpened}</p>
              <p className="text-xs text-green-500">{stats.openRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MousePointerClick className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicked</p>
              <p className="text-2xl font-bold">{stats.totalClicked}</p>
              <p className="text-xs text-blue-500">{stats.clickRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="text-2xl font-bold">
                {((stats.openRate + stats.clickRate) / 2).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Emails Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No email analytics data available
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.map((analytic) => (
                    <TableRow key={analytic.id}>
                      <TableCell>
                        <Badge className={getTypeColor(analytic.email_type)}>
                          {formatEmailType(analytic.email_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {analytic.recipient_email}
                      </TableCell>
                      <TableCell>
                        {new Date(analytic.sent_at).toLocaleDateString()}{" "}
                        {new Date(analytic.sent_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {analytic.bounce_status ? (
                          <Badge variant="destructive">{analytic.bounce_status}</Badge>
                        ) : (
                          <Badge variant="secondary">Delivered</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {analytic.opened_at ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analytic.clicked_at ? (
                          <span className="text-blue-500">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
