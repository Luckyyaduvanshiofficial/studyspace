-- Fix: Insufficient Server-Side Input Validation for Bookings

-- 1. Add CHECK constraints for date range and payment validation
ALTER TABLE public.bookings 
ADD CONSTRAINT check_date_range CHECK (starts_at < ends_at);

ALTER TABLE public.bookings 
ADD CONSTRAINT check_payment_amount CHECK (payment_amount >= 0);

-- 2. Create function to validate booking conflicts and seat availability
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

-- 3. Create trigger to validate bookings on INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking();

-- Add comments for documentation
COMMENT ON FUNCTION public.validate_booking() IS 'Validates booking constraints: seat availability, no overlapping bookings, no seat blocks, active shift';
COMMENT ON CONSTRAINT check_date_range ON public.bookings IS 'Ensures booking start time is before end time';
COMMENT ON CONSTRAINT check_payment_amount ON public.bookings IS 'Ensures payment amount is non-negative';