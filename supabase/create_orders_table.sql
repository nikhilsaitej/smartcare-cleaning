-- Create the orders table for SmartCare Cleaning Solutions
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_order_id varchar(100) UNIQUE,
  razorpay_payment_id varchar(100),
  user_id uuid REFERENCES auth.users(id),
  amount decimal(10,2) NOT NULL,
  currency varchar(10) DEFAULT 'INR',
  status varchar(50) DEFAULT 'created',
  items jsonb NOT NULL DEFAULT '[]',
  tip decimal(10,2) DEFAULT 0,
  discount decimal(10,2) DEFAULT 0,
  coupon_code varchar(50),
  address jsonb,
  slot jsonb,
  avoid_calling boolean DEFAULT false,
  idempotency_key varchar(100),
  failure_reason text,
  refund_id varchar(100),
  paid_at timestamptz,
  captured_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders table

-- Users can see their own orders
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

-- Users can insert their own orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Only admin can update orders (for payment status updates)
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

-- Service role can bypass RLS (for server-side operations)
-- This is automatically handled by using the service role key

COMMENT ON TABLE orders IS 'Payment and transaction records for product orders and service bookings';
