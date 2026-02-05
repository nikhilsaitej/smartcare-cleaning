-- Create products table for SmartCare Cleaning Solutions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10, 2),
  image_url TEXT,
  category VARCHAR(100) DEFAULT 'Other',
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  in_stock BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  tag VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (admin operations)
CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products
INSERT INTO products (name, description, price, original_price, category, stock, stock_quantity, in_stock, is_bestseller, tag, image_url) VALUES
('SmartCare Phenyl (5L)', 'Premium quality phenyl for floor cleaning and disinfection', 350, 450, 'Phenyl', 100, 100, true, true, 'Bestseller', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400'),
('Lizol Disinfectant Surface Cleaner', 'Powerful disinfectant that kills 99.9% germs', 250, 300, 'Disinfectants', 150, 150, true, true, 'Top Seller', 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400'),
('SmartCare Floor Cleaner (5L)', 'Deep cleaning floor cleaner with fresh fragrance', 350, 400, 'Floor Cleaners', 80, 80, true, true, 'Bestseller', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=400'),
('Latex Cleaning Gloves', 'Durable latex gloves for household cleaning', 150, 200, 'Cleaning Tools', 200, 200, true, true, 'Bestseller', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'),
('Glass Cleaner Spray', 'Streak-free glass and mirror cleaner', 120, 160, 'Cleaning Tools', 120, 120, true, false, 'Popular', 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=400'),
('Multi-Surface Disinfectant', 'All-purpose disinfectant for multiple surfaces', 180, 220, 'Disinfectants', 90, 90, true, false, NULL, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=400'),
('Microfiber Cleaning Cloth Set', 'Pack of 5 premium microfiber cloths', 199, 299, 'Cleaning Tools', 75, 75, true, false, 'Popular', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400'),
('Toilet Bowl Cleaner', 'Heavy-duty toilet cleaner with germ protection', 89, 120, 'Disinfectants', 100, 100, true, false, NULL, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=400');
