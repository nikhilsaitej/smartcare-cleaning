import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import TrustBadges from "@/components/sections/TrustBadges";
import PremiumFeatures from "@/components/sections/PremiumFeatures";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import Products from "@/components/sections/Products";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Guarantees from "@/components/sections/Guarantees";
import CTASection from "@/components/sections/CTASection";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <PremiumFeatures />
        <HowItWorks />
        <Services />
        <Products />
        <WhyChooseUs />
        <Guarantees />
        <CTASection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
