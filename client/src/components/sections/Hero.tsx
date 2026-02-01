import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Building2, Sparkles, Package, Boxes, Star, Users, Clock, Wrench } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@/assets/hero-bg.png";

const serviceCategories = [
  { icon: Package, label: "Housekeeping Supplies", href: "/products", color: "from-blue-500 to-blue-600" },
  { icon: Boxes, label: "Bulk Orders & Wholesale", href: "/contact", color: "from-orange-500 to-orange-600" },
  { icon: Home, label: "Home Cleaning", href: "/services", color: "from-green-500 to-green-600" },
  { icon: Building2, label: "Office & Commercial", href: "/services", color: "from-purple-500 to-purple-600" },
  { icon: Sparkles, label: "Deep Cleaning", href: "/services", color: "from-cyan-500 to-cyan-600" },
  { icon: null, label: "Maintenance & AMC", href: "/contact", color: "from-blue-500 to-blue-600", isAMC: true },
];

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-sky-50">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 z-10" />
        <img 
          src={heroBg} 
          alt="Clean Living Room" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-4">
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
            
            <p className="text-lg text-gray-600 max-w-xl mb-6 leading-relaxed">
              Experience the joy of a spotless home. We provide top-rated deep cleaning services and high-quality housekeeping supplies.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 font-medium mb-6">
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Eco-Friendly Products</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Satisfaction</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/services">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 h-12 shadow-lg shadow-orange-500/20 rounded-full">
                  Book a Service
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-blue-50 font-bold px-8 h-12 rounded-full bg-white/50">
                  View Products
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right - Service Categories Card */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-10"
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-5">
                  What are you looking for?
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {serviceCategories.map((service, index) => (
                    <Link key={index} href={service.href}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border hover:shadow-md group ${service.isAMC ? 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className={`h-11 w-11 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                          {service.isAMC ? (
                            <div className="flex items-center gap-0.5">
                              <Clock className="h-4 w-4 text-white" />
                              <Wrench className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            service.icon && <service.icon className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
                          {service.label}
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* Stats Section */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-800">4.9</p>
                      <p className="text-xs text-slate-500">Service Rating</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-800">5000+</p>
                      <p className="text-xs text-slate-500">Happy Customers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
