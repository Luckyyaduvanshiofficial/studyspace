import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Seat, Zone, Shift, BookingType } from '@/types/library';
import { CheckCircle, Calendar, Clock, MapPin, Armchair } from 'lucide-react';

interface BookingSummaryProps {
  date: Date | undefined;
  zone: Zone | undefined;
  seat: Seat | undefined;
  shift: Shift | undefined;
  bookingType: BookingType;
  onConfirm: () => void;
  isComplete: boolean;
}

export function BookingSummary({
  date,
  zone,
  seat,
  shift,
  bookingType,
  onConfirm,
  isComplete,
}: BookingSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-primary" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {date ? format(date, 'EEE, MMM d, yyyy') : 'Not selected'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Zone:</span>
            <span className="font-medium">{zone?.name || 'Not selected'}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Seat:</span>
            <span className="font-medium">{seat?.label || 'Not selected'}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Shift:</span>
            <span className="font-medium">
              {bookingType === 'FULL_DAY'
                ? 'Full Day (07:00 - 22:00)'
                : shift
                ? `${shift.name} (${shift.startTime} - ${shift.endTime})`
                : 'Not selected'}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Booking Type</span>
            <span className="font-semibold text-primary">
              {bookingType === 'FULL_DAY' ? 'Full Day' : 'Half Day'}
            </span>
          </div>

          <Button
            onClick={onConfirm}
            disabled={!isComplete}
            className="w-full"
            size="lg"
          >
            Confirm Booking
          </Button>

          {!isComplete && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Please complete all selections to continue
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
