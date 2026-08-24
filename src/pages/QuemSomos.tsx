import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveGrid from "@/components/InteractiveGrid";
import WhoWeAre from "@/components/WhoWeAre";
import Team from "@/components/Team";
import ContactDialog from "@/components/ContactDialog";
import { useState } from "react";

const QuemSomos = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0">
        <InteractiveGrid />
      </div>
      
      <div className="relative z-10">
        <Header onOpenContact={() => setContactOpen(true)} />
        <div className="pt-20">
          <WhoWeAre />
          <Team />
        </div>
        <Footer />
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default QuemSomos;
