import { motion } from "framer-motion";
import { Target, TrendingUp, Users, Award } from "lucide-react";

const WhoWeAre = () => {
  const stats = [
    { icon: Target, value: "500+", label: "Projetos Entregues" },
    { icon: TrendingUp, value: "300%", label: "Crescimento Médio" },
    { icon: Users, value: "200+", label: "Clientes Ativos" },
    { icon: Award, value: "5 anos", label: "de Experiência" },
  ];

  return (
    <section id="quem-somos" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 uppercase">
            Quem <span className="text-primary">Somos</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Somos especialistas em transformar negócios através do marketing digital. 
            Nossa missão é entregar resultados reais e mensuráveis, construindo autoridade 
            e escalando o crescimento de cada cliente.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-secondary p-6 rounded-2xl border border-border text-center hover:border-primary/50 transition-all duration-300"
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="font-display text-3xl md:text-4xl font-black text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-secondary p-8 md:p-12 rounded-2xl border border-border"
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Nossa Abordagem
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-primary">1</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2">Estratégia Data-Driven</h4>
              <p className="text-muted-foreground">
                Decisões baseadas em dados reais, não achismos. Analisamos métricas e 
                comportamentos para criar estratégias certeiras.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-primary">2</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2">Execução Impecável</h4>
              <p className="text-muted-foreground">
                Do planejamento à entrega, cada detalhe é pensado para maximizar 
                resultados e superar expectativas.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-black text-primary">3</span>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2">Crescimento Sustentável</h4>
              <p className="text-muted-foreground">
                Construímos autoridade de marca e processos escaláveis que geram 
                crescimento consistente a longo prazo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre;
