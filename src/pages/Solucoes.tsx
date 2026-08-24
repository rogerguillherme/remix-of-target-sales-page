import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveGrid from "@/components/InteractiveGrid";
import Solutions from "@/components/Solutions";
import Services from "@/components/Services";
import ContactDialog from "@/components/ContactDialog";
import { useState } from "react";

const Solucoes = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0">
        <InteractiveGrid />
      </div>
      
      <div className="relative z-10">
        <Header onOpenContact={() => setContactOpen(true)} />
        <div className="pt-20">
          <Solutions />
          <Services />
        </div>
        <Footer />
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Solucoes;
