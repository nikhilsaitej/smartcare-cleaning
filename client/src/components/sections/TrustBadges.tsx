import { motion } from "framer-motion";
import { Award, Shield, Zap, Leaf, Clock, Users } from "lucide-react";

const badges = [
  {
    icon: Award,
    label: "5-Star Rated",
    description: "4.9/5 from 1000+ reviews"
  },
  {
    icon: Shield,
    label: "Verified Service",
    description: "100% background checked staff"
  },
  {
    icon: Zap,
    label: "Quick Response",
    description: "24-hour booking confirmation"
  },
  {
    icon: Leaf,
    label: "Eco-Friendly",
    description: "Non-toxic, safe products"
  },
  {
    icon: Clock,
    label: "On-Time Guarantee",
    description: "Always punctual service"
  },
  {
    icon: Users,
    label: "5000+ Satisfied",
    description: "Happy customers in Vijayawada"
  }
];

export default function TrustBadges() {
  return (
    <section className="py-12 md:py-16 bg-slate-50 border-t border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col items-center text-center p-3 md:p-4 rounded-lg hover:bg-white transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-xs md:text-sm text-slate-900">{badge.label}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
