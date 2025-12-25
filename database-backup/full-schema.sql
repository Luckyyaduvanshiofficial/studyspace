-- ============================================
-- StudySpace Self-Study Library Management System
-- Complete Database Schema (Updated with Security Fixes)
-- ============================================
-- This file contains the complete schema in a single file
-- for easy deployment to a new database.
-- Last Updated: December 2025
-- ============================================

-- ============================================
-- PART 1: ENUM TYPES
-- ============================================

-- Create enum for user roles (RBAC)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM (
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
  'RELEASED',
  'HOLD'
);

-- Create enum for membership status
CREATE TYPE public.membership_status AS ENUM (
  'ACTIVE',
  'EXPIRED',
  'SUSPENDED',
  'PENDING'
);

-- ============================================
-- PART 2: TABLE DEFINITIONS
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  student_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table for RBAC (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Memberships table (wifi_password removed - use wifi_settings only)
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Basic',
  status membership_status NOT NULL DEFAULT 'ACTIVE',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones table (single Main Study Hall)
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  color TEXT NOT NULL DEFAULT 'blue',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seats table (100 seats: S001-S100 in 10x10 grid)
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  capacity INTEGER DEFAULT 1,
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table (with payment and approval workflow)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  is_full_day BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status NOT NULL DEFAULT 'HOLD',
  payment_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'PENDING',
  admin_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Security constraints
  CONSTRAINT check_date_range CHECK (starts_at < ends_at),
  CONSTRAINT check_payment_amount CHECK (payment_amount >= 0)
);

-- Attendance table (check-in/check-out via QR code)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seat blocks table (maintenance or admin reserved)
CREATE TABLE public.seat_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID REFERENCES public.seats(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WiFi settings table (global wifi config for active members)
CREATE TABLE public.wifi_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ssid TEXT NOT NULL DEFAULT 'StudySpace-WiFi',
  password TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_settings ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (extra security layer)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.zones FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seats FORCE ROW LEVEL SECURITY;
ALTER TABLE public.shifts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.bookings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.attendance FORCE ROW LEVEL SECURITY;
ALTER TABLE public.seat_blocks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.wifi_settings FORCE ROW LEVEL SECURITY;

-- Enable Realtime for bookings and seats
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;

-- ============================================
-- PART 3: FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to check user role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check active membership
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND status = 'ACTIVE'
      AND expires_at > NOW()
  )
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'student_id'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.memberships (user_id, plan_name, status, expires_at)
  VALUES (NEW.id, 'Basic', 'ACTIVE', NOW() + INTERVAL '30 days');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate booking constraints (security)
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if seat is active
  IF NOT EXISTS (
    SELECT 1 FROM public.seats 
    WHERE id = NEW.seat_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Seat is not active or does not exist';
  END IF;

  -- Check for overlapping bookings on the same seat
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE seat_id = NEW.seat_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status NOT IN ('CANCELLED', 'NO_SHOW', 'RELEASED')
      AND (NEW.starts_at, NEW.ends_at) OVERLAPS (starts_at, ends_at)
  ) THEN
    RAISE EXCEPTION 'Seat is already booked for this time period';
  END IF;

  -- Check if booking time falls within a seat block period
  IF EXISTS (
    SELECT 1 FROM public.seat_blocks
    WHERE seat_id = NEW.seat_id
      AND (NEW.starts_at, NEW.ends_at) OVERLAPS (starts_at, ends_at)
  ) THEN
    RAISE EXCEPTION 'Seat is blocked during this time period';
  END IF;

  -- Check if shift is active (if shift_id is provided)
  IF NEW.shift_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.shifts 
    WHERE id = NEW.shift_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Shift is not active or does not exist';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for booking validation
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- ============================================
-- PART 4: RLS POLICIES (Authenticated Access Only)
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Memberships policies
CREATE POLICY "Users can view their own membership"
  ON public.memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships"
  ON public.memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Zones policies (authenticated users only)
CREATE POLICY "Authenticated users can view active zones"
  ON public.zones FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage zones"
  ON public.zones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seats policies (authenticated users only)
CREATE POLICY "Authenticated users can view active seats"
  ON public.seats FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage seats"
  ON public.seats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Shifts policies (authenticated users only)
CREATE POLICY "Authenticated users can view active shifts"
  ON public.shifts FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage shifts"
  ON public.shifts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_membership(auth.uid()));

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can approve bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Attendance policies
CREATE POLICY "Users can view their own attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = attendance.booking_id 
    AND bookings.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seat blocks policies (authenticated users only)
CREATE POLICY "Authenticated users can view seat blocks"
  ON public.seat_blocks FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage seat blocks"
  ON public.seat_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WiFi settings policies
CREATE POLICY "Active members can view wifi"
  ON public.wifi_settings FOR SELECT TO authenticated
  USING (public.has_active_membership(auth.uid()));

CREATE POLICY "Admins can manage wifi settings"
  ON public.wifi_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PART 5: SEED DATA
-- ============================================

-- Single Main Study Hall zone
INSERT INTO public.zones (name, description, icon, color) VALUES
  ('Main Study Hall', 'Large study area with 100 seats and unlimited 5G internet', 'BookOpen', 'blue');

-- Shifts: Morning and Evening
INSERT INTO public.shifts (name, start_time, end_time) VALUES
  ('Morning', '07:00:00', '14:30:00'),
  ('Evening', '14:30:00', '22:00:00');

-- 100 seats (S001-S100) in 10x10 grid
WITH zone_id AS (
  SELECT id FROM public.zones WHERE name = 'Main Study Hall' LIMIT 1
)
INSERT INTO public.seats (zone_id, label, row_num, col_num, capacity)
SELECT 
  z.id,
  'S' || LPAD((((row_num - 1) * 10) + col_num)::TEXT, 3, '0'),
  row_num,
  col_num,
  1
FROM zone_id z
CROSS JOIN generate_series(1, 10) AS row_num
CROSS JOIN generate_series(1, 10) AS col_num;

-- Default WiFi settings
INSERT INTO public.wifi_settings (ssid, password) VALUES
  ('StudySpace-5G', 'Welcome@Study2025');
