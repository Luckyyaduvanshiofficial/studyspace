# StudySpace Database Backup & Migration Guide

This folder contains all SQL files needed to recreate the database schema for the Self-Study Library Management System.

## Files Overview

| File | Description |
|------|-------------|
| `01-enums.sql` | Custom enum types (roles, booking status, membership status) |
| `02-tables.sql` | All table definitions |
| `03-functions.sql` | Database functions (role checking, membership validation, triggers) |
| `04-rls-policies.sql` | Row Level Security policies for all tables |
| `05-seed-data.sql` | Default zones, shifts, and wifi settings |
| `full-schema.sql` | Complete schema in a single file |

## How to Use

### Option 1: Run Complete Schema (Recommended)

If you're setting up a fresh database, run the complete schema file:

```bash
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f full-schema.sql
```

Or in Supabase SQL Editor, copy and paste the contents of `full-schema.sql`.

### Option 2: Run Individual Files (For Debugging)

Run files in order:

```bash
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f 01-enums.sql
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f 02-tables.sql
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f 03-functions.sql
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f 04-rls-policies.sql
psql -h YOUR_HOST -U postgres -d YOUR_DATABASE -f 05-seed-data.sql
```

## After Migration

1. **Enable Row Level Security**: RLS is enabled in the migration scripts, but verify it's active.

2. **Configure Auth Settings**:
   - Enable email confirmations (or disable for testing)
   - Set Site URL and Redirect URLs

3. **Create Admin User**:
   After creating a user account, run this SQL to make them an admin:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_UUID', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

4. **Update WiFi Password**:
   ```sql
   UPDATE public.wifi_settings
   SET password = 'YOUR_SECURE_PASSWORD'
   WHERE ssid = 'StudySpace-WiFi';
   ```

## Schema Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │     │ user_roles  │     │ memberships │
│  (user info)│     │   (RBAC)    │     │  (plans)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────┴──────┐
                    │  auth.users │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    zones    │────▶│    seats    │◀────│ seat_blocks │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   bookings  │────▶┌─────────────┐
                    └──────┬──────┘     │   shifts    │
                           │            └─────────────┘
                    ┌──────┴──────┐
                    │  attendance │
                    └─────────────┘

┌─────────────────┐
│  wifi_settings  │  (accessible by active members only)
└─────────────────┘
```

## RLS Policy Summary

| Table | Policy |
|-------|--------|
| profiles | Users can view/edit own; Admins can view all |
| user_roles | Users can view own; Admins can manage all |
| memberships | Users can view own; Admins can manage all |
| zones | Everyone can view active; Admins can manage |
| seats | Everyone can view active; Admins can manage |
| shifts | Everyone can view active; Admins can manage |
| bookings | Users can CRUD own (with active membership); Admins can manage all |
| attendance | Users can view own; Admins can manage all |
| seat_blocks | Everyone can view; Admins can manage |
| wifi_settings | Active members can view; Admins can manage |

## Troubleshooting

### "permission denied for table"
- Check RLS policies are correctly applied
- Ensure user has required role/membership

### "infinite recursion in policy"
- This is handled by using SECURITY DEFINER functions
- `has_role()` and `has_active_membership()` use security definer

### User can't create bookings
- Verify user has active membership (`has_active_membership()`)
- Check membership hasn't expired

## Contact

For issues with this migration, refer to the original project documentation.
