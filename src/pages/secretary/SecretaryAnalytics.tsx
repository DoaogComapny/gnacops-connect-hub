import { useState, useEffect } from "react";
import { BarChart, Users, Calendar, FileText, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalMembers: number;
  totalAppointments: number;
  totalTickets: number;
  totalApplications: number;
  totalCertificates: number;
  appointmentsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  ticketsByStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  recentActivity: {
    newMembers: number;
    newTickets: number;
    newAppointments: number;
  };
}

const SecretaryAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMembers: 0,
    totalAppointments: 0,
    totalTickets: 0,
    totalApplications: 0,
    totalCertificates: 0,
    appointmentsByStatus: { pending: 0, approved: 0, rejected: 0, completed: 0 },
    ticketsByStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    recentActivity: { newMembers: 0, newTickets: 0, newAppointments: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        membersRes,
        appointmentsRes,
        ticketsRes,
        applicationsRes,
        certificatesRes,
        appointmentsPendingRes,
        appointmentsApprovedRes,
        appointmentsRejectedRes,
        appointmentsCompletedRes,
        ticketsOpenRes,
        ticketsInProgressRes,
        ticketsResolvedRes,
        ticketsClosedRes,
        recentMembersRes,
        recentTicketsRes,
        recentAppointmentsRes,
      ] = await Promise.all([
        supabase.from('memberships').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
        supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
        supabase.from('memberships').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      setAnalytics({
        totalMembers: membersRes.count || 0,
        totalAppointments: appointmentsRes.count || 0,
        totalTickets: ticketsRes.count || 0,
        totalApplications: applicationsRes.count || 0,
        totalCertificates: certificatesRes.count || 0,
        appointmentsByStatus: {
          pending: appointmentsPendingRes.count || 0,
          approved: appointmentsApprovedRes.count || 0,
          rejected: appointmentsRejectedRes.count || 0,
          completed: appointmentsCompletedRes.count || 0,
        },
        ticketsByStatus: {
          open: ticketsOpenRes.count || 0,
          in_progress: ticketsInProgressRes.count || 0,
          resolved: ticketsResolvedRes.count || 0,
          closed: ticketsClosedRes.count || 0,
        },
        recentActivity: {
          newMembers: recentMembersRes.count || 0,
          newTickets: recentTicketsRes.count || 0,
          newAppointments: recentAppointmentsRes.count || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gradient-accent mb-6">Analytics Dashboard</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-gradient-accent">
                    {analytics.totalMembers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold text-gradient-accent">
                    {analytics.totalAppointments}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Support Tickets</p>
                  <p className="text-2xl font-bold text-gradient-accent">
                    {analytics.totalTickets}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-gradient-accent">
                    {analytics.totalApplications}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-accent/50" />
              </div>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-2xl font-bold text-gradient-accent">
                    {analytics.totalCertificates}
                  </p>
                </div>
                <Award className="h-8 w-8 text-accent/50" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 hover-glow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Appointments by Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="font-semibold">{analytics.appointmentsByStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved</span>
                <span className="font-semibold">{analytics.appointmentsByStatus.approved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejected</span>
                <span className="font-semibold">{analytics.appointmentsByStatus.rejected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-semibold">{analytics.appointmentsByStatus.completed}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-glow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Support Tickets by Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Open</span>
                <span className="font-semibold">{analytics.ticketsByStatus.open}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <span className="font-semibold">{analytics.ticketsByStatus.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resolved</span>
                <span className="font-semibold">{analytics.ticketsByStatus.resolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Closed</span>
                <span className="font-semibold">{analytics.ticketsByStatus.closed}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 hover-glow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Recent Activity (Last 30 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">New Members</p>
              <p className="text-3xl font-bold text-gradient-accent">
                {analytics.recentActivity.newMembers}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">New Tickets</p>
              <p className="text-3xl font-bold text-gradient-accent">
                {analytics.recentActivity.newTickets}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">New Appointments</p>
              <p className="text-3xl font-bold text-gradient-accent">
                {analytics.recentActivity.newAppointments}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecretaryAnalytics;
