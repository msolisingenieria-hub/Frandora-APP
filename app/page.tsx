import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Industries from "@/components/landing/Industries";
import Pricing from "@/components/landing/Pricing";
import CTAFinal from "@/components/landing/CTAFinal";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Industries />
      <Pricing />
      <CTAFinal />
      <Footer />
    </div>
  );
}
