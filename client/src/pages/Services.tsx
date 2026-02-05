import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star, Calendar, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { COMPANY_INFO } from "@/lib/constants";
import ServiceCard from "@/components/sections/ServiceCard";
import cleanerMan from "@/assets/cleaner-man.png";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  rating?: number;
  reviews?: number;
  image: string;
  features: string[];
  duration?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        const formattedServices = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          price: s.price?.toString().startsWith("From") ? s.price : `From ₹${s.price}`,
          rating: s.rating || 4.8,
          reviews: s.reviews || 0,
          image: s.image,
          features: s.features || [],
          duration: s.duration
        }));
        setServices(formattedServices);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Page Header */}
        <section className="bg-primary text-white py-16 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Services</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Professional & Affordable Cleaning Solutions in Vijayawada. 
              One-Time & Regular Cleaning Options for Homes, Offices, and Shops.
            </p>
          </div>
        </section>

        {/* Hero-like Service Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  <CheckCircle className="h-4 w-4" />
                  Expert Cleaning Team
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
                  Home Cleaning Services
                </h2>
                <div className="space-y-4">
                   {[
                    "One-Time & Regular Cleaning",
                    "Experienced & Trusted Team",
                    "Affordable Rates",
                    "Fast Booking & Service"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl mt-8">
                   <img 
                    src="https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=1200" 
                    alt="Cleaning Service" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="shadow-2xl border-none">
                  <div className="bg-primary p-6 text-white rounded-t-xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-orange-400" />
                      Book Home Cleaning
                    </h3>
                  </div>
                  <CardContent className="p-8 space-y-4 bg-white">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Name</label>
                      <Input placeholder="Enter your name" className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Mobile Number</label>
                      <Input placeholder="98765 43210" className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Address</label>
                      <Input placeholder="Your area in Vijayawada" className="bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Date</label>
                        <Input type="date" className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Time Slot</label>
                        <Select>
                          <SelectTrigger className="bg-slate-50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (1 PM - 4 PM)</SelectItem>
                            <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-xl font-bold shadow-lg shadow-orange-500/20 mt-4 transition-all hover:scale-[1.02]">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* More Services List */}
        <section className="py-16 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-primary mb-12 text-center">
              Our Full Service Range
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-slate-500">Loading services...</span>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No services available</h3>
                <p className="text-slate-500">Check back soon for our cleaning services.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    id={service.id}
                    title={service.title}
                    description={service.description}
                    price={service.price}
                    rating={service.rating || 4.8}
                    image={service.image}
                    features={service.features}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl font-display font-bold mb-6 italic">Why Choose SmartCare?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-orange-400" />
                <h3 className="font-bold">Trusted Local Business</h3>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-orange-400" />
                <h3 className="font-bold">Quick Delivery</h3>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-orange-400" />
                <h3 className="font-bold">Top Quality Products</h3>
              </div>
            </div>
            <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-md">
               <p className="text-xl font-bold mb-4 flex items-center justify-center gap-3">
                <Phone className="h-6 w-6 text-orange-400" />
                  Call to Book: {COMPANY_INFO.phone}
               </p>
               <p className="text-sm text-blue-200">We deliver & provide service across Vijayawada and nearby areas.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
