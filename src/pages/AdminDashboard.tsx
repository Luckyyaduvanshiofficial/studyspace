import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/admin/StatsCard';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { HeatmapChart } from '@/components/admin/HeatmapChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { occupancyStats, zones, seats, userBookings } from '@/data/mockData';
import {
  Users,
  Armchair,
  TrendingUp,
  Clock,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const recentActivity = [
  { id: 1, action: 'Check-in', user: 'John D.', seat: 'Q12', time: '2 mins ago', status: 'success' },
  { id: 2, action: 'Booking', user: 'Sarah M.', seat: 'G3', time: '5 mins ago', status: 'success' },
  { id: 3, action: 'No-show', user: 'Mike R.', seat: 'O8', time: '15 mins ago', status: 'warning' },
  { id: 4, action: 'Cancellation', user: 'Lisa K.', seat: 'C4', time: '22 mins ago', status: 'error' },
  { id: 5, action: 'Check-out', user: 'Tom B.', seat: 'Q5', time: '30 mins ago', status: 'success' },
];

const statusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const statusColors = {
  success: 'text-chart-3',
  warning: 'text-chart-2',
  error: 'text-destructive',
};

export default function AdminDashboard() {
  const totalSeats = seats.length;
  const activeSeats = seats.filter((s) => s.isActive).length;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor occupancy, manage seats, and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Today's Occupancy"
            value={`${occupancyStats.today.morning}%`}
            subtitle="Morning shift"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            variant="primary"
          />
          <StatsCard
            title="Active Bookings"
            value={userBookings.filter((b) => b.status === 'CONFIRMED').length}
            subtitle="Currently reserved"
            icon={Users}
            variant="success"
          />
          <StatsCard
            title="Available Seats"
            value={activeSeats}
            subtitle={`of ${totalSeats} total`}
            icon={Armchair}
            variant="default"
          />
          <StatsCard
            title="Avg. Session"
            value="4.2h"
            subtitle="Per booking"
            icon={Clock}
            variant="warning"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            <OccupancyChart data={occupancyStats.weekly} />
            <HeatmapChart data={occupancyStats.hourlyHeatmap} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Zone Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zone Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {zones.map((zone) => {
                  const zoneSeats = seats.filter((s) => s.zoneId === zone.id);
                  const occupancy = Math.floor(Math.random() * 100);
                  
                  return (
                    <div key={zone.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{zone.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {zoneSeats.length} seats
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{occupancy}% occupied</span>
                        <span>{Math.floor(zoneSeats.length * (1 - occupancy / 100))} available</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = statusIcons[activity.status as keyof typeof statusIcons];
                    
                    return (
                      <div key={activity.id} className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${statusColors[activity.status as keyof typeof statusColors]}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user} • Seat {activity.seat}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Armchair className="h-4 w-4" />
                  Manage Seats
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  Edit Shift Times
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  View All Users
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Block Seats for Maintenance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
