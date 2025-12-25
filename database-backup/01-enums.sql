-- StudySpace Database: Enum Types
-- Run this file first before creating tables

-- Create enum for user roles (RBAC)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM (
  'CONFIRMED',   -- Booking is confirmed
  'CANCELLED',   -- User cancelled the booking
  'COMPLETED',   -- Booking period has ended successfully
  'NO_SHOW',     -- User didn't check in within grace period
  'RELEASED',    -- Seat was released (no-show or admin action)
  'HOLD'         -- Temporary hold while user confirms/pays
);

-- Create enum for membership status
CREATE TYPE public.membership_status AS ENUM (
  'ACTIVE',      -- Membership is currently active
  'EXPIRED',     -- Membership has expired
  'SUSPENDED',   -- Membership suspended by admin
  'PENDING'      -- Awaiting payment/activation
);
