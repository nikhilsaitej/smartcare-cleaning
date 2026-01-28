import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Phone, Smartphone, MapPin, ShieldCheck, Zap, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Products from "@/components/sections/Products";
import Testimonials from "@/components/sections/Testimonials";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import { COMPANY_INFO } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-foreground">
      <Navbar />
      <main>
        {/* 1. HERO SECTION - Handled by specialized component */}
        <Hero />

        {/* 2. TRUST & SOCIAL PROOF STRIP */}
        <div className="bg-slate-50 border-y border-slate-100 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="flex items-center gap-3 text-primary">
                <Heart className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-sm md:text-base">100+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-3 text-primary">
                <MapPin className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-sm md:text-base">Local Vijayawada Business</span>
              </div>
              <div className="flex items-center gap-3 text-primary">
                <Zap className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-sm md:text-base">Fast Response</span>
              </div>
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-6 w-6 text-orange-500" />
                <span className="font-bold text-sm md:text-base">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SERVICES SECTION - Handled by specialized component */}
        <Services />

        {/* 4. PRODUCTS PREVIEW - Handled by specialized component */}
        <Products />

        {/* 5. WHY CHOOSE SMARTCARE (ADMIN CONFIDENCE) */}
        <WhyChooseUs />

        {/* 6. HOW IT WORKS (REDUCES USER FEAR) */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Simple Process</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Choose Service", desc: "Select the cleaning service or products you need." },
                { step: "02", title: "Book Date & Time", desc: "Pick a slot that works best for your schedule." },
                { step: "03", title: "WhatsApp Confirm", desc: "Get instant confirmation and coordinator details." },
                { step: "04", title: "Service Delivered", desc: "Our professionals arrive and work their magic." }
              ].map((item, idx) => (
                <div key={idx} className="relative p-6 text-center group">
                  <div className="text-6xl font-black text-slate-100 absolute -top-4 left-1/2 -translate-x-1/2 group-hover:text-orange-100 transition-colors z-0">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. ADMIN-FRIENDLY PREVIEW (SUBTLE PLACEHOLDER) */}
        <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
          <div className="container mx-auto px-4">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="max-w-md">
                   <h3 className="font-bold text-primary flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" /> Admin Control Panel
                   </h3>
                   <p className="text-xs text-slate-500 mt-2">Business owners can manage services, pricing, and availability in real-time. Designed for non-technical managers to scale operations efficiently.</p>
                </div>
                <div className="flex gap-4">
                   <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                   <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
             </div>
          </div>
        </section>

        {/* 8. FINAL CTA (CONVERSION PUSH) */}
        <section className="py-24 relative overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready for a cleaner, safer space?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join 100+ satisfied families and businesses in Vijayawada who trust SmartCare for their hygiene needs.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 h-14 px-10 text-xl font-bold shadow-2xl shadow-orange-500/40 rounded-full">
                Book Home Cleaning
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-10 text-xl font-bold rounded-full">
                <MessageSquare className="mr-2 h-6 w-6" /> Get Quote on WhatsApp
              </Button>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
