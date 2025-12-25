-- StudySpace Database: Row Level Security Policies
-- Run after 03-functions.sql

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- USER_ROLES TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- MEMBERSHIPS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view their own membership"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships"
  ON public.memberships FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ZONES TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view active zones"
  ON public.zones FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage zones"
  ON public.zones FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SEATS TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view active seats"
  ON public.seats FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage seats"
  ON public.seats FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SHIFTS TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view active shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage shifts"
  ON public.shifts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_membership(auth.uid()));

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ATTENDANCE TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view their own attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = attendance.booking_id 
    AND bookings.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SEAT_BLOCKS TABLE POLICIES
-- ============================================
CREATE POLICY "Anyone can view seat blocks"
  ON public.seat_blocks FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage seat blocks"
  ON public.seat_blocks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- WIFI_SETTINGS TABLE POLICIES
-- ============================================
CREATE POLICY "Active members can view wifi"
  ON public.wifi_settings FOR SELECT
  TO authenticated
  USING (public.has_active_membership(auth.uid()));

CREATE POLICY "Admins can manage wifi settings"
  ON public.wifi_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
