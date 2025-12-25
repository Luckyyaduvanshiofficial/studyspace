import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Seat, Shift, BookingType, FEES } from '@/types/library';
import { CheckCircle, Calendar, Clock, Armchair, IndianRupee, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BookingSummaryProps {
  date: Date | undefined;
  seat: Seat | undefined;
  shift: Shift | undefined;
  bookingType: BookingType;
  onConfirm: () => void;
  isComplete: boolean;
  isLoading?: boolean;
}

export function BookingSummary({
  date,
  seat,
  shift,
  bookingType,
  onConfirm,
  isComplete,
  isLoading = false,
}: BookingSummaryProps) {
  const { user } = useAuth();
  const fee = bookingType === 'FULL_DAY' ? FEES.FULL_DAY : FEES.HALF_DAY;

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
                ? `${shift.name} (${shift.start_time || shift.startTime} - ${shift.end_time || shift.endTime})`
                : 'Not selected'}
            </span>
          </div>
        </div>

        {/* Fee Section */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Booking Type</span>
            <span className="font-semibold text-primary">
              {bookingType === 'FULL_DAY' ? 'Full Day' : 'Half Day'}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              Fee
            </span>
            <span className="font-bold text-primary">
              ₹{fee}
            </span>
          </div>

          {!user && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Please sign in to complete your booking</span>
            </div>
          )}

          {user && (
            <div className="bg-accent/50 text-muted-foreground text-xs p-3 rounded-lg">
              <p>Your booking will be on <strong>HOLD</strong> until approved by admin after payment verification.</p>
            </div>
          )}

          <Button
            onClick={onConfirm}
            disabled={!isComplete || !user || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Processing...' : user ? 'Request Booking' : 'Sign In to Book'}
          </Button>

          {!isComplete && user && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Please complete all selections to continue
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
