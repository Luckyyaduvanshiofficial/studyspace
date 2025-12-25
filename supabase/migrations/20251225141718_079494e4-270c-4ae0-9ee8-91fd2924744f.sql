-- Comprehensive Security Fix for All Identified Issues

-- 1. Remove wifi_password from memberships table (should only be in wifi_settings)
ALTER TABLE public.memberships DROP COLUMN IF EXISTS wifi_password;

-- 2. Update seat_blocks policy to require authentication
DROP POLICY IF EXISTS "Anyone can view seat blocks" ON public.seat_blocks;
CREATE POLICY "Authenticated users can view seat blocks"
  ON public.seat_blocks FOR SELECT
  TO authenticated
  USING (TRUE);

-- 3. Update zones policy to require authentication
DROP POLICY IF EXISTS "Anyone can view active zones" ON public.zones;
CREATE POLICY "Authenticated users can view active zones"
  ON public.zones FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- 4. Update seats policy to require authentication
DROP POLICY IF EXISTS "Anyone can view active seats" ON public.seats;
CREATE POLICY "Authenticated users can view active seats"
  ON public.seats FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- 5. Update shifts policy to require authentication
DROP POLICY IF EXISTS "Anyone can view active shifts" ON public.shifts;
CREATE POLICY "Authenticated users can view active shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- 6. Force RLS on all remaining tables
ALTER TABLE public.zones FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seats FORCE ROW LEVEL SECURITY;
ALTER TABLE public.shifts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seat_blocks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.memberships FORCE ROW LEVEL SECURITY;

-- 7. Ensure all tables have RLS enabled
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Add security documentation comments
COMMENT ON TABLE public.zones IS 'Study zones - authenticated access only';
COMMENT ON TABLE public.seats IS 'Seat inventory - authenticated access only';
COMMENT ON TABLE public.shifts IS 'Time shifts - authenticated access only';
COMMENT ON TABLE public.seat_blocks IS 'Seat blocking for maintenance - authenticated access only';