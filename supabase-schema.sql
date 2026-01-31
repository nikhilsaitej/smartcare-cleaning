-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  rating DECIMAL(2,1) DEFAULT 4.5,
  image TEXT,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  image TEXT,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  date DATE,
  time_slot TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Policies for services (public read)
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);

-- Policies for bookings (users can manage their own, guests can create with null user_id)
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Policies for contacts (anyone can submit)
CREATE POLICY "Anyone can submit contact form" ON contacts FOR INSERT WITH CHECK (true);

-- Policies for cart items (users manage their own)
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Insert sample products (same as your current mock data)
INSERT INTO products (title, category, price, original_price, rating, image, tag) VALUES
('SmartCare Phenyl (5L)', 'Phenyl', 350, 450, 4.5, 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400', 'Bestseller'),
('Lizol Disinfectant Surface Cleaner', 'Disinfectants', 250, 300, 4.7, 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400', 'Top Seller'),
('SmartCare Floor Cleaner (5L)', 'Floor Cleaners', 350, 400, 4.8, 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400', 'Bestseller'),
('Latex Cleaning Gloves', 'Cleaning Tools', 150, 200, 4.9, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', 'Bestseller'),
('Glass Cleaner Spray', 'Cleaning Tools', 120, 160, 4.6, 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400', NULL),
('Microfiber Duster', 'Cleaning Tools', 199, 250, 4.7, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400', NULL),
('Toilet Bowl Cleaner', 'Disinfectants', 180, 220, 4.5, 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400', NULL),
('Floor Mop with Bucket', 'Cleaning Tools', 899, 1200, 4.9, 'https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400', 'Popular');

-- Insert sample services
INSERT INTO services (title, description, price, rating, reviews, image, features) VALUES
('Home Cleaning', 'Complete home deep cleaning services including floor, kitchen, and bathroom sanitation.', 'From ₹2,999', 4.8, 120, 'https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=800', ARRAY['Deep Dusting', 'Floor Scrubbing', 'Bathroom Sanitization', 'Kitchen Deep Clean']),
('Office Cleaning', 'Professional cleaning for corporate spaces to ensure a healthy work environment.', 'From ₹4,999', 4.9, 85, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', ARRAY['Workstation Cleaning', 'Carpet Vacuuming', 'Glass Cleaning', 'Pantry Sanitization']),
('Sofa & Carpet Cleaning', 'Revitalize your upholstery with our specialized fabric cleaning techniques.', 'From ₹999', 4.7, 210, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', ARRAY['Stain Removal', 'Dust Mite Removal', 'Fabric Protection', 'Odor Neutralization']),
('Bathroom Deep Clean', 'Intensive descaling and sanitization for sparkling clean and germ-free bathrooms.', 'From ₹899', 4.8, 150, 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', ARRAY['Tile Descaling', 'Toilet Sanitization', 'Fixture Polishing', 'Grout Cleaning']);
