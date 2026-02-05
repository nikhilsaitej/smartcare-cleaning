import { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  rating?: number;
  reviews?: number;
  image: string;
  features: string[];
}

export default function Services() {
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
          features: s.features || []
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
    <section id="services" className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">What We Do</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2 mb-4">
            Professional Cleaning Services
          </h2>
          <p className="text-gray-600">
            We provide top-notch cleaning services tailored to your specific needs. From homes to offices, we ensure every corner shines.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-slate-500">Loading services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No services available</h3>
            <p className="text-slate-500">Check back soon for our cleaning services.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ServiceCard 
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  rating={service.rating || 4.8}
                  image={service.image}
                  features={service.features}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
