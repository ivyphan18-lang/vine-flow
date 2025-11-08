import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUserRole, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamsManagement from "@/components/organization/TeamsManagement";
import ShiftsManagement from "@/components/organization/ShiftsManagement";
import UsersManagement from "@/components/organization/UsersManagement";
import AttendanceSettings from "@/components/organization/AttendanceSettings";

const Organization = () => {
  const [role, setRole] = useState<UserRole>('staff');

  useEffect(() => {
    const loadRole = async () => {
      const user = await getCurrentUser();
      if (!user) return;
      const userRole = await getUserRole(user.id);
      setRole(userRole);
    };
    loadRole();
  }, []);

  if (role !== 'admin') {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">Only admins can access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Organization</h2>
          <p className="text-muted-foreground">Manage teams, users, shifts and settings</p>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="shifts">Shifts</TabsTrigger>
            <TabsTrigger value="settings">Attendance Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="teams" className="mt-6">
            <TeamsManagement />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UsersManagement />
          </TabsContent>
          <TabsContent value="shifts" className="mt-6">
            <ShiftsManagement />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <AttendanceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Organization;
