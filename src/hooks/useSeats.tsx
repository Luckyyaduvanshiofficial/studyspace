import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Seat, Shift } from '@/types/library';

interface BookedSeat {
  seat_id: string;
  shift_id: string | null;
  is_full_day: boolean | null;
}

export function useSeats() {
  const { data: seats = [], isLoading: seatsLoading, refetch: refetchSeats } = useQuery({
    queryKey: ['seats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('is_active', true)
        .order('row_num')
        .order('col_num');
      
      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        row: s.row_num,
        col: s.col_num
      })) as Seat[];
    }
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('is_active', true)
        .order('start_time');
      
      if (error) throw error;
      return data as Shift[];
    }
  });

  return {
    seats,
    shifts,
    loading: seatsLoading || shiftsLoading,
    refetchSeats
  };
}

export function useBookedSeats(date: string, shiftId: string | null, isFullDay: boolean) {
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookedSeats = async () => {
    if (!date) return;

    setLoading(true);
    try {
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      const { data, error } = await supabase
        .from('bookings')
        .select('seat_id, shift_id, is_full_day')
        .gte('starts_at', startOfDay)
        .lte('starts_at', endOfDay)
        .in('status', ['CONFIRMED', 'HOLD']);

      if (error) throw error;

      const bookedSeats = data as BookedSeat[];
      
      const conflictingSeatIds = bookedSeats.filter(booking => {
        if (isFullDay) return true;
        if (booking.is_full_day) return true;
        return booking.shift_id === shiftId;
      }).map(b => b.seat_id);

      setBookedSeatIds([...new Set(conflictingSeatIds)]);
    } catch (error) {
      console.error('Error fetching booked seats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedSeats();
  }, [date, shiftId, isFullDay]);

  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookedSeats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, shiftId, isFullDay]);

  return { bookedSeatIds, loading, refetch: fetchBookedSeats };
}
