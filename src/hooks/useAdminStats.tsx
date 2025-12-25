import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminStats() {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59`;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', today],
    queryFn: async () => {
      // Get total seats
      const { data: seats } = await supabase
        .from('seats')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const totalSeats = seats?.length || 0;

      // Get today's bookings
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('starts_at', startOfDay)
        .lte('starts_at', endOfDay);

      const confirmedBookings = todayBookings?.filter(b => b.status === 'CONFIRMED') || [];
      const pendingBookings = todayBookings?.filter(b => b.status === 'HOLD') || [];
      const completedBookings = todayBookings?.filter(b => b.status === 'COMPLETED') || [];

      // Calculate occupancy
      const currentHour = new Date().getHours();
      const morningOccupancy = todayBookings?.filter(b => 
        (b.is_full_day || new Date(b.starts_at).getHours() < 14) && 
        ['CONFIRMED', 'COMPLETED'].includes(b.status)
      ).length || 0;
      
      const eveningOccupancy = todayBookings?.filter(b => 
        (b.is_full_day || new Date(b.starts_at).getHours() >= 14) && 
        ['CONFIRMED', 'COMPLETED'].includes(b.status)
      ).length || 0;

      // Get total revenue from approved bookings
      const { data: allApprovedBookings } = await supabase
        .from('bookings')
        .select('payment_amount')
        .eq('admin_approved', true)
        .eq('payment_status', 'PAID');

      const totalRevenue = allApprovedBookings?.reduce((sum, b) => 
        sum + (Number(b.payment_amount) || 0), 0) || 0;

      // Get today's revenue
      const todayRevenue = confirmedBookings.reduce((sum, b) => 
        sum + (Number(b.payment_amount) || 0), 0);

      // Get recent activity
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (full_name),
          seats (label)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get attendance records for today
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select(`
          *,
          bookings (
            id,
            user_id,
            seats (label),
            profiles:user_id (full_name)
          )
        `)
        .gte('created_at', startOfDay)
        .order('created_at', { ascending: false });

      return {
        totalSeats,
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        morningOccupancy: totalSeats > 0 ? Math.round((morningOccupancy / totalSeats) * 100) : 0,
        eveningOccupancy: totalSeats > 0 ? Math.round((eveningOccupancy / totalSeats) * 100) : 0,
        availableSeats: totalSeats - (currentHour < 14 ? morningOccupancy : eveningOccupancy),
        totalRevenue,
        todayRevenue,
        recentActivity: recentBookings || [],
        attendanceRecords: attendanceRecords || []
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return { stats, loading: isLoading };
}
