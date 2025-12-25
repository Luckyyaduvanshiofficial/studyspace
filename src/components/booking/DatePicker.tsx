import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { addDays } from 'date-fns';

interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export function DatePicker({ selectedDate, onSelectDate }: DatePickerProps) {
  const today = new Date();
  const maxDate = addDays(today, 7); // Allow booking up to 7 days in advance

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Select Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          disabled={(date) => date < today || date > maxDate}
          className="rounded-md border pointer-events-auto"
        />
        <p className="mt-2 text-xs text-muted-foreground text-center">
          You can book up to 7 days in advance
        </p>
      </CardContent>
    </Card>
  );
}
