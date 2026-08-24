import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Services from "@/components/Services";
import About from "@/components/About";
import AboutCompany from "@/components/AboutCompany";
import WhyMarketing from "@/components/WhyMarketing";
import Team from "@/components/Team";
import Cases from "@/components/Cases";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import InteractiveGrid from "@/components/InteractiveGrid";
import ContactDialog from "@/components/ContactDialog";
import SdrChat from "@/components/SdrChat";
import WhoWeAre from "@/components/WhoWeAre";
import Solutions from "@/components/Solutions";
import { useState } from "react";

const Index = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Interactive Grid Background for entire page */}
      <div className="fixed inset-0 z-0">
        <InteractiveGrid />
      </div>
      
      {/* Content with higher z-index */}
      <div className="relative z-10">
        <Header onOpenContact={() => setContactOpen(true)} />
        <HeroSection onOpenContact={() => setContactOpen(true)} />
        <Services />
        <About />
        <WhoWeAre />
        <Solutions />
        <AboutCompany />
        <WhyMarketing />
        <Team />
        <Cases />
        <Testimonials />
        <Footer />
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <SdrChat />
    </div>
  );
};

export default Index;
