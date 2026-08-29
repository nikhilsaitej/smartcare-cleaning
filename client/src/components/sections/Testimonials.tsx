import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Verified } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    title: "Homeowner",
    location: "Benz Circle, Vijayawada",
    text: "SmartCare did an excellent job with our home deep cleaning. The team was professional, punctual, and very thorough. Highly recommended!",
    rating: 5,
    verified: true,
    image: "👩‍🦰"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    title: "Business Owner",
    location: "Gollapudi, Vijayawada",
    text: "I order all my housekeeping supplies from them. Same-day delivery and great prices. The phenyl quality is much better than store brands.",
    rating: 5,
    verified: true,
    image: "👨‍💼"
  },
  {
    id: 3,
    name: "Lakshmi Narayana",
    title: "Office Manager",
    location: "Patamata, Vijayawada",
    text: "Booked them for sofa cleaning. They removed stubborn stains that I thought were permanent. Very satisfied with the service.",
    rating: 4,
    verified: true,
    image: "👩‍💼"
  },
  {
    id: 4,
    name: "Vikram Singh",
    title: "Apartment Complex Manager",
    location: "Krishna Lanka, Vijayawada",
    text: "Professional service for entire complex maintenance. Regular cleaning schedules are perfectly executed. Best cleaning partner we could ask for!",
    rating: 5,
    verified: true,
    image: "👨‍💼"
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Real Stories</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg">
            Thousands of satisfied customers trust SmartCare for their cleaning needs. Read real reviews from verified users.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden bg-white">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-blue-500"></div>

                <CardContent className="pt-8 pb-6 px-6 flex flex-col h-full">
                  {/* Top Section - Quote Icon and Rating */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <Quote className="h-5 w-5 text-white fill-white" />
                      </div>
                      {testimonial.verified && (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                          <Verified className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-bold text-green-700">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic flex-grow">
                    "{testimonial.text}"
                  </p>

                  {/* Author Info */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{testimonial.image}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">{testimonial.title}</span>
                          <span>•</span>
                          <span>{testimonial.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-200 p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "5000+", label: "Happy Customers" },
              { number: "4.9★", label: "Average Rating" },
              { number: "2000+", label: "Services Completed" },
              { number: "99%", label: "Satisfaction Rate" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-sm md:text-base text-gray-600 font-medium mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Join thousands of satisfied customers</p>
          <a href="/services" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transition-all duration-300">
            Browse Our Services
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
