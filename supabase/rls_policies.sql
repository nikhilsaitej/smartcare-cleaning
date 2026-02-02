-- SmartCare Cleaning Solutions - Supabase RLS Policies
-- Run this in Supabase SQL Editor to lock down all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS TABLE - Public read, Admin write
-- ============================================

DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all" ON products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" ON products
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

-- ============================================
-- SERVICES TABLE - Public read, Admin write
-- ============================================

DROP POLICY IF EXISTS "services_select_all" ON services;
CREATE POLICY "services_select_all" ON services
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "services_insert_admin" ON services;
CREATE POLICY "services_insert_admin" ON services
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "services_update_admin" ON services;
CREATE POLICY "services_update_admin" ON services
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

DROP POLICY IF EXISTS "services_delete_admin" ON services;
CREATE POLICY "services_delete_admin" ON services
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

-- ============================================
-- BOOKINGS TABLE - Users see own, Admin sees all
-- ============================================

DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "bookings_insert_authenticated" ON bookings;
CREATE POLICY "bookings_insert_authenticated" ON bookings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = user_id
  );

DROP POLICY IF EXISTS "bookings_update_own_or_admin" ON bookings;
CREATE POLICY "bookings_update_own_or_admin" ON bookings
  FOR UPDATE
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  )
  WITH CHECK (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "bookings_delete_admin" ON bookings;
CREATE POLICY "bookings_delete_admin" ON bookings
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

-- ============================================
-- CONTACTS TABLE - Anyone can insert, Admin reads
-- ============================================

DROP POLICY IF EXISTS "contacts_insert_anyone" ON contacts;
CREATE POLICY "contacts_insert_anyone" ON contacts
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "contacts_select_admin" ON contacts;
CREATE POLICY "contacts_select_admin" ON contacts
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

DROP POLICY IF EXISTS "contacts_update_admin" ON contacts;
CREATE POLICY "contacts_update_admin" ON contacts
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

DROP POLICY IF EXISTS "contacts_delete_admin" ON contacts;
CREATE POLICY "contacts_delete_admin" ON contacts
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

-- ============================================
-- ORDERS TABLE - Users see own, Admin sees all
-- ============================================

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
CREATE POLICY "orders_insert_authenticated" ON orders
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = user_id
  );

DROP POLICY IF EXISTS "orders_update_own_or_admin" ON orders;
CREATE POLICY "orders_update_own_or_admin" ON orders
  FOR UPDATE
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  )
  WITH CHECK (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_delete_admin" ON orders
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com');

-- ============================================
-- SERVICE ACCOUNT BYPASS FOR SERVER-SIDE OPS
-- The service_role key bypasses RLS for backend operations
-- This is handled automatically by Supabase when using service_role key
-- ============================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'services', 'bookings', 'contacts', 'orders');
