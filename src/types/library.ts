// Types for the Self-Study Library Management System

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  studentId: string;
  createdAt: Date;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Seat {
  id: string;
  zoneId?: string;
  zone_id?: string;
  label: string;
  capacity: number | null;
  isActive?: boolean;
  is_active?: boolean | null;
  row: number;
  col: number;
  row_num?: number;
  col_num?: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RELEASED' | 'HOLD';
export type BookingType = 'HALF_DAY' | 'FULL_DAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: string;
  userId?: string;
  user_id?: string;
  seatId?: string;
  seat_id?: string;
  shiftId?: string;
  shift_id?: string;
  isFullDay?: boolean;
  is_full_day?: boolean | null;
  startsAt?: Date;
  starts_at?: string;
  endsAt?: Date;
  ends_at?: string;
  status: BookingStatus;
  createdAt?: Date;
  created_at?: string;
  seat?: Seat;
  seats?: Seat;
  shift?: Shift;
  shifts?: Shift;
  zone?: Zone;
  payment_amount?: number;
  payment_status?: PaymentStatus;
  admin_approved?: boolean;
  approved_at?: string;
}

export interface Attendance {
  id: string;
  bookingId?: string;
  booking_id?: string;
  checkedInAt?: Date;
  checked_in_at?: string;
  checkedOutAt?: Date;
  checked_out_at?: string;
}

export interface SeatAvailability {
  seat: Seat;
  zone: Zone;
  morningAvailable: boolean;
  eveningAvailable: boolean;
}

// Fee structure
export const FEES = {
  HALF_DAY: 400,
  FULL_DAY: 500
} as const;
