import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ZoneSelector } from '@/components/booking/ZoneSelector';
import { ShiftSelector } from '@/components/booking/ShiftSelector';
import { SeatMap } from '@/components/booking/SeatMap';
import { DatePicker } from '@/components/booking/DatePicker';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { zones, seats, shifts, isSeatBooked, bookedSeats } from '@/data/mockData';
import { BookingType } from '@/types/library';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, QrCode } from 'lucide-react';

export default function BookSeat() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>('morning');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>('HALF_DAY');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter seats by selected zone
  const filteredSeats = useMemo(() => {
    if (!selectedZone) return [];
    return seats.filter((seat) => seat.zoneId === selectedZone);
  }, [selectedZone]);

  // Get booked seats for the selected date and shift
  const bookedSeatIds = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    if (bookingType === 'FULL_DAY') {
      // For full day, seat is unavailable if booked for either shift
      return bookedSeats
        .filter((b) => b.date === dateStr)
        .map((b) => b.seatId);
    }
    
    return bookedSeats
      .filter((b) => b.date === dateStr && b.shiftId === selectedShift)
      .map((b) => b.seatId);
  }, [selectedDate, selectedShift, bookingType]);

  // Get selected entities
  const selectedZoneData = zones.find((z) => z.id === selectedZone);
  const selectedSeatData = seats.find((s) => s.id === selectedSeat);
  const selectedShiftData = shifts.find((s) => s.id === selectedShift);

  // Check if booking is complete
  const isBookingComplete = useMemo(() => {
    if (!selectedDate || !selectedZone || !selectedSeat) return false;
    if (bookingType === 'HALF_DAY' && !selectedShift) return false;
    return true;
  }, [selectedDate, selectedZone, selectedSeat, selectedShift, bookingType]);

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    toast({
      title: 'Booking Confirmed!',
      description: `Your seat ${selectedSeatData?.label} has been reserved.`,
    });
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Book a Seat</h1>
          <p className="mt-2 text-muted-foreground">
            Select your preferred date, zone, shift, and seat
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

            {/* Step 2: Zone Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Choose Zone
              </h2>
              <ZoneSelector
                zones={zones}
                selectedZone={selectedZone}
                onSelectZone={(zoneId) => {
                  setSelectedZone(zoneId);
                  setSelectedSeat(null); // Reset seat when zone changes
                }}
              />
            </section>

            {/* Step 3: Shift Selection */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Select Shift
              </h2>
              <ShiftSelector
                shifts={shifts}
                selectedShift={selectedShift}
                bookingType={bookingType}
                onSelectShift={setSelectedShift}
                onSelectBookingType={(type) => {
                  setBookingType(type);
                  setSelectedSeat(null); // Reset seat when booking type changes
                }}
              />
            </section>

            {/* Step 4: Seat Selection */}
            {selectedZone && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    4
                  </span>
                  Pick Your Seat
                </h2>
                <SeatMap
                  seats={filteredSeats}
                  selectedSeat={selectedSeat}
                  bookedSeats={bookedSeatIds}
                  onSelectSeat={setSelectedSeat}
                />
              </section>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              date={selectedDate}
              zone={selectedZoneData}
              seat={selectedSeatData}
              shift={selectedShiftData}
              bookingType={bookingType}
              onConfirm={handleConfirmBooking}
              isComplete={isBookingComplete}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-chart-3">
              <CheckCircle className="h-6 w-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your seat has been successfully reserved.
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
                Show this QR code at the entrance for check-in
              </p>
              <div className="font-mono text-lg font-bold text-foreground">
                BK-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </div>
            </div>
            
            <div className="rounded-lg bg-accent/50 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seat</span>
                <span className="font-medium">{selectedSeatData?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone</span>
                <span className="font-medium">{selectedZoneData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {bookingType === 'FULL_DAY'
                    ? '07:00 - 22:00'
                    : `${selectedShiftData?.startTime} - ${selectedShiftData?.endTime}`}
                </span>
              </div>
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
