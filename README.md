<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Cloud-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</p>

<h1 align="center">📚 StudySpace - Self-Study Library Management System</h1>

<p align="center">
  <strong>A modern, full-stack seat booking system for self-study libraries with real-time availability, payment tracking, and QR code check-in.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-pages--components">Pages</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

---

## 🌟 Features

### 👤 For Students
| Feature | Description |
|---------|-------------|
| 📅 **Seat Booking** | Book seats up to 7 days in advance with date picker |
| 🪑 **Visual Seat Map** | Interactive 10x10 grid showing real-time availability |
| ⏰ **Shift Selection** | Choose Morning (07:00-14:30) or Evening (14:30-22:00) |
| 💰 **Transparent Pricing** | ₹400 for half day, ₹500 for full day |
| 📱 **QR Code** | Get QR code for quick check-in at entrance |
| 📶 **WiFi Access** | View WiFi credentials with active membership |

### 👨‍💼 For Admins
| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time occupancy stats and revenue tracking |
| ✅ **Approval System** | Approve/reject bookings after payment verification |
| 📷 **QR Scanner** | Scan QR codes for instant check-in/check-out |
| 👥 **User Management** | View all bookings with user details |
| 💵 **Revenue Tracking** | Track daily and total revenue |

### 🔄 Real-Time Features
- ⚡ Live seat availability updates via Supabase Realtime
- 🔔 Instant booking status changes
- 📈 Auto-refreshing admin statistics

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ⚛️ **React 18** | UI Framework with Hooks |
| 📘 **TypeScript** | Type-safe development |
| 🎨 **Tailwind CSS** | Utility-first styling |
| 🧩 **shadcn/ui** | Beautiful UI components |
| 🔄 **TanStack Query** | Data fetching & caching |
| 🛣️ **React Router v6** | Client-side routing |
| 📅 **date-fns** | Date manipulation |
| 📊 **Recharts** | Charts & analytics |
| 📱 **QRCode.react** | QR code generation |
| 📷 **html5-qrcode** | QR code scanning |

### Backend (Supabase)
| Technology | Purpose |
|------------|---------|
| 🗄️ **PostgreSQL** | Relational database |
| 🔐 **Row Level Security** | Data access control |
| ⚡ **Realtime** | Live data subscriptions |
| 🔑 **Auth** | User authentication |
| 🔧 **Database Functions** | Server-side logic |

---

## 📁 Project Structure

```
📦 studyspace/
├── 📂 src/
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 admin/           # Admin-specific components
│   │   │   ├── HeatmapChart.tsx
│   │   │   ├── OccupancyChart.tsx
│   │   │   ├── QRScanner.tsx   # 📷 QR code scanner
│   │   │   └── StatsCard.tsx
│   │   ├── 📂 booking/         # Booking flow components
│   │   │   ├── BookingQRCode.tsx   # 📱 QR code display
│   │   │   ├── BookingSummary.tsx  # 📋 Summary sidebar
│   │   │   ├── DatePicker.tsx      # 📅 Calendar picker
│   │   │   ├── SeatMap.tsx         # 🪑 Visual seat grid
│   │   │   ├── ShiftSelector.tsx   # ⏰ Shift/fee selector
│   │   │   └── ZoneSelector.tsx
│   │   ├── 📂 dashboard/       # User dashboard components
│   │   │   └── BookingCard.tsx
│   │   ├── 📂 layout/          # Layout components
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx      # 🧭 Navigation bar
│   │   │   └── Layout.tsx      # 📐 Page wrapper
│   │   ├── 📂 ui/              # shadcn/ui components
│   │   └── 📂 wifi/
│   │       └── WifiAccessCard.tsx  # 📶 WiFi display
│   │
│   ├── 📂 hooks/               # Custom React hooks
│   │   ├── useAdminStats.tsx   # 📊 Admin statistics
│   │   ├── useAttendance.tsx   # ✅ Check-in/out logic
│   │   ├── useAuth.tsx         # 🔐 Authentication
│   │   ├── useBookings.tsx     # 📅 Booking CRUD
│   │   ├── useMembership.tsx   # 💳 Membership status
│   │   ├── useSeats.tsx        # 🪑 Seat data + realtime
│   │   ├── useUserRole.tsx     # 👤 Role checking
│   │   └── useWifi.tsx         # 📶 WiFi credentials
│   │
│   ├── 📂 pages/               # Route pages
│   │   ├── AdminDashboard.tsx  # 👨‍💼 Admin panel
│   │   ├── Auth.tsx            # 🔑 Login/Signup
│   │   ├── BookSeat.tsx        # 🎫 Booking flow
│   │   ├── Landing.tsx         # 🏠 Homepage
│   │   ├── NotFound.tsx        # 404 page
│   │   └── UserDashboard.tsx   # 👤 User panel
│   │
│   ├── 📂 integrations/
│   │   └── 📂 supabase/
│   │       ├── client.ts       # Supabase client
│   │       └── types.ts        # Auto-generated types
│   │
│   ├── 📂 types/
│   │   └── library.ts          # TypeScript interfaces
│   │
│   ├── App.tsx                 # 🛣️ Routes & providers
│   ├── main.tsx                # ⚡ Entry point
│   └── index.css               # 🎨 Global styles
│
├── 📂 database-backup/         # 💾 SQL backup files
│   ├── README.md               # Migration guide
│   ├── 01-enums.sql
│   ├── 02-tables.sql
│   ├── 03-functions.sql
│   ├── 04-rls-policies.sql
│   ├── 05-seed-data.sql
│   └── full-schema.sql         # Complete schema
│
└── 📂 supabase/
    └── config.toml             # Supabase config
```

