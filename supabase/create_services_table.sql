-- Create services table for SmartCare Cleaning Solutions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  duration VARCHAR(50),
  image_url TEXT,
  category VARCHAR(100),
  features TEXT[] DEFAULT '{}',
  rating DECIMAL(2, 1) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can read services
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (admin operations)
CREATE POLICY "Service role can manage services"
  ON services FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services
INSERT INTO services (name, description, price, duration, category, features, rating, reviews, image_url) VALUES
('Home Cleaning', 'Complete home deep cleaning services including floor, kitchen, and bathroom sanitation.', 2999, '3-4 hours', 'Residential', ARRAY['Deep Dusting', 'Floor Scrubbing', 'Bathroom Sanitization', 'Kitchen Deep Clean'], 4.8, 120, 'https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=800'),
('Office Cleaning', 'Professional cleaning for corporate spaces to ensure a healthy work environment.', 4999, '4-6 hours', 'Commercial', ARRAY['Workstation Cleaning', 'Common Area Sanitization', 'Restroom Deep Clean', 'Window Cleaning'], 4.9, 85, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'),
('Sofa & Carpet Cleaning', 'Specialized cleaning for upholstery and carpets using professional equipment.', 1999, '2-3 hours', 'Specialized', ARRAY['Stain Removal', 'Odor Treatment', 'Fabric Protection', 'Deep Vacuuming'], 4.7, 95, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'),
('Bathroom Sanitization', 'Complete bathroom deep cleaning and sanitization with eco-friendly products.', 999, '1-2 hours', 'Specialized', ARRAY['Tile Scrubbing', 'Fixture Polishing', 'Mold Removal', 'Germ Protection'], 4.8, 110, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800');
