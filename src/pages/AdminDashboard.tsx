import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/admin/StatsCard';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminBookings } from '@/hooks/useBookings';
import { useAttendance } from '@/hooks/useAttendance';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Users,
  Armchair,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  IndianRupee,
  QrCode,
  LogIn,
  LogOut,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRScanner } from '@/components/admin/QRScanner';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-chart-3/20 text-chart-3',
  HOLD: 'bg-chart-2/20 text-chart-2',
  CANCELLED: 'bg-destructive/20 text-destructive',
  COMPLETED: 'bg-primary/20 text-primary',
  NO_SHOW: 'bg-muted text-muted-foreground',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { stats, loading: statsLoading } = useAdminStats();
  const { allBookings, loading: bookingsLoading, approveBooking, rejectBooking, refetch } = useAdminBookings();
  const { checkIn, checkOut } = useAttendance();
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'today'>('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate('/dashboard');
    }
  }, [roleLoading, isAdmin, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const pendingBookings = allBookings.filter(b => b.status === 'HOLD');
  const todayBookings = allBookings.filter(b => {
    const bookingDate = new Date(b.starts_at).toDateString();
    return bookingDate === new Date().toDateString();
  });

  const displayBookings = activeTab === 'pending' 
    ? pendingBookings 
    : activeTab === 'today' 
    ? todayBookings 
    : allBookings;

  const handleQRScan = (bookingId: string) => {
    setShowScanner(false);
    // Find booking and check-in
    const booking = allBookings.find(b => b.id.startsWith(bookingId) || b.id === bookingId);
    if (booking) {
      checkIn.mutate(booking.id);
    }
  };

  const occupancyData = [
    { day: 'Today', morning: stats?.morningOccupancy || 0, evening: stats?.eveningOccupancy || 0 },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage bookings, approve payments, and track attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowScanner(true)}>
              <QrCode className="h-4 w-4" />
              Scan QR
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Today's Occupancy"
            value={`${stats?.morningOccupancy || 0}%`}
            subtitle="Morning shift"
            icon={TrendingUp}
            variant="primary"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats?.pendingBookings || 0}
            subtitle="Awaiting payment"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Available Seats"
            value={stats?.availableSeats || 0}
            subtitle={`of ${stats?.totalSeats || 100} total`}
            icon={Armchair}
            variant="default"
          />
          <StatsCard
            title="Today's Revenue"
            value={`₹${stats?.todayRevenue || 0}`}
            subtitle={`Total: ₹${stats?.totalRevenue || 0}`}
            icon={IndianRupee}
            variant="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Tabs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Booking Management</CardTitle>
                  <div className="flex gap-1 bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        activeTab === 'pending' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      Pending ({pendingBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('today')}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        activeTab === 'today' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      Today ({todayBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1 text-sm rounded-md transition-all ${
                        activeTab === 'all' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : displayBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayBookings.slice(0, 10).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground truncate">
                              {booking.profiles?.full_name || 'Unknown User'}
                            </span>
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Seat {booking.seats?.label} • {format(new Date(booking.starts_at), 'MMM d, h:mm a')}
                            {booking.is_full_day ? ' (Full Day)' : ` (${booking.shifts?.name || 'Shift'})`}
                          </div>
                          <div className="text-sm font-medium text-primary">
                            ₹{booking.payment_amount || 0}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'HOLD' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveBooking.mutate(booking.id)}
                                disabled={approveBooking.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectBooking.mutate(booking.id)}
                                disabled={rejectBooking.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkIn.mutate(booking.id)}
                                disabled={checkIn.isPending}
                              >
                                <LogIn className="h-4 w-4 mr-1" />
                                Check In
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkOut.mutate(booking.id)}
                                disabled={checkOut.isPending}
                              >
                                <LogOut className="h-4 w-4 mr-1" />
                                Check Out
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Occupancy Overview */}
            <OccupancyChart data={occupancyData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span className="font-semibold text-chart-3">{stats?.confirmedBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-chart-2">{stats?.pendingBookings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold text-primary">{stats?.completedBookings || 0}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Seats</span>
                    <span className="font-semibold">{stats?.totalSeats || 100}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Fee Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">Half Day</span>
                    <p className="text-xs text-muted-foreground">Single shift</p>
                  </div>
                  <span className="font-bold text-lg">₹400</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <span className="font-medium">Full Day</span>
                    <p className="text-xs text-muted-foreground">Both shifts</p>
                  </div>
                  <span className="font-bold text-lg text-primary">₹500</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="h-4 w-4" />
                  Scan QR for Check-in
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Booking QR Code</DialogTitle>
          </DialogHeader>
          <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
