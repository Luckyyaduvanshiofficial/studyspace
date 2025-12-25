import { Seat } from '@/types/library';
import { cn } from '@/lib/utils';
import { Armchair } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  selectedSeat: string | null;
  bookedSeats: string[];
  onSelectSeat: (seatId: string) => void;
}

export function SeatMap({ seats, selectedSeat, bookedSeats, onSelectSeat }: SeatMapProps) {
  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  // Sort seats in each row by column
  Object.keys(rows).forEach((row) => {
    rows[Number(row)].sort((a, b) => a.col - b.col);
  });

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-muted border-2 border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-destructive/20 border-2 border-destructive/40" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="p-6 bg-muted/50 rounded-xl border border-border">
        <div className="flex flex-col gap-3">
          {Object.entries(rows)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([rowNum, rowSeats]) => (
              <div key={rowNum} className="flex gap-3 justify-center">
                {rowSeats.map((seat) => {
                  const isBooked = bookedSeats.includes(seat.id);
                  const isSelected = selectedSeat === seat.id;
                  const isDisabled = isBooked || !seat.isActive;

                  return (
                    <button
                      key={seat.id}
                      disabled={isDisabled}
                      onClick={() => onSelectSeat(seat.id)}
                      className={cn(
                        'relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isSelected && 'bg-primary text-primary-foreground shadow-lg scale-110',
                        isBooked && 'bg-destructive/20 border-2 border-destructive/40 cursor-not-allowed',
                        !isSelected && !isBooked && 'bg-card border-2 border-border hover:border-primary hover:shadow-md',
                        !seat.isActive && 'opacity-50 cursor-not-allowed'
                      )}
                      title={`Seat ${seat.label}${isBooked ? ' (Occupied)' : ''}`}
                    >
                      <Armchair className={cn(
                        'h-5 w-5',
                        isSelected && 'text-primary-foreground',
                        isBooked && 'text-destructive/60',
                        !isSelected && !isBooked && 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'absolute -bottom-1 text-[10px] font-medium',
                        isSelected && 'text-primary',
                        !isSelected && 'text-muted-foreground'
                      )}>
                        {seat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
