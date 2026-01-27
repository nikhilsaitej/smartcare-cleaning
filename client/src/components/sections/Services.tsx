import { SERVICES } from "@/lib/constants";
import ServiceCard from "./ServiceCard";
import { motion } from "framer-motion";

export default function Services() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
