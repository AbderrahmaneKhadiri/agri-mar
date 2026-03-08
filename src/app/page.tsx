import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import FeaturesSectionDemo from "@/components/features-section-demo-3";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SocialProof />
      <FeaturesSectionDemo />
      <FeaturesGrid />
      <Testimonials />
      <CtaSection />
      <Footer />
    </main>
  );
}
