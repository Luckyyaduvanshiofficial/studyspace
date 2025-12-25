import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types/library';
import { Calendar, Clock, MapPin, Armchair, QrCode, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  onCheckIn?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  CANCELLED: 'bg-destructive/20 text-destructive border-destructive/30',
  COMPLETED: 'bg-muted text-muted-foreground border-border',
  NO_SHOW: 'bg-destructive/20 text-destructive border-destructive/30',
  RELEASED: 'bg-muted text-muted-foreground border-border',
  HOLD: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
};

export function BookingCard({ booking, onCheckIn, onCancel, showActions = true }: BookingCardProps) {
  const isUpcoming = new Date(booking.startsAt) > new Date();
  const canCheckIn = booking.status === 'CONFIRMED' && !isUpcoming;
  const canCancel = booking.status === 'CONFIRMED' && isUpcoming;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Date Badge */}
          <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 bg-primary/10 p-4 sm:w-24">
            <span className="text-3xl font-bold text-primary">
              {format(new Date(booking.startsAt), 'd')}
            </span>
            <span className="text-sm font-medium text-primary">
              {format(new Date(booking.startsAt), 'MMM')}
            </span>
          </div>

          {/* Booking Details */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {booking.zone?.name || 'Study Zone'}
              </h3>
              <Badge
                variant="outline"
                className={cn('text-xs', statusColors[booking.status])}
              >
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Armchair className="h-4 w-4" />
                <span>Seat {booking.seat?.label}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(booking.startsAt), 'EEE, MMM d')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {booking.isFullDay
                    ? '07:00 - 22:00'
                    : `${booking.shift?.startTime} - ${booking.shift?.endTime}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.isFullDay ? 'Full Day' : 'Half Day'}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2 pt-2">
                {canCheckIn && (
                  <Button size="sm" onClick={onCheckIn} className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Check In
                  </Button>
                )}
                {canCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
