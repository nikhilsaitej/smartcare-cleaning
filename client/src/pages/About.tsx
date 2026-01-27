import { motion } from "framer-motion";
import { CheckCircle, Award, Users, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import cleanerMan from "@/assets/cleaner-man.png";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1581578731117-104f2a417954?auto=format&fit=crop&q=80&w=1200" 
                  alt="Our Team" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                  <p className="text-4xl font-bold mb-1">10+</p>
                  <p className="text-sm font-medium uppercase tracking-wider">Years Experience</p>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">Our Story</span>
                <h1 className="text-4xl font-display font-bold text-primary">Committed to a Cleaner Vijayawada</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  SmartCare Cleaning Solutions started with a simple mission: to provide world-class cleaning services to the residents of Vijayawada. Over the years, we have grown into the city's most trusted name in professional hygiene.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">Trusted Team</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">Eco-Friendly</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">Best Equipment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <Award className="h-10 w-10 mx-auto text-orange-400" />
                <h3 className="text-3xl font-bold">5000+</h3>
                <p className="text-blue-100 text-sm uppercase">Jobs Done</p>
              </div>
              <div className="space-y-2">
                <Users className="h-10 w-10 mx-auto text-orange-400" />
                <h3 className="text-3xl font-bold">2500+</h3>
                <p className="text-blue-100 text-sm uppercase">Happy Clients</p>
              </div>
              <div className="space-y-2">
                <Shield className="h-10 w-10 mx-auto text-orange-400" />
                <h3 className="text-3xl font-bold">100%</h3>
                <p className="text-blue-100 text-sm uppercase">Reliability</p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-10 w-10 mx-auto text-orange-400" />
                <h3 className="text-3xl font-bold">50+</h3>
                <p className="text-blue-100 text-sm uppercase">Cleaning Experts</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
