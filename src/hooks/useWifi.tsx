import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMembership } from './useMembership';

export interface WifiSettings {
  id: string;
  ssid: string;
  password: string;
  updated_at: string;
}

export function useWifi() {
  const { isActive } = useMembership();

  const { data: wifi, isLoading, error } = useQuery({
    queryKey: ['wifi-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wifi_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as WifiSettings | null;
    },
    enabled: isActive,
  });

  return {
    wifi,
    canAccessWifi: isActive,
    isLoading,
    error,
  };
}
