import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I book a cleaning service?",
    answer: "Simply visit our Services page, select your preferred service and time slot, and complete the booking. You'll receive instant confirmation via email and SMS with your assigned professional's details."
  },
  {
    question: "Are your cleaning products eco-friendly?",
    answer: "Yes! We exclusively use non-toxic, eco-friendly cleaning products that are safe for children, pets, and the environment. Our green cleaning methods are just as effective as traditional chemicals."
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer: "We offer a 100% satisfaction guarantee. If you're not happy with our service, we'll redo it for free or refund your payment within 24 hours. Your satisfaction is our priority."
  },
  {
    question: "Can I reschedule my booking?",
    answer: "Absolutely! You can reschedule your appointment up to 24 hours before the scheduled service through your account dashboard or by contacting our customer support team."
  },
  {
    question: "Do you offer bulk orders and discounts?",
    answer: "Yes! We provide wholesale pricing for bulk orders and corporate packages. Contact our sales team for customized quotes on large orders of cleaning supplies."
  },
  {
    question: "What areas do you serve?",
    answer: "We primarily serve Vijayawada and surrounding areas. Check our service map on the Services page to confirm availability for your location."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border border-slate-200 rounded-lg overflow-hidden hover:border-orange-200 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 text-sm md:text-base">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-200"
          >
            <p className="px-6 py-4 text-gray-600 text-sm md:text-base leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-lg">
              Find answers to common questions about our services, products, and booking process.
            </p>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* CTA at bottom of FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12 p-6 md:p-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border border-orange-100"
        >
          <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-500/20 transition-all"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
