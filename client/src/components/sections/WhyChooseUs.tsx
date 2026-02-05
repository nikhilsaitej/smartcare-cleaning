import { FEATURES } from "@/lib/constants";

export default function WhyChooseUs() {
  return (
    <section className="py-8 md:py-16 bg-primary text-white relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-2 md:mb-4">Why Choose SmartCare?</h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
            We are dedicated to providing the highest quality service with a focus on reliability and customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-6 border border-white/10 hover:bg-white/20 transition-colors">
                <div className="h-8 w-8 md:h-12 md:w-12 bg-orange-500 rounded-md md:rounded-lg flex items-center justify-center mb-2 md:mb-4 shadow-lg shadow-orange-500/20">
                  <Icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-xs md:text-lg font-bold mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-[10px] md:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
