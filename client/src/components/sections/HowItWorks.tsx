import { motion } from "framer-motion";
import { CheckCircle, Calendar, Sparkles, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Book Your Service",
    description: "Choose your service, date, and time with just a few clicks. We're available 24/7 for bookings.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: CheckCircle,
    title: "Confirmation & Support",
    description: "Get instant confirmation with a professional team assigned to your service request.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Sparkles,
    title: "Expert Cleaning",
    description: "Our verified professionals deliver spotless results using eco-friendly products and techniques.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: ThumbsUp,
    title: "Quality Assurance",
    description: "Rate your experience, provide feedback, and enjoy our 100% satisfaction guarantee.",
    color: "from-orange-500 to-orange-600"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2 mb-4">
              How SmartCare Works
            </h2>
            <p className="text-gray-600 text-lg">
              Get professional cleaning in 4 simple steps. Transparent pricing, no hidden charges.
            </p>
          </motion.div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step number badge */}
                <div className={`absolute -top-4 -left-2 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
                  {index + 1}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-orange-400 to-transparent"></div>
                )}

                <div className="bg-slate-50 rounded-xl p-6 h-full border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline for mobile */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <div className="w-1 h-12 bg-gradient-to-b from-orange-400 to-transparent mt-2"></div>}
                </div>
                <div className="py-2">
                  <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
