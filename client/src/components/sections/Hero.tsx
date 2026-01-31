import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import cleanerMan from "@/assets/cleaner-man.png";

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-sky-50">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent z-10" />
        <img 
          src={heroBg} 
          alt="Clean Living Room" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              #1 Cleaning Service in Vijayawada
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-primary leading-[1.1] mb-6">
              Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Cleaning Solutions
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
              Experience the joy of a spotless home. We provide top-rated deep cleaning services and high-quality housekeeping supplies.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 font-medium mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Eco-Friendly Chemicals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>100% Satisfaction</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 h-12 shadow-lg shadow-orange-500/20 rounded-full">
                Book a Service
              </Button>
               <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-blue-50 font-bold px-8 h-12 rounded-full">
                View Products
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Booking Card */}
        <div className="lg:col-span-5 relative">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-10"
          >
            <Card className="glass-card shadow-xl border-white/50 overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Home Cleaning
                </h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Your Name</label>
                  <Input placeholder="Enter your name" className="bg-white/50" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm font-medium border-input">
                      +91
                    </span>
                    <Input placeholder="98765 43210" className="rounded-l-none bg-white/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                    <Select>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Select Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="weekend">This Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Service</label>
                    <Select>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Cleaning</SelectItem>
                        <SelectItem value="office">Office Cleaning</SelectItem>
                        <SelectItem value="deep">Deep Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 text-lg shadow-md mt-2">
                  Check Availability
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  Get a callback within 15 minutes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
