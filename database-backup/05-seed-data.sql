-- StudySpace Database: Seed Data
-- Run after 04-rls-policies.sql

-- ============================================
-- DEFAULT ZONES
-- ============================================
INSERT INTO public.zones (name, description, icon, color) VALUES
  ('Quiet Zone', 'Silent study area for focused work', 'Volume2', 'blue'),
  ('Group Study', 'Collaborative spaces for group discussions', 'Users', 'green'),
  ('Computer Lab', 'Workstations with desktop computers', 'Monitor', 'purple'),
  ('Reading Area', 'Comfortable seating for reading', 'BookOpen', 'amber');

-- ============================================
-- DEFAULT SHIFTS (07:00 - 22:00 IST)
-- ============================================
INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Morning', '07:00:00', '14:30:00'),
  ('Evening', '14:30:00', '22:00:00');

-- ============================================
-- DEFAULT SEATS (12 seats per zone = 48 total)
-- ============================================
WITH zone_ids AS (
  SELECT id, name FROM public.zones
)
INSERT INTO public.seats (zone_id, label, row_num, col_num, capacity)
SELECT 
  z.id,
  z.name || '-' || row_num || col_num,
  row_num,
  col_num,
  CASE WHEN z.name = 'Group Study' THEN 4 ELSE 1 END
FROM zone_ids z
CROSS JOIN generate_series(1, 3) AS row_num
CROSS JOIN generate_series(1, 4) AS col_num;

-- ============================================
-- DEFAULT WIFI SETTINGS
-- ============================================
INSERT INTO public.wifi_settings (ssid, password) VALUES
  ('StudySpace-WiFi', 'Welcome@Study2025');

-- ============================================
-- HELPER: Make a user admin (replace USER_UUID)
-- ============================================
-- To make a user admin after they sign up, run:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_UUID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
