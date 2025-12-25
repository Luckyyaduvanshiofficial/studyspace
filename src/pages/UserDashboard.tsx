import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { WifiAccessCard } from '@/components/wifi/WifiAccessCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { toast } from '@/hooks/use-toast';
import {
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  Clock,
  Plus,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { membership, isActive } = useMembership();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch bookings with seat and zone info
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          seats:seat_id (
            id,
            label,
            row_num,
            col_num,
            zones:zone_id (
              id,
              name,
              icon,
              color
            )
          ),
          shifts:shift_id (
            id,
            name,
            start_time,
            end_time
          )
        `)
        .eq('user_id', user.id)
        .order('starts_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.starts_at) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || new Date(b.starts_at) < new Date()
  );

  const handleCheckIn = async (bookingId: string) => {
    const { error } = await supabase
      .from('attendance')
      .insert({ booking_id: bookingId, checked_in_at: new Date().toISOString() });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Check-in failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Checked In Successfully!',
        description: 'Enjoy your study session.',
      });
    }
  };

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Cancellation failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled.',
      });
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your bookings and profile
            </p>
          </div>
          <Link to="/book">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Book New Seat
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CalendarDays className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {upcomingBookings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Upcoming</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-chart-2 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {pastBookings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-chart-3 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {bookings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="h-6 w-6 text-chart-4 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-xs text-muted-foreground">Membership</div>
                </CardContent>
              </Card>
            </div>

            {/* WiFi Access Card */}
            <WifiAccessCard />

            {/* Upcoming Bookings */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Upcoming Bookings
              </h2>
              {bookingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={{
                        id: booking.id,
                        userId: booking.user_id,
                        seatId: booking.seat_id,
                        shiftId: booking.shift_id || undefined,
                        isFullDay: booking.is_full_day || false,
                        startsAt: new Date(booking.starts_at),
                        endsAt: new Date(booking.ends_at),
                        status: booking.status as any,
                        createdAt: new Date(booking.created_at),
                        seat: booking.seats ? {
                          id: booking.seats.id,
                          zoneId: booking.seats.zones?.id || '',
                          label: booking.seats.label,
                          capacity: 1,
                          isActive: true,
                          row: booking.seats.row_num,
                          col: booking.seats.col_num,
                        } : undefined,
                        shift: booking.shifts ? {
                          id: booking.shifts.id,
                          name: booking.shifts.name,
                          startTime: booking.shifts.start_time,
                          endTime: booking.shifts.end_time,
                        } : undefined,
                        zone: booking.seats?.zones ? {
                          id: booking.seats.zones.id,
                          name: booking.seats.zones.name,
                          description: '',
                          icon: booking.seats.zones.icon,
                          color: booking.seats.zones.color,
                        } : undefined,
                      }}
                      onCheckIn={() => handleCheckIn(booking.id)}
                      onCancel={() => handleCancel(booking.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      No Upcoming Bookings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You don't have any upcoming reservations.
                    </p>
                    <Link to="/book">
                      <Button>Book a Seat Now</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Past Bookings
                </h2>
                <div className="space-y-4">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={{
                        id: booking.id,
                        userId: booking.user_id,
                        seatId: booking.seat_id,
                        shiftId: booking.shift_id || undefined,
                        isFullDay: booking.is_full_day || false,
                        startsAt: new Date(booking.starts_at),
                        endsAt: new Date(booking.ends_at),
                        status: 'COMPLETED',
                        createdAt: new Date(booking.created_at),
                        seat: booking.seats ? {
                          id: booking.seats.id,
                          zoneId: booking.seats.zones?.id || '',
                          label: booking.seats.label,
                          capacity: 1,
                          isActive: true,
                          row: booking.seats.row_num,
                          col: booking.seats.col_num,
                        } : undefined,
                        zone: booking.seats?.zones ? {
                          id: booking.seats.zones.id,
                          name: booking.seats.zones.name,
                          description: '',
                          icon: booking.seats.zones.icon,
                          color: booking.seats.zones.color,
                        } : undefined,
                      }}
                      showActions={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                        {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {profile?.full_name || 'User'}
                        </h3>
                        {profile?.student_id && (
                          <p className="text-sm text-muted-foreground">
                            Student ID: {profile.student_id}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile?.email || user.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{profile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {membership ? (
                            <>
                              {membership.plan_name} - 
                              <Badge 
                                variant={isActive ? 'default' : 'secondary'} 
                                className="ml-1"
                              >
                                {isActive ? 'Active' : membership.status}
                              </Badge>
                            </>
                          ) : (
                            'No membership'
                          )}
                        </span>
                      </div>
                      {membership && (
                        <div className="text-xs text-muted-foreground">
                          Expires: {format(new Date(membership.expires_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}