import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import FeaturesSectionDemo from "@/components/features-section-demo-3";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

import { CalendlySection } from "@/components/landing/calendly-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <Hero />

      <ScrollReveal delay={0.1}>
        <SocialProof />
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <FeaturesSectionDemo />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <FeaturesGrid />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Testimonials />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <CalendlySection />
      </ScrollReveal>

      <ScrollReveal delay={0.1} animation="scale">
        <CtaSection />
      </ScrollReveal>

      <Footer />
    </main>
  );
}
