import { motion } from "framer-motion";
import { Building2, Stethoscope, ShoppingBag, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Solutions = () => {
  const solutions = [
    {
      icon: Building2,
      title: "Imobiliárias",
      description: "Geração de leads qualificados, tours virtuais, anúncios segmentados e posicionamento local para vender e alugar mais rápido.",
      features: ["Anúncios Meta & Google", "Landing Pages Otimizadas", "CRM Integrado"],
    },
    {
      icon: Stethoscope,
      title: "Clínicas e Consultórios",
      description: "Atração de pacientes, agendamentos automatizados e fortalecimento da reputação online para profissionais de saúde.",
      features: ["Marketing Médico Ético", "Gestão de Reputação", "Automação de Agendamentos"],
    },
    {
      icon: ShoppingBag,
      title: "Lojas e E-commerce",
      description: "Aumento de vendas através de tráfego pago qualificado, estratégias de conversão e remarketing inteligente.",
      features: ["E-commerce Completo", "Funis de Vendas", "Recuperação de Carrinho"],
    },
    {
      icon: Briefcase,
      title: "Empresas B2B",
      description: "Geração de oportunidades comerciais, nutrição de leads e posicionamento estratégico no LinkedIn e Google.",
      features: ["LinkedIn Ads", "Inbound Marketing", "Account-Based Marketing"],
    },
    {
      icon: Star,
      title: "Influencers & Criadores",
      description: "Monetização de audiência, parcerias estratégicas e transformação de seguidores em clientes fiéis.",
      features: ["Monetização de Conteúdo", "Parcerias & Marcas", "Produtos Digitais"],
    },
  ];

  return (
    <section id="solucoes" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 uppercase">
            Soluções <span className="text-primary">Sob Medida</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Estratégias personalizadas para cada segmento. Do pequeno ao grande negócio, 
            temos a solução ideal para o seu crescimento.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <div className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-primary/5 p-12 rounded-2xl border border-primary/20"
        >
          <h3 className="font-display text-3xl md:text-4xl font-black text-foreground mb-4">
            Não encontrou seu segmento?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Atendemos diversos outros nichos com soluções personalizadas. 
            Fale com nossos especialistas e descubra como podemos ajudar seu negócio.
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-full text-lg"
          >
            Falar com especialista
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Solutions;
