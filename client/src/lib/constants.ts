import { Truck, Clock, ShieldCheck, Award, Sparkles, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import cleanerMan from "@/assets/cleaner-man.png";
import supplies from "@/assets/supplies.png";

export const COMPANY_INFO = {
  name: "SmartCare Cleaning Solutions",
  phone: "+91 95601 95601",
  email: "info@smartcarecleaning.in",
  location: "Vijayawada, India",
  tagline: "Clean With Purpose.",
};

export const SERVICES = [
  {
    id: "home-cleaning",
    title: "Home Cleaning",
    description: "Complete home deep cleaning services including floor, kitchen, and bathroom sanitation.",
    price: "From ₹2,999",
    rating: 4.8,
    reviews: 120,
    image: "https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=800",
    features: ["Deep Dusting", "Floor Scrubbing", "Bathroom Sanitization", "Kitchen Deep Clean"],
  },
  {
    id: "office-cleaning",
    title: "Office Cleaning",
    description: "Professional cleaning for corporate spaces to ensure a healthy work environment.",
    price: "From ₹4,999",
    rating: 4.9,
    reviews: 85,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    features: ["Workstation Cleaning", "Carpet Vacuuming", "Glass Cleaning", "Pantry Sanitization"],
  },
  {
    id: "sofa-cleaning",
    title: "Sofa & Carpet Cleaning",
    description: "Revitalize your upholstery with our specialized fabric cleaning techniques.",
    price: "From ₹999",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    features: ["Stain Removal", "Dust Mite Removal", "Fabric Protection", "Odor Neutralization"],
  },
  {
    id: "bathroom-cleaning",
    title: "Bathroom Deep Clean",
    description: "Intensive descaling and sanitization for sparkling clean and germ-free bathrooms.",
    price: "From ₹899",
    rating: 4.8,
    reviews: 150,
    image: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    features: ["Tile Descaling", "Toilet Sanitization", "Fixture Polishing", "Grout Cleaning"],
  },
];

export const PRODUCTS = [
  { id: "p1", title: "SmartCare Phenyl (5L)", category: "Phenyl", price: 350, originalPrice: 450, rating: 4.5, image: supplies, tag: "Bestseller" },
  { id: "p2", title: "Lizol Disinfectant Surface Cleaner", category: "Disinfectants", price: 250, originalPrice: 300, rating: 4.7, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400", tag: "Top Seller" },
  { id: "p3", title: "SmartCare Floor Cleaner (5L)", category: "Floor Cleaners", price: 350, originalPrice: 400, rating: 4.8, image: supplies, tag: "Bestseller" },
  { id: "p4", title: "Latex Cleaning Gloves", category: "Cleaning Tools", price: 150, originalPrice: 200, rating: 4.9, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400", tag: "Bestseller" },
  { id: "p5", title: "Glass Cleaner Spray", category: "Cleaning Tools", price: 120, originalPrice: 160, rating: 4.6, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p6", title: "Microfiber Duster", category: "Cleaning Tools", price: 199, originalPrice: 250, rating: 4.7, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p7", title: "Toilet Bowl Cleaner", category: "Disinfectants", price: 180, originalPrice: 220, rating: 4.5, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p8", title: "Dishwashing Liquid", category: "Other", price: 99, originalPrice: 125, rating: 4.4, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p9", title: "Kitchen Degreaser", category: "Other", price: 210, originalPrice: 280, rating: 4.8, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p10", title: "Multi-Purpose Cleaner", category: "Other", price: 145, originalPrice: 190, rating: 4.6, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p11", title: "Soft Broom with Handle", category: "Cleaning Tools", price: 250, originalPrice: 350, rating: 4.5, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p12", title: "Floor Mop with Bucket", category: "Cleaning Tools", price: 899, originalPrice: 1200, rating: 4.9, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400", tag: "Popular" },
  { id: "p13", title: "Hand Sanitizer (500ml)", category: "Disinfectants", price: 150, originalPrice: 250, rating: 4.8, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p14", title: "Liquid Hand Wash", category: "Other", price: 85, originalPrice: 110, rating: 4.5, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p15", title: "Air Freshener Spray", category: "Other", price: 120, originalPrice: 180, rating: 4.7, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p16", title: "Garbage Bags (Pack of 30)", category: "Other", price: 130, originalPrice: 175, rating: 4.6, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p17", title: "Scrub Pad (Pack of 3)", category: "Cleaning Tools", price: 45, originalPrice: 60, rating: 4.4, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p18", title: "Napthalene Balls", category: "Other", price: 30, originalPrice: 45, rating: 4.3, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p19", title: "Bleaching Powder (1kg)", category: "Disinfectants", price: 75, originalPrice: 95, rating: 4.5, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p20", title: "Washing Powder (1kg)", category: "Other", price: 140, originalPrice: 180, rating: 4.6, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p21", title: "Liquid Detergent (1L)", category: "Other", price: 220, originalPrice: 300, rating: 4.7, image: "https://images.unsplash.com/photo-1584622781564-1d9876a3e5b0?auto=format&fit=crop&q=80&w=400" },
  { id: "p22", title: "Window Squeegee", category: "Cleaning Tools", price: 110, originalPrice: 150, rating: 4.5, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p23", title: "Dust Pan with Brush", category: "Cleaning Tools", price: 140, originalPrice: 190, rating: 4.6, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p24", title: "Steel Scrubber", category: "Cleaning Tools", price: 25, originalPrice: 35, rating: 4.4, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p25", title: "Sponge Wipe (Pack of 3)", category: "Cleaning Tools", price: 95, originalPrice: 130, rating: 4.7, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
  { id: "p26", title: "Floor Squeegee", category: "Cleaning Tools", price: 180, originalPrice: 240, rating: 4.6, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400" },
  { id: "p27", title: "Cleaning Brush with Handle", category: "Cleaning Tools", price: 65, originalPrice: 85, rating: 4.5, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400" },
];

export const FEATURES = [
  {
    icon: Truck,
    title: "Same-Day Delivery",
    description: "Serving Vijayawada with express service options.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Verified",
    description: "Background checked professional staff.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "100% satisfaction or free re-service.",
  },
  {
    icon: Clock,
    title: "On-Time Service",
    description: "Punctual professionals who value your time.",
  },
];
