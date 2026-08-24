import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Rocket, Users, DollarSign, BarChart, Globe, Zap } from "lucide-react";

const impacts = [
  {
    icon: Rocket,
    title: "Aceleração de Crescimento",
    description: "Empresas que investem em marketing digital crescem 3x mais rápido que a concorrência. O digital permite escalar sem limites geográficos.",
    stat: "3x",
    statLabel: "Mais rápido",
  },
  {
    icon: Users,
    title: "Alcance Exponencial",
    description: "Atinja milhões de pessoas qualificadas com precisão cirúrgica. Segmentação avançada garante que seu investimento chegue apenas a quem importa.",
    stat: "10M+",
    statLabel: "Pessoas alcançadas",
  },
  {
    icon: DollarSign,
    title: "ROI Mensurável",
    description: "Diferente do offline, no digital você rastreia cada centavo investido e cada real retornado. Decisões baseadas em dados, não em intuição.",
    stat: "8:1",
    statLabel: "ROI médio",
  },
  {
    icon: BarChart,
    title: "Previsibilidade",
    description: "Com as estratégias certas, seu crescimento deixa de ser uma aposta e se torna previsível. Você sabe exatamente quanto investir para crescer.",
    stat: "92%",
    statLabel: "Previsibilidade",
  },
  {
    icon: Globe,
    title: "Presença 24/7",
    description: "Seu negócio trabalhando enquanto você dorme. Marketing digital gera leads, vendas e autoridade mesmo fora do horário comercial.",
    stat: "24/7",
    statLabel: "Sempre ativo",
  },
  {
    icon: Zap,
    title: "Velocidade de Adaptação",
    description: "No digital, você testa, aprende e otimiza em tempo real. Campanha não performou? Ajuste em horas, não em meses.",
    stat: "48h",
    statLabel: "Para otimizar",
  },
];

const WhyMarketing = () => {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
            Por que o Marketing Digital <span className="text-primary">muda o jogo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Enquanto seus concorrentes ainda pensam em "testar o digital", empresas inteligentes já 
            dominaram o mercado online. O marketing digital não é mais um diferencial - é uma necessidade de sobrevivência.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-center space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                A diferença entre estar online e <span className="text-primary">dominar o digital</span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Ter um site e redes sociais não é marketing digital. Marketing digital é ciência: 
                análise de dados, testes A/B, funis otimizados, automação inteligente e campanhas 
                que geram ROI positivo desde o primeiro mês.
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {impacts.map((impact, index) => {
            const Icon = impact.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 bg-card/60 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 h-full group hover:shadow-lg hover:shadow-primary/10">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-primary">{impact.stat}</div>
                        <div className="text-xs text-muted-foreground">{impact.statLabel}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground">{impact.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{impact.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 md:p-12 bg-card/60 backdrop-blur border-border max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              O custo de <span className="text-primary">não investir</span> em marketing digital
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Enquanto você hesita, seus concorrentes estão capturando seus clientes online. 
              A cada dia que passa sem uma estratégia digital sólida, você perde market share, 
              autoridade e receita para quem já entendeu que o jogo mudou.
            </p>
            <p className="text-xl font-semibold text-primary">
              A pergunta não é "devo investir em marketing digital?". É "quanto estou perdendo por não estar dominando o digital ainda?"
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyMarketing;
