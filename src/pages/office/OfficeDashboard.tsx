import { useState, useEffect } from "react";
import { Building2, CheckSquare, FileText, Calendar, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function OfficeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalDepartments: 0,
    myTasks: 0,
    pendingTasks: 0,
    documents: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchDashboardData();
      } else {
        setDataLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    
    setDataLoading(true);
    try {
      // Fetch stats
      const [deptResult, tasksResult, docsResult, myTasksResult] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id),
      ]);

      setStats({
        totalDepartments: deptResult.count || 0,
        myTasks: myTasksResult.count || 0,
        pendingTasks: tasksResult.count || 0,
        documents: docsResult.count || 0,
      });

      // Fetch recent tasks without relationships (to avoid foreign key errors)
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentTasks(tasks || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast, just log it
    } finally {
      setDataLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the office dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Office Management Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage departments, tasks, documents, and meetings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats.totalDepartments}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary/50" />
          </div>
          <Link to="/admin/panel/office-management/departments">
            <p className="text-sm text-accent hover:underline mt-3">View all →</p>
          </Link>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Tasks</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.myTasks}</p>
            </div>
            <CheckSquare className="h-10 w-10 text-blue-500/50" />
          </div>
          <Link to="/admin/panel/office-management/tasks">
            <p className="text-sm text-accent hover:underline mt-3">Manage tasks →</p>
          </Link>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingTasks}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-500/50" />
          </div>
        </Card>

        <Card className="p-6 hover-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Documents</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.documents}</p>
            </div>
            <FileText className="h-10 w-10 text-purple-500/50" />
          </div>
          <Link to="/admin/panel/office-management/documents">
            <p className="text-sm text-accent hover:underline mt-3">View library →</p>
          </Link>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            My Recent Tasks
          </h2>
          <Link to="/admin/panel/office-management/tasks">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">
              View All
            </Badge>
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description || 'No description'}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/panel/office-management/departments">
          <Card className="p-6 hover-card cursor-pointer">
            <Building2 className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Manage Departments</h3>
            <p className="text-sm text-muted-foreground">
              Organize units and assign department heads
            </p>
          </Card>
        </Link>

        <Link to="/admin/panel/office-management/tasks">
          <Card className="p-6 hover-card cursor-pointer">
            <CheckSquare className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Task Management</h3>
            <p className="text-sm text-muted-foreground">
              Create and track tasks across departments
            </p>
          </Card>
        </Link>

        <Link to="/admin/panel/office-management/documents">
          <Card className="p-6 hover-card cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Document Center</h3>
            <p className="text-sm text-muted-foreground">
              Upload and manage organizational documents
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
