import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ShiftSelector } from '@/components/booking/ShiftSelector';
import { SeatMap } from '@/components/booking/SeatMap';
import { DatePicker } from '@/components/booking/DatePicker';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingType, FEES } from '@/types/library';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSeats, useBookedSeats } from '@/hooks/useSeats';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, QrCode, Clock, IndianRupee, Wifi } from 'lucide-react';

export default function BookSeat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { seats, shifts, loading: seatsLoading } = useSeats();
  const { createBooking } = useBookings();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>('HALF_DAY');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Set default shift when shifts load
  useEffect(() => {
    if (shifts.length > 0 && !selectedShift) {
      setSelectedShift(shifts[0].id);
    }
  }, [shifts, selectedShift]);

  const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  
  const { bookedSeatIds, loading: bookedLoading } = useBookedSeats(
    dateStr,
    selectedShift,
    bookingType === 'FULL_DAY'
  );

  // Get selected entities
  const selectedSeatData = seats.find((s) => s.id === selectedSeat);
  const selectedShiftData = shifts.find((s) => s.id === selectedShift);

  // Check if booking is complete
  const isBookingComplete = useMemo(() => {
    if (!selectedDate || !selectedSeat) return false;
    if (bookingType === 'HALF_DAY' && !selectedShift) return false;
    return true;
  }, [selectedDate, selectedSeat, selectedShift, bookingType]);

  const handleConfirmBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedSeat || !selectedDate) return;

    try {
      const result = await createBooking.mutateAsync({
        seat_id: selectedSeat,
        shift_id: bookingType === 'FULL_DAY' ? null : selectedShift,
        is_full_day: bookingType === 'FULL_DAY',
        date: selectedDate,
        payment_amount: bookingType === 'FULL_DAY' ? FEES.FULL_DAY : FEES.HALF_DAY
      });

      setBookingId(result.id.substring(0, 8).toUpperCase());
      setShowConfirmation(true);
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Unable to create booking. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    toast({
      title: 'Booking Request Submitted!',
      description: 'Your booking is on HOLD. Please complete payment for admin approval.',
    });
    navigate('/dashboard');
  };

  const fee = bookingType === 'FULL_DAY' ? FEES.FULL_DAY : FEES.HALF_DAY;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Book a Seat</h1>
          <p className="mt-2 text-muted-foreground">
            Main Study Hall • 100 Seats • Unlimited 5G WiFi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Date Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Select Date
              </h2>
              <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </section>

            {/* Step 2: Shift Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Select Shift & Fees
              </h2>
              <ShiftSelector
                shifts={shifts}
                selectedShift={selectedShift}
                bookingType={bookingType}
                onSelectShift={setSelectedShift}
                onSelectBookingType={(type) => {
                  setBookingType(type);
                  setSelectedSeat(null);
                }}
              />
            </section>

            {/* Step 3: Seat Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Pick Your Seat
              </h2>
              <SeatMap
                seats={seats}
                selectedSeat={selectedSeat}
                bookedSeats={bookedSeatIds}
                onSelectSeat={setSelectedSeat}
                loading={seatsLoading || bookedLoading}
              />
            </section>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              date={selectedDate}
              seat={selectedSeatData}
              shift={selectedShiftData}
              bookingType={bookingType}
              onConfirm={handleConfirmBooking}
              isComplete={isBookingComplete}
              isLoading={createBooking.isPending}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-chart-2">
              <Clock className="h-6 w-6" />
              Booking Request Submitted
            </DialogTitle>
            <DialogDescription>
              Your booking is on HOLD pending payment verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center">
                <QrCode className="h-20 w-20 text-foreground" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Booking Reference
              </p>
              <div className="font-mono text-lg font-bold text-foreground">
                BK-{bookingId}
              </div>
            </div>
            
            <div className="rounded-lg bg-accent/50 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seat</span>
                <span className="font-medium">{selectedSeatData?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {bookingType === 'FULL_DAY'
                    ? '07:00 - 22:00'
                    : `${selectedShiftData?.start_time} - ${selectedShiftData?.end_time}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  Amount Due
                </span>
                <span className="font-bold text-primary">₹{fee}</span>
              </div>
            </div>

            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              <p className="font-medium">Next Steps:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Complete payment at the counter</li>
                <li>Admin will approve your booking</li>
                <li>Show QR code for check-in</li>
              </ol>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <Wifi className="h-4 w-4" />
              <span>WiFi access included with confirmed booking</span>
            </div>
          </div>

          <Button onClick={handleCloseConfirmation} className="w-full">
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
