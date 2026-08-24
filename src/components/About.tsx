import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center space-y-8 relative z-10"
      >
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground uppercase">
          Entregamos muito mais que serviços.{" "}
          <span className="text-primary">Construímos autoridade e escala.</span>
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Na Target, não trabalhamos com achismos. Cada estratégia é baseada em dados, 
          análise de mercado e testes constantes. Nosso objetivo? Fazer sua marca dominar 
          o digital e transformar visitantes em clientes fiéis.
        </p>

        <Button 
          size="lg" 
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300"
        >
          Falar com um especialista
        </Button>
      </motion.div>
    </section>
  );
};

export default About;
