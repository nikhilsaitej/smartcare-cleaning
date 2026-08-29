import { motion } from "framer-motion";
import { Zap, Lock, BarChart3, Users, DollarSign, Target } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Booking",
    description: "Real-time service scheduling with instant confirmation. Book in seconds, not hours.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Encrypted transactions with industry-standard security. PCI-DSS compliant payment gateway.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: BarChart3,
    title: "Transparent Pricing",
    description: "No hidden charges. What you see is what you pay. Full price breakdown included.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Professional Team",
    description: "Highly trained and certified professionals. Background verified for your peace of mind.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: DollarSign,
    title: "Best Value",
    description: "Competitive pricing with premium quality. Loyalty rewards for repeat customers.",
    color: "from-rose-500 to-red-500"
  },
  {
    icon: Target,
    title: "Quality Guarantee",
    description: "100% satisfaction guarantee. Free rework if not satisfied within 24 hours.",
    color: "from-indigo-500 to-blue-500"
  }
];

export default function PremiumFeatures() {
  return (
    <section className="py-20 bg-white relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Why Choose SmartCare for Your Cleaning Needs
            </h2>
            <p className="text-gray-600 text-lg">
              Professional cleaning services backed by industry standards and customer commitment
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="h-full bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 flex-grow leading-relaxed">{feature.description}</p>

                  {/* Divider and CTA */}
                  <div className="pt-4 mt-4 border-t border-gray-200 text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                    Learn more →
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
