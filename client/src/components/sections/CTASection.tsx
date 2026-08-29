import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 z-0"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>

            {/* Main heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-tight">
              Get Your Sparkling <br />
              <span className="text-yellow-300">Clean Home Today</span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join 5000+ satisfied customers. Book your first service now and get <span className="font-bold text-yellow-300">15% off</span> with code <span className="font-mono bg-white/10 px-2 py-1 rounded">WELCOME15</span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">4.9★</p>
                <p className="text-sm text-blue-100">Rating</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">2000+</p>
                <p className="text-sm text-blue-100">Services</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">24/7</p>
                <p className="text-sm text-blue-100">Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 h-12 shadow-2xl shadow-yellow-400/30 rounded-full group"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 font-bold px-8 h-12 rounded-full"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Support text */}
            <p className="text-blue-100 text-sm mt-8">
              💬 Chat with us for custom quotes • Free consultation • No commitment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
