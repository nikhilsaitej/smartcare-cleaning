import { motion } from "framer-motion";
import { Award, Truck, Clock, Shield, CheckCircle2 } from "lucide-react";

const guarantees = [
  {
    icon: Award,
    title: "ISO Certified",
    description: "Quality assured processes",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Same-day service available",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "100% punctuality promise",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Shield,
    title: "Verified Experts",
    description: "Background checked staff",
    color: "from-purple-500 to-purple-600"
  }
];

export default function Guarantees() {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Industrial Grade Guarantees
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Professional standards, premium quality, transparent pricing
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group-hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${guarantee.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2">{guarantee.title}</h3>
                  <p className="text-blue-100 text-sm flex-grow">{guarantee.description}</p>

                  {/* Check mark */}
                  <div className="flex items-center gap-2 mt-4 text-blue-300 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified & Certified
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 pt-8 border-t border-white/10"
        >
          <p className="text-blue-100 mb-4">
            Trusted by 5000+ customers across Vijayawada
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              "Industry Standard Certified",
              "Professional Team",
              "24/7 Support",
              "Money Back Guarantee"
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="font-semibold">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