---

## 🗄️ Database Schema

### 📊 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   auth.users│────<│  profiles   │     │  user_roles │
│             │     │             │     │             │
│ id          │     │ id (FK)     │     │ user_id(FK) │
│ email       │     │ full_name   │     │ role        │
│ ...         │     │ phone       │     │ (admin/user)│
└─────────────┘     │ student_id  │     └─────────────┘
       │            └─────────────┘
       │
       ├────────────────────────────────┐
       │                                │
       ▼                                ▼
┌─────────────┐                 ┌─────────────┐
│ memberships │                 │  bookings   │
│             │                 │             │
│ user_id(FK) │                 │ user_id(FK) │
│ plan_name   │                 │ seat_id(FK) │
│ status      │                 │ shift_id(FK)│
│ expires_at  │                 │ status      │
└─────────────┘                 │ payment_amt │
                                │ admin_appr  │
                                └──────┬──────┘
                                       │
                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   zones     │────<│   seats     │     │ attendance  │
│             │     │             │     │             │
│ name        │     │ zone_id(FK) │     │ booking_id  │
│ description │     │ label       │     │ checked_in  │
│ is_active   │     │ row_num     │     │ checked_out │
└─────────────┘     │ col_num     │     └─────────────┘
                    └─────────────┘
                    
┌─────────────┐     ┌─────────────┐
│   shifts    │     │wifi_settings│
│             │     │             │
│ name        │     │ ssid        │
│ start_time  │     │ password    │
│ end_time    │     └─────────────┘
└─────────────┘
```

### 📋 Tables Overview

| Table | Description | Key Fields |
|-------|-------------|------------|
| 👤 `profiles` | User information | full_name, email, phone, student_id |
| 🔐 `user_roles` | Role assignments | user_id, role (admin/user) |
| 💳 `memberships` | Subscription status | plan_name, status, expires_at |
| 🏢 `zones` | Study areas | name, description (Main Study Hall) |
| 🪑 `seats` | Individual seats | label (S001-S100), row_num, col_num |
| ⏰ `shifts` | Time slots | Morning/Evening with times |
| 📅 `bookings` | Reservations | status, payment_amount, admin_approved |
| ✅ `attendance` | Check-in records | checked_in_at, checked_out_at |
| 📶 `wifi_settings` | WiFi credentials | ssid, password |

### 🔒 Row Level Security (RLS)

```sql
-- Example: Users can only see their own bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings FOR SELECT 
USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "Admins can manage all bookings" 
ON public.bookings FOR ALL 
USING (has_role(auth.uid(), 'admin'));
```

---

## 📄 Pages & Components

### 🏠 Landing Page (`/`)
**File:** `src/pages/Landing.tsx`

The homepage showcasing the library features with a hero section and zone cards.

**Key Components Used:**
- `Layout` - Page wrapper with header/footer
- Hero section with CTA buttons
- Statistics display (50+ seats, 15hrs operating)

---

### 🎫 Book Seat Page (`/book`)
**File:** `src/pages/BookSeat.tsx`

The main booking flow with 3 steps: Date → Shift → Seat.

**Key Components:**
| Component | Purpose |
|-----------|---------|
| `DatePicker` | Calendar for date selection (7 days ahead) |
| `ShiftSelector` | Half/Full day toggle with prices |
| `SeatMap` | 10x10 interactive seat grid |
| `BookingSummary` | Sidebar with booking details & fee |

**Hooks Used:**
- `useSeats()` - Fetches seats and shifts from database
- `useBookedSeats()` - Real-time booked seat tracking
- `useBookings()` - Creates new bookings

**Booking Flow:**
```
1. Select Date 📅
      ↓
2. Choose Shift ⏰
   - Half Day: ₹400
   - Full Day: ₹500
      ↓
3. Pick Seat 🪑
   (Real-time availability)
      ↓
4. Confirm Booking ✅
   (Status: HOLD)
      ↓
5. Pay at Counter 💰
      ↓
