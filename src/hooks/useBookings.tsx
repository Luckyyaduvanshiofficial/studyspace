import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface CreateBookingParams {
  seat_id: string;
  shift_id: string | null;
  is_full_day: boolean;
  date: Date;
  payment_amount: number;
}

export function useBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userBookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          seats (id, label, row_num, col_num),
          shifts (id, name, start_time, end_time)
        `)
        .eq('user_id', user.id)
        .order('starts_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createBooking = useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      if (!user) throw new Error('Must be logged in to book');

      const startDate = new Date(params.date);
      const endDate = new Date(params.date);

      if (params.is_full_day) {
        startDate.setHours(7, 0, 0, 0);
        endDate.setHours(22, 0, 0, 0);
      } else {
        // Get shift times
        const { data: shift } = await supabase
          .from('shifts')
          .select('start_time, end_time')
          .eq('id', params.shift_id)
          .single();

        if (shift) {
          const [startHour, startMin] = shift.start_time.split(':').map(Number);
          const [endHour, endMin] = shift.end_time.split(':').map(Number);
          startDate.setHours(startHour, startMin, 0, 0);
          endDate.setHours(endHour, endMin, 0, 0);
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          seat_id: params.seat_id,
          shift_id: params.shift_id,
          is_full_day: params.is_full_day,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
          status: 'HOLD',
          payment_amount: params.payment_amount,
          payment_status: 'PENDING',
          admin_approved: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
    }
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', bookingId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.'
      });
    }
  });

  return {
    userBookings,
    loading: isLoading,
    createBooking,
    cancelBooking
  };
}

export function useAdminBookings() {
  const queryClient = useQueryClient();

  const { data: allBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      // First get bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          seats (id, label, row_num, col_num),
          shifts (id, name, start_time, end_time)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then get profiles for each booking
      const userIds = [...new Set(bookings?.map(b => b.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, student_id')
        .in('id', userIds);

      // Merge profiles with bookings
      const bookingsWithProfiles = bookings?.map(booking => ({
        ...booking,
        profiles: profiles?.find(p => p.id === booking.user_id)
      })) || [];

      return bookingsWithProfiles;
    }
  });

  const approveBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'CONFIRMED',
          admin_approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          payment_status: 'PAID'
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      toast({
        title: 'Booking Approved',
        description: 'The booking has been approved and confirmed.'
      });
    }
  });

  const rejectBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'CANCELLED',
          admin_approved: false
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings'] });
      toast({
        title: 'Booking Rejected',
        description: 'The booking has been rejected.'
      });
    }
  });

  return {
    allBookings,
    loading: isLoading,
    approveBooking,
    rejectBooking,
    refetch
  };
}
