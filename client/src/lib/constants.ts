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
  {
    id: "phenyl-5l",
    title: "SmartCare Phenyl (5L)",
    category: "Disinfectants",
    price: 350,
    originalPrice: 450,
    rating: 4.5,
    image: supplies,
    tag: "Bestseller",
  },
  {
    id: "toilet-cleaner",
    title: "Power Toilet Cleaner",
    category: "Cleaners",
    price: 150,
    originalPrice: 199,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1585421514738-01798e82423d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "microfiber-cloth",
    title: "Microfiber Cloth Set (3pcs)",
    category: "Tools",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1596468138867-27b6892e854d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "glass-cleaner",
    title: "Crystal Clear Glass Cleaner",
    category: "Cleaners",
    price: 120,
    originalPrice: 160,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1628191137573-dee64e727614?auto=format&fit=crop&q=80&w=800",
  },
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
