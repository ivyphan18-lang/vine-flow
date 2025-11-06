import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText
} from "lucide-react";
import { getUserRole, getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/auth";

const Dashboard = () => {
  const [role, setRole] = useState<UserRole>('staff');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    todayAttendance: false,
    leaveBalance: 12,
    upcomingMeetings: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const userRole = await getUserRole(user.id);
      setRole(userRole);

      // Load stats based on role
      if (userRole === 'staff') {
        await loadStaffStats(user.id);
      } else if (userRole === 'leader') {
        await loadLeaderStats(user.id);
      } else if (userRole === 'admin') {
        await loadAdminStats();
      }
    };
    loadDashboard();
  }, []);

  const loadStaffStats = async (userId: string) => {
    // Load tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('assignee_id', userId);

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;

    // Check today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', `${today}T00:00:00`)
      .eq('type', 'check_in')
      .limit(1);

    // Load profile for leave balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('annual_leave_balance')
      .eq('id', userId)
      .single();

    // Load upcoming meetings
    const { data: meetings } = await supabase
      .from('room_bookings')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .limit(5);

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      todayAttendance: (attendance?.length || 0) > 0,
      leaveBalance: profile?.annual_leave_balance || 12,
      upcomingMeetings: meetings?.length || 0
    });
  };

  const loadLeaderStats = async (userId: string) => {
    // Similar to staff but for team
    loadStaffStats(userId);
  };

  const loadAdminStats = async () => {
    // Load company-wide stats
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status');

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;

    setStats(prev => ({
      ...prev,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks
    }));
  };

  const taskCompletionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft transition-smooth hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft transition-smooth hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <div className="mt-2">
                <Progress value={taskCompletionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft transition-smooth hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.todayAttendance ? (
                  <Badge className="bg-success">Checked In</Badge>
                ) : (
                  <Badge variant="outline">Not Checked In</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Today</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft transition-smooth hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leaveBalance}</div>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <button className="p-4 rounded-lg border border-border hover:border-primary transition-smooth text-left">
                <Clock className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-semibold">Check In/Out</h4>
                <p className="text-sm text-muted-foreground">Record attendance</p>
              </button>
              
              <button className="p-4 rounded-lg border border-border hover:border-primary transition-smooth text-left">
                <FileText className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-semibold">Create Task</h4>
                <p className="text-sm text-muted-foreground">Add new task</p>
              </button>
              
              <button className="p-4 rounded-lg border border-border hover:border-primary transition-smooth text-left">
                <Calendar className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-semibold">Book Meeting</h4>
                <p className="text-sm text-muted-foreground">Reserve a room</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-muted-foreground">Welcome to Vine CRM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
