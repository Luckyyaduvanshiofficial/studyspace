import { Shift, BookingType, FEES } from '@/types/library';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Sunrise, Sunset, Clock, IndianRupee } from 'lucide-react';

interface ShiftSelectorProps {
  shifts: Shift[];
  selectedShift: string | null;
  bookingType: BookingType;
  onSelectShift: (shiftId: string) => void;
  onSelectBookingType: (type: BookingType) => void;
}

export function ShiftSelector({
  shifts,
  selectedShift,
  bookingType,
  onSelectShift,
  onSelectBookingType,
}: ShiftSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Booking Type Toggle with Fees */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => onSelectBookingType('HALF_DAY')}
          className={cn(
            'flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all',
            bookingType === 'HALF_DAY'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span>Half Day</span>
            <span className="text-xs flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" />
              {FEES.HALF_DAY}
            </span>
          </div>
        </button>
        <button
          onClick={() => onSelectBookingType('FULL_DAY')}
          className={cn(
            'flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all',
            bookingType === 'FULL_DAY'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span>Full Day</span>
            <span className="text-xs flex items-center gap-0.5">
              <IndianRupee className="h-3 w-3" />
              {FEES.FULL_DAY}
            </span>
          </div>
        </button>
      </div>

      {/* Shift Cards */}
      {bookingType === 'HALF_DAY' ? (
        <div className="grid grid-cols-2 gap-4">
          {shifts.map((shift) => {
            const isSelected = selectedShift === shift.id;
            const isMorning = shift.name.toLowerCase().includes('morning');
            const Icon = isMorning ? Sunrise : Sunset;
            const startTime = shift.start_time || shift.startTime;
            const endTime = shift.end_time || shift.endTime;
            
            return (
              <Card
                key={shift.id}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-primary border-primary bg-accent'
                    : 'hover:border-primary/50 hover:shadow-sm'
                )}
                onClick={() => onSelectShift(shift.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{shift.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {startTime} - {endTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="ring-2 ring-primary border-primary bg-accent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Full Day</h4>
                <p className="text-sm text-muted-foreground">
                  07:00 - 22:00 (Both Shifts)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
