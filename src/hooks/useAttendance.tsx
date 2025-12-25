import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export function useAttendance() {
  const queryClient = useQueryClient();

  const checkIn = useMutation({
    mutationFn: async (bookingId: string) => {
      // First check if attendance record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ checked_in_at: new Date().toISOString() })
          .eq('booking_id', bookingId);

        if (error) throw error;
      } else {
        // Create new attendance record
        const { error } = await supabase
          .from('attendance')
          .insert({
            booking_id: bookingId,
            checked_in_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Checked In',
        description: 'User has been checked in successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Check-in Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const checkOut = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('attendance')
        .update({ checked_out_at: new Date().toISOString() })
        .eq('booking_id', bookingId);

      if (error) throw error;

      // Update booking status to completed
      await supabase
        .from('bookings')
        .update({ status: 'COMPLETED' })
        .eq('id', bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Checked Out',
        description: 'User has been checked out successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Check-out Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return { checkIn, checkOut };
}
