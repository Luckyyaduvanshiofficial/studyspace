-- StudySpace Database: Functions and Triggers
-- Run after 02-tables.sql

-- Function to check if user has a specific role (SECURITY DEFINER to avoid RLS recursion)
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

-- Function to check if user has active membership
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

-- Function to handle new user registration (creates profile, role, and membership)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile from user metadata
  INSERT INTO public.profiles (id, full_name, email, phone, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'student_id'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default membership (30 days active)
  INSERT INTO public.memberships (user_id, plan_name, status, expires_at)
  VALUES (NEW.id, 'Basic', 'ACTIVE', NOW() + INTERVAL '30 days');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
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

-- Triggers for updated_at columns
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

  -- Check for overlapping bookings on the same seat (excluding cancelled bookings)
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
