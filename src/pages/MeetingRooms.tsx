import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUserRole, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomList from "@/components/rooms/RoomList";
import BookingCalendar from "@/components/rooms/BookingCalendar";
import MyBookings from "@/components/rooms/MyBookings";

const MeetingRooms = () => {
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

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Meeting Rooms</h2>
          <p className="text-muted-foreground">Book and manage meeting rooms</p>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-6">
            <BookingCalendar role={role} />
          </TabsContent>
          <TabsContent value="rooms" className="mt-6">
            <RoomList role={role} />
          </TabsContent>
          <TabsContent value="my-bookings" className="mt-6">
            <MyBookings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MeetingRooms;
