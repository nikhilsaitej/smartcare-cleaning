import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Clock, CheckCircle, Smartphone, Truck, ShieldCheck, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import cleanerMan from "@/assets/cleaner-man.png";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-white">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <img 
          src={heroBg} 
          alt="Clean Living Room" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm">
              <Zap className="h-4 w-4 fill-blue-600" />
              Vijayawada's Most Trusted Cleaning Partner
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold font-display text-primary leading-[1.05] mb-8 tracking-tight">
              Housekeeping Supplies <br />
              <span className="text-orange-500">& Professional</span> <br />
              Cleaning Services
            </h1>
            
            <p className="text-xl text-slate-600 max-w-xl mb-10 leading-relaxed font-medium">
              Trusted by <span className="text-primary font-bold">100+ local customers</span> for homes, offices & apartments across Vijayawada.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Truck, text: "Same-Day Delivery" },
                { icon: ShieldCheck, text: "Affordable & Reliable" },
                { icon: Zap, text: "Small Orders & Bulk" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white/50 shadow-sm">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
               <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 h-16 text-xl shadow-2xl shadow-orange-500/30 rounded-full transition-transform hover:scale-105 active:scale-95">
                Get Quote
              </Button>
               <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-blue-50 font-black px-10 h-16 text-xl rounded-full transition-transform hover:scale-105 active:scale-95">
                Book Cleaning
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Booking Card */}
        <div className="lg:col-span-5 relative">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute -top-12 -left-12 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-blue-50 transform hover:scale-110 transition-transform"
          >
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400">Verified Service</span>
              <span className="text-sm font-bold text-primary">Trusted by 100+</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-10"
          >
            <Card className="glass-card shadow-2xl border-white/80 overflow-hidden backdrop-blur-xl">
              <div className="bg-primary p-6 border-b border-white/20">
                <h3 className="font-bold text-xl text-white flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-orange-400" />
                  Quick Booking
                </h3>
                <p className="text-blue-100 text-xs mt-1">Confirmed on WhatsApp in 15 mins</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <Input placeholder="Your Name" className="h-12 bg-white/50 border-slate-100 focus:bg-white transition-all" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-4 border border-r-0 rounded-l-xl bg-slate-50 text-slate-500 font-bold border-slate-100">
                      +91
                    </span>
                    <Input placeholder="98765 43210" className="h-12 rounded-l-none bg-white/50 border-slate-100 focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <Input type="date" className="h-12 bg-white/50 border-slate-100" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type</label>
                    <Select>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-100">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Deep Clean</SelectItem>
                        <SelectItem value="office">Office Clean</SelectItem>
                        <SelectItem value="supplies">Only Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 text-xl shadow-xl transition-all hover:translate-y-[-2px] active:translate-y-0 rounded-xl">
                  Book Now
                </Button>
                
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Confirmation sent via WhatsApp</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
