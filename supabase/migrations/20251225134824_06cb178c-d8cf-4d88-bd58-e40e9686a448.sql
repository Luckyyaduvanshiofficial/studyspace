-- Add payment status and amount to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2) DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_approved boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Create a default zone for the single study room (if not already replaced)
-- First delete existing zone data and seats
DELETE FROM public.seats;
DELETE FROM public.zones;

-- Insert single main study room
INSERT INTO public.zones (id, name, description, icon, color, is_active)
VALUES (
  gen_random_uuid(), 
  'Main Study Hall', 
  'Single large room with 100 student capacity and unlimited high-speed 5G internet', 
  'BookOpen', 
  'primary',
  true
);

-- Create 100 seats in a 10x10 grid for the main study hall
DO $$
DECLARE
  zone_id uuid;
  row_num integer;
  col_num integer;
  seat_num integer;
BEGIN
  SELECT id INTO zone_id FROM public.zones WHERE name = 'Main Study Hall' LIMIT 1;
  
  seat_num := 1;
  FOR row_num IN 1..10 LOOP
    FOR col_num IN 1..10 LOOP
      INSERT INTO public.seats (zone_id, label, capacity, row_num, col_num, is_active)
      VALUES (zone_id, 'S' || LPAD(seat_num::text, 3, '0'), 1, row_num, col_num, true);
      seat_num := seat_num + 1;
    END LOOP;
  END LOOP;
END $$;

-- Enable realtime for bookings and seats
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;

-- Add RLS policy for admins to approve bookings
CREATE POLICY "Admins can approve bookings" ON public.bookings
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));