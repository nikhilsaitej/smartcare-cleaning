-- Create the return_requests table for SmartCare Cleaning Solutions
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard

-- ============================================
-- RETURN REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS return_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  request_type varchar(20) NOT NULL CHECK (request_type IN ('return', 'exchange')),
  status varchar(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled')),
  items jsonb NOT NULL DEFAULT '[]',
  reason text NOT NULL,
  customer_name varchar(255),
  customer_email varchar(255),
  customer_phone varchar(20),
  pickup_address jsonb,
  admin_notes text,
  refund_amount decimal(10,2),
  refund_status varchar(30) CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON return_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for return_requests table

-- Users can see their own return requests
DROP POLICY IF EXISTS "return_requests_select_own" ON return_requests;
CREATE POLICY "return_requests_select_own" ON return_requests
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

-- Users can insert their own return requests
DROP POLICY IF EXISTS "return_requests_insert_own" ON return_requests;
CREATE POLICY "return_requests_insert_own" ON return_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Only admin can update return requests
DROP POLICY IF EXISTS "return_requests_update_admin" ON return_requests;
CREATE POLICY "return_requests_update_admin" ON return_requests
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'smartcarecleaningsolutions@gmail.com'
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS return_requests_updated_at ON return_requests;
CREATE TRIGGER return_requests_updated_at
  BEFORE UPDATE ON return_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_return_requests_updated_at();

COMMENT ON TABLE return_requests IS 'Return and exchange requests from customers for delivered product orders';
