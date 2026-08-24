import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import AnimatedWords from "./AnimatedWords";

interface HeroSectionProps {
  onOpenContact: () => void;
}

const HeroSection = ({ onOpenContact }: HeroSectionProps) => {
  const expertTags = [
    "Tráfego Pago",
    "Social Media",
    "Branding",
    "SEO",
    "Copywriting",
    "E-commerce",
    "Inbound Marketing",
    "Performance"
  ];

  return (
    <section className="min-h-screen pt-24 pb-16 px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight mb-4">
            Muito além<br />
            da comunicação:<br />
            <AnimatedWords />
          </h1>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Card - +500 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border p-8 rounded-2xl">
              <div className="space-y-4">
                <div className="text-primary text-6xl font-black">+ 500</div>
                <h3 className="text-foreground text-xl font-bold">
                  Projetos que transformaram negócios.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Já impactamos centenas de marcas com estratégias que geram resultados reais. 
                  Sua empresa pode ser a próxima história de sucesso.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6 flex flex-col items-center justify-center"
          >
            <p className="text-foreground text-lg leading-relaxed text-center">
              Transformamos sua presença digital em <span className="text-primary font-semibold">máquina de vendas</span>. 
              Combinamos dados, criatividade e estratégia para criar campanhas que não apenas chamam atenção, 
              mas <span className="text-primary font-semibold">convertem e escalam</span> seu negócio.
            </p>
            <Button
              onClick={onOpenContact}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg rounded-xl w-full"
            >
              Fale com um especialista
            </Button>
          </motion.div>

          {/* Right Card - Experts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border p-8 rounded-2xl">
              <div className="space-y-6">
                <h3 className="text-primary text-2xl font-bold">
                  Somos<br />experts em:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {expertTags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="px-4 py-2 bg-secondary border border-border rounded-full text-foreground text-sm font-medium hover:bg-secondary/80 hover:border-primary/50 transition-all cursor-default"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
