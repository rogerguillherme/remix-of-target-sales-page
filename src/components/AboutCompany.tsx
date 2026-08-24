import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Lightbulb, Award, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Foco em Resultados",
    description: "Cada estratégia é orientada por dados e métricas reais. Não vendemos sonhos, entregamos crescimento mensurável.",
  },
  {
    icon: Lightbulb,
    title: "Inovação Constante",
    description: "O digital muda todos os dias. Estamos sempre um passo à frente, testando novas plataformas e estratégias.",
  },
  {
    icon: Award,
    title: "Excelência e Transparência",
    description: "Relatórios completos, reuniões periódicas e total transparência sobre investimentos e retornos.",
  },
  {
    icon: TrendingUp,
    title: "Crescimento Sustentável",
    description: "Não buscamos vitórias rápidas. Construímos bases sólidas para escalar seu negócio de forma previsível.",
  },
];

const AboutCompany = () => {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Nossa História */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground">
              A Target nasceu de uma <span className="text-primary">insatisfação</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Cansados de ver agências que prometiam muito e entregavam pouco, decidimos criar algo diferente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Card className="p-8 bg-card/60 backdrop-blur border-border">
                <h3 className="text-2xl font-bold text-primary mb-4">2019 - O Começo</h3>
                <p className="text-foreground leading-relaxed">
                  Começamos em uma sala pequena, com dois computadores e um grande objetivo: 
                  provar que marketing digital baseado em dados e estratégia supera qualquer "feeling" de mercado.
                </p>
              </Card>

              <Card className="p-8 bg-card/60 backdrop-blur border-border">
                <h3 className="text-2xl font-bold text-primary mb-4">2021 - Expansão</h3>
                <p className="text-foreground leading-relaxed">
                  Mais de 150 projetos entregues, equipe de 12 especialistas e parcerias com as principais 
                  plataformas de marketing digital do mercado. Nosso ROI médio ultrapassou 8:1.
                </p>
              </Card>

              <Card className="p-8 bg-card/60 backdrop-blur border-border">
                <h3 className="text-2xl font-bold text-primary mb-4">2024 - Hoje</h3>
                <p className="text-foreground leading-relaxed">
                  Mais de 500 projetos, presença em 3 estados, time multidisciplinar de 25+ profissionais 
                  e reconhecimento como uma das agências que mais cresce no Brasil.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border border-border">
                <div className="text-center p-8">
                  <div className="text-7xl font-black text-primary mb-4">500+</div>
                  <p className="text-2xl font-bold text-foreground">Projetos Entregues</p>
                  <p className="text-muted-foreground mt-2">Com resultados mensuráveis e crescimento real</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Missão e Valores */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Nossa <span className="text-primary">Missão</span> e Valores
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transformar negócios através de estratégias digitais inteligentes, criativas e baseadas em dados reais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-card/60 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCompany;
