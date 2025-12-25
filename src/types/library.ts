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
  zoneId: string;
  label: string;
  capacity: number;
  isActive: boolean;
  row: number;
  col: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RELEASED' | 'HOLD';
export type BookingType = 'HALF_DAY' | 'FULL_DAY';

export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  shiftId?: string;
  isFullDay: boolean;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  createdAt: Date;
  seat?: Seat;
  shift?: Shift;
  zone?: Zone;
}

export interface Attendance {
  id: string;
  bookingId: string;
  checkedInAt?: Date;
  checkedOutAt?: Date;
}

export interface SeatAvailability {
  seat: Seat;
  zone: Zone;
  morningAvailable: boolean;
  eveningAvailable: boolean;
}
