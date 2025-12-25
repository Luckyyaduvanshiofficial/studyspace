import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Membership {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';
  starts_at: string;
  expires_at: string;
  wifi_password: string | null;
  created_at: string;
  updated_at: string;
}

export function useMembership() {
  const { user } = useAuth();

  const { data: membership, isLoading, error } = useQuery({
    queryKey: ['membership', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Membership | null;
    },
    enabled: !!user,
  });

  const isActive = membership?.status === 'ACTIVE' && 
    new Date(membership.expires_at) > new Date();

  return {
    membership,
    isActive,
    isLoading,
    error,
  };
}
