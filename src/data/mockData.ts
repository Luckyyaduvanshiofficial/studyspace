import { Zone, Seat, Shift, Booking, User } from '@/types/library';

export const zones: Zone[] = [
  {
    id: 'quiet',
    name: 'Quiet Zone',
    description: 'Silent study area for focused work',
    icon: 'volume-x',
    color: 'chart-1'
  },
  {
    id: 'group',
    name: 'Group Study',
    description: 'Collaborative workspace for team projects',
    icon: 'users',
    color: 'chart-2'
  },
  {
    id: 'open',
    name: 'Open Area',
    description: 'Flexible seating with natural light',
    icon: 'sun',
    color: 'chart-3'
  },
  {
    id: 'computer',
    name: 'Computer Lab',
    description: 'Workstations with desktop computers',
    icon: 'monitor',
    color: 'chart-4'
  }
];

export const shifts: Shift[] = [
  {
    id: 'morning',
    name: 'Morning Shift',
    startTime: '07:00',
    endTime: '14:30'
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    startTime: '14:30',
    endTime: '22:00'
  }
];

// Generate seats for each zone
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  
  // Quiet Zone - 4x5 grid
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      seats.push({
        id: `quiet-${row}-${col}`,
        zoneId: 'quiet',
        label: `Q${row * 5 + col + 1}`,
        capacity: 1,
        isActive: true,
        row,
        col
      });
    }
  }
  
  // Group Study - 3x4 grid (larger tables)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      seats.push({
        id: `group-${row}-${col}`,
        zoneId: 'group',
        label: `G${row * 4 + col + 1}`,
        capacity: 4,
        isActive: true,
        row,
        col
      });
    }
  }
  
  // Open Area - 3x6 grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      seats.push({
        id: `open-${row}-${col}`,
        zoneId: 'open',
        label: `O${row * 6 + col + 1}`,
        capacity: 1,
        isActive: true,
        row,
        col
      });
    }
  }
  
  // Computer Lab - 2x8 grid
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 8; col++) {
      seats.push({
        id: `computer-${row}-${col}`,
        zoneId: 'computer',
        label: `C${row * 8 + col + 1}`,
        capacity: 1,
        isActive: true,
        row,
        col
      });
    }
  }
  
  return seats;
};

export const seats: Seat[] = generateSeats();

// Mock booked seats (some seats already taken)
export const bookedSeats: { seatId: string; shiftId: string; date: string }[] = [
  { seatId: 'quiet-0-0', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'quiet-0-1', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'quiet-1-2', shiftId: 'evening', date: new Date().toISOString().split('T')[0] },
  { seatId: 'group-0-0', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'group-0-0', shiftId: 'evening', date: new Date().toISOString().split('T')[0] },
  { seatId: 'open-0-3', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'computer-0-0', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'computer-0-1', shiftId: 'morning', date: new Date().toISOString().split('T')[0] },
  { seatId: 'computer-0-2', shiftId: 'evening', date: new Date().toISOString().split('T')[0] },
];

export const currentUser: User = {
  id: 'user-1',
  fullName: 'Lucky Student',
  email: 'lucky@university.edu',
  phone: '+91 98765 43210',
  studentId: 'STU2024001',
  createdAt: new Date('2024-01-15')
};

// Mock user bookings
export const userBookings: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    seatId: 'quiet-2-3',
    shiftId: 'morning',
    isFullDay: false,
    startsAt: new Date(),
    endsAt: new Date(),
    status: 'CONFIRMED',
    createdAt: new Date(),
    seat: seats.find(s => s.id === 'quiet-2-3'),
    shift: shifts[0],
    zone: zones[0]
  },
  {
    id: 'booking-2',
    userId: 'user-1',
    seatId: 'open-1-2',
    shiftId: 'evening',
    isFullDay: false,
    startsAt: new Date(Date.now() + 86400000), // Tomorrow
    endsAt: new Date(Date.now() + 86400000),
    status: 'CONFIRMED',
    createdAt: new Date(),
    seat: seats.find(s => s.id === 'open-1-2'),
    shift: shifts[1],
    zone: zones[2]
  }
];

// Stats for admin dashboard
export const occupancyStats = {
  today: {
    morning: 67,
    evening: 45
  },
  weekly: [
    { day: 'Mon', morning: 72, evening: 58 },
    { day: 'Tue', morning: 85, evening: 62 },
    { day: 'Wed', morning: 78, evening: 71 },
    { day: 'Thu', morning: 69, evening: 55 },
    { day: 'Fri', morning: 82, evening: 68 },
    { day: 'Sat', morning: 45, evening: 38 },
    { day: 'Sun', morning: 32, evening: 28 }
  ],
  hourlyHeatmap: Array.from({ length: 15 }, (_, i) => ({
    hour: `${7 + i}:00`,
    occupancy: Math.floor(Math.random() * 100)
  }))
};

export const isSeatBooked = (seatId: string, shiftId: string, date: string): boolean => {
  return bookedSeats.some(
    b => b.seatId === seatId && b.shiftId === shiftId && b.date === date
  );
};
