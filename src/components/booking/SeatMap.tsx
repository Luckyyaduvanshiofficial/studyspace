import { Seat } from '@/types/library';
import { cn } from '@/lib/utils';
import { Armchair, Loader2 } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  selectedSeat: string | null;
  bookedSeats: string[];
  onSelectSeat: (seatId: string) => void;
  loading?: boolean;
}

export function SeatMap({ seats, selectedSeat, bookedSeats, onSelectSeat, loading = false }: SeatMapProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading seats...</span>
      </div>
    );
  }

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.row_num ?? seat.row;
    if (!acc[rowNum]) {
      acc[rowNum] = [];
    }
    acc[rowNum].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  // Sort seats in each row by column
  Object.keys(rows).forEach((row) => {
    rows[Number(row)].sort((a, b) => (a.col_num ?? a.col) - (b.col_num ?? b.col));
  });

  const totalSeats = seats.length;
  const bookedCount = bookedSeats.length;
  const availableCount = totalSeats - bookedCount;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{totalSeats}</span>
          <span className="text-muted-foreground">Total Seats</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-chart-3">{availableCount}</span>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-destructive">{bookedCount}</span>
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>

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
      <div className="p-6 bg-muted/50 rounded-xl border border-border overflow-x-auto">
        <div className="flex flex-col gap-2 min-w-fit">
          {Object.entries(rows)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([rowNum, rowSeats]) => (
              <div key={rowNum} className="flex gap-2 justify-center">
                <span className="w-6 text-xs text-muted-foreground flex items-center justify-center">
                  {rowNum}
                </span>
                {rowSeats.map((seat) => {
                  const isBooked = bookedSeats.includes(seat.id);
                  const isSelected = selectedSeat === seat.id;
                  const isActive = seat.is_active ?? seat.isActive ?? true;
                  const isDisabled = isBooked || !isActive;

                  return (
                    <button
                      key={seat.id}
                      disabled={isDisabled}
                      onClick={() => onSelectSeat(seat.id)}
                      className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isSelected && 'bg-primary text-primary-foreground shadow-lg scale-110',
                        isBooked && 'bg-destructive/20 border-2 border-destructive/40 cursor-not-allowed',
                        !isSelected && !isBooked && 'bg-card border-2 border-border hover:border-primary hover:shadow-md',
                        !isActive && 'opacity-50 cursor-not-allowed'
                      )}
                      title={`Seat ${seat.label}${isBooked ? ' (Occupied)' : ''}`}
                    >
                      <Armchair className={cn(
                        'h-4 w-4',
                        isSelected && 'text-primary-foreground',
                        isBooked && 'text-destructive/60',
                        !isSelected && !isBooked && 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        'absolute -bottom-0.5 text-[8px] font-medium',
                        isSelected && 'text-primary',
                        !isSelected && 'text-muted-foreground'
                      )}>
                        {seat.label.replace('S', '')}
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
