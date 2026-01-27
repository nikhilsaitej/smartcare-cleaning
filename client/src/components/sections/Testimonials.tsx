import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Benz Circle, Vijayawada",
    text: "SmartCare did an excellent job with our home deep cleaning. The team was professional, punctual, and very thorough. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Gollapudi, Vijayawada",
    text: "I order all my housekeeping supplies from them. Same-day delivery and great prices. The phenyl quality is much better than store brands.",
    rating: 5,
  },
  {
    id: 3,
    name: "Lakshmi Narayana",
    location: "Patamata, Vijayawada",
    text: "Booked them for sofa cleaning. They removed stubborn stains that I thought were permanent. Very satisfied with the service.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="border-none shadow-lg bg-slate-50 relative overflow-visible mt-6">
              <div className="absolute -top-6 left-8 h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Quote className="h-6 w-6 text-white fill-current" />
              </div>
              <CardContent className="pt-12 pb-8 px-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <h4 className="font-bold text-primary">{testimonial.name}</h4>
                  <span className="text-xs text-gray-500">{testimonial.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
