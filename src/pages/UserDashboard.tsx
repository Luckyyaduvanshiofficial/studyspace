import { Layout } from '@/components/layout/Layout';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userBookings, currentUser } from '@/data/mockData';
import { Link } from 'react-router-dom';
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
  const upcomingBookings = userBookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.startsAt) >= new Date()
  );
  const pastBookings = userBookings.filter(
    (b) => b.status === 'COMPLETED' || new Date(b.startsAt) < new Date()
  );

  const handleCheckIn = (bookingId: string) => {
    toast({
      title: 'Checked In Successfully!',
      description: 'Enjoy your study session.',
    });
  };

  const handleCancel = (bookingId: string) => {
    toast({
      title: 'Booking Cancelled',
      description: 'Your booking has been cancelled.',
      variant: 'destructive',
    });
  };

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
                    {userBookings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="h-6 w-6 text-chart-4 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">Active</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Upcoming Bookings
              </h2>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
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
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={{ ...booking, status: 'COMPLETED' }}
                      showActions={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {currentUser.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Student ID: {currentUser.studentId}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Member since {format(currentUser.createdAt, 'MMM yyyy')}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
