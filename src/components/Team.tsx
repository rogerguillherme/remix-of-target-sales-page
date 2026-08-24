import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import rubiaImage from "@/assets/rubia-lorenzo.jpg";
import lorenzoImage from "@/assets/lorenzo.jpg";
const Team = () => {
  return <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }} className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Time multidisciplinar. Resultados exponenciais.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Reunimos os melhores profissionais em estratégia digital, design, copywriting e análise de dados. 
              Cada membro da equipe é especialista em transformar desafios em oportunidades de crescimento. 
              Juntos, criamos campanhas que não apenas alcançam metas, mas as ultrapassam.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Rubia Lorenzo */}
            <motion.div whileHover={{
            scale: 1.05
          }} transition={{
            duration: 0.3
          }} className="relative group">
              <Card className="p-8 bg-secondary border-border hover:border-primary/50 transition-all duration-300">
                <div className="aspect-square rounded-2xl mb-6 overflow-hidden">
                  <img src={rubiaImage} alt="Rubia Lorenzo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-foreground">Rubia</h3>
                  <p className="text-sm text-primary font-semibold uppercase tracking-wider">
                    Co-Founder & Offline Strategist
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Card Lorenzo */}
            <motion.div whileHover={{
            scale: 1.05
          }} transition={{
            duration: 0.3
          }} className="relative group">
              <Card className="p-8 bg-secondary border-border hover:border-primary/50 transition-all duration-300">
                <div className="aspect-square rounded-2xl mb-6 overflow-hidden">
                  <img src={lorenzoImage} alt="Lorenzo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-foreground">Lorenzo</h3>
                  <p className="text-sm text-primary font-semibold uppercase tracking-wider">
                    Co-Founder & Digital Strategist
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default Team;