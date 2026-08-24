import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Megaphone } from "lucide-react";

const cases = [
  {
    icon: TrendingUp,
    title: "E-commerce 10x em 6 meses",
    description: "Estratégia completa de tráfego pago e otimização de conversão que multiplicou o faturamento em 1000% com ROI de 8:1.",
    tags: ["Tráfego Pago", "CRO"],
    delay: 0.1,
  },
  {
    icon: Calendar,
    title: "Lançamento que fez história",
    description: "Planejamento e execução de lançamento digital que gerou R$ 2,3MM em vendas em apenas 7 dias, batendo todos os recordes do cliente.",
    tags: ["Lançamento", "Funil de Vendas"],
    delay: 0.2,
  },
  {
    icon: Megaphone,
    title: "Do zero ao milhão em leads",
    description: "Campanha integrada de inbound e outbound que gerou mais de 1 milhão de leads qualificados e aumentou o ticket médio em 45%.",
    tags: ["Lead Generation", "Inbound"],
    delay: 0.3,
  },
];

const Cases = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Cases de <span className="text-primary">sucesso real</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados concretos, métricas que impressionam. Veja como transformamos negócios 
            e geramos crescimento exponencial para nossos clientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => {
            const Icon = caseItem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: caseItem.delay }}
              >
                <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 h-full group hover:shadow-lg hover:shadow-primary/10">
                  <div className="space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        {caseItem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {caseItem.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {caseItem.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Cases;