6. Admin Approves ✓
   (Status: CONFIRMED)
```

---

### 🔑 Auth Page (`/auth`)
**File:** `src/pages/Auth.tsx`

Login and registration with email/password.

**Features:**
- Toggle between Login/Sign Up
- Form validation with Zod
- Auto-creates profile, membership, and role on signup
- Redirects to dashboard after auth

---

### 👤 User Dashboard (`/dashboard`)
**File:** `src/pages/UserDashboard.tsx`

User's personal booking management area.

**Sections:**
| Section | Description |
|---------|-------------|
| 📊 Quick Stats | Upcoming, completed, total bookings |
| 📅 Active Bookings | Current and pending reservations |
| 📜 Booking History | Past completed bookings |
| 👤 Profile Card | User info and membership status |
| 📱 QR Code | For confirmed bookings |
| 📶 WiFi Card | Credentials (if membership active) |

---

### 👨‍💼 Admin Dashboard (`/admin`)
**File:** `src/pages/AdminDashboard.tsx`

Admin control panel for managing the library.

**Features:**
| Feature | Description |
|---------|-------------|
| 📊 Stats Cards | Occupancy, pending approvals, revenue |
| 📋 Booking List | Tabs for Pending/Today/All bookings |
| ✅ Approve/Reject | One-click booking management |
| 📷 QR Scanner | Scan for check-in/check-out |
| 💰 Fee Display | Shows current pricing structure |

**Admin Actions:**
```
Pending Booking → [Approve] → CONFIRMED + PAID
               → [Reject]  → CANCELLED

Confirmed Booking → [Check In]  → Creates attendance
                 → [Check Out] → COMPLETED
```

---

## 🪝 Custom Hooks

### 🔐 `useAuth`
```typescript
const { user, session, signUp, signIn, signOut, loading } = useAuth();
```
Manages authentication state with Supabase Auth.

### 🪑 `useSeats`
```typescript
const { seats, shifts, loading, refetchSeats } = useSeats();
```
Fetches all active seats and shifts from database.

### 📅 `useBookedSeats`
```typescript
const { bookedSeatIds, loading, refetch } = useBookedSeats(date, shiftId, isFullDay);
```
Real-time tracking of booked seats with Supabase Realtime subscription.

### 📊 `useBookings`
```typescript
const { userBookings, createBooking, cancelBooking, loading } = useBookings();
```
CRUD operations for user bookings.

### 👨‍💼 `useAdminBookings`
```typescript
const { allBookings, approveBooking, rejectBooking, refetch } = useAdminBookings();
```
Admin booking management with approve/reject mutations.

### ✅ `useAttendance`
```typescript
const { checkIn, checkOut } = useAttendance();
```
Check-in/check-out functionality for admin.

### 👤 `useUserRole`
```typescript
const { isAdmin, loading } = useUserRole();
```
Checks if current user has admin role.

---

## 💰 Fee Structure

| Booking Type | Duration | Price |
|--------------|----------|-------|
| 🌅 Half Day (Morning) | 07:00 - 14:30 | ₹400 |
| 🌆 Half Day (Evening) | 14:30 - 22:00 | ₹400 |
| ☀️ Full Day | 07:00 - 22:00 | ₹500 |

Defined in `src/types/library.ts`:
```typescript
export const FEES = {
  HALF_DAY: 400,
  FULL_DAY: 500
} as const;
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (or use Lovable Cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studyspace.git

# Navigate to project
cd studyspace

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The `.env` file is auto-configured with Lovable Cloud:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Database Setup
If migrating to a new Supabase project:
1. Go to `database-backup/` folder
2. Run `full-schema.sql` in Supabase SQL Editor
3. Or run individual files in order (01-05)

### Making an Admin User
```sql
-- Replace with your email
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);
```

---

## 🔄 Booking Status Flow

```
┌──────────┐    User     ┌──────────┐    Admin    ┌──────────┐
│          │  Requests   │          │  Approves   │          │
│   NEW    │────────────>│   HOLD   │────────────>│CONFIRMED │
│          │             │          │             │          │
└──────────┘             └────┬─────┘             └────┬─────┘
                              │                        │
                         Admin│Rejects            Check│In/Out
                              ▼                        ▼
                        ┌──────────┐            ┌──────────┐
                        │CANCELLED │            │COMPLETED │
                        └──────────┘            └──────────┘
```

---

## 🛡️ Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure role checking with `has_role()` function
- ✅ Membership validation with `has_active_membership()`
- ✅ Admin-only access to sensitive operations
- ✅ SECURITY DEFINER functions to prevent recursion
- ✅ Client-side auth state management
- ✅ Protected routes based on auth/role status

---

## 📞 Support

For issues or questions:
- 📧 Email: support@studyspace.com
- 💬 Discord: StudySpace Community

---

<p align="center">
  Made with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
