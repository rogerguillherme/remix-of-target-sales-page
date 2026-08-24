import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, TrendingUp, Users, DollarSign } from "lucide-react";

const testimonials = [
  {
    name: "Carolina Mendes",
    role: "CEO da BeautyBox",
    image: "CM",
    testimonial: "A Target transformou completamente nosso e-commerce. Em 4 meses, saímos de R$ 80k para R$ 640k em faturamento mensal. O trabalho deles com tráfego pago e otimização de conversão é simplesmente excepcional.",
    metrics: [
      { icon: TrendingUp, value: "700%", label: "Aumento em vendas" },
      { icon: DollarSign, value: "12:1", label: "ROI médio" },
    ],
    delay: 0.1,
  },
  {
    name: "Rafael Santos",
    role: "Fundador da TechFlow",
    image: "RS",
    testimonial: "Contratei a Target para um lançamento digital e os resultados superaram todas as expectativas. Faturamos R$ 1.8M em 7 dias e construímos uma lista de 47 mil leads altamente engajados. Parceria para vida toda!",
    metrics: [
      { icon: DollarSign, value: "R$ 1.8M", label: "Em 7 dias" },
      { icon: Users, value: "47K", label: "Leads gerados" },
    ],
    delay: 0.2,
  },
  {
    name: "Juliana Ferreira",
    role: "Diretora de Marketing - FitLife",
    image: "JF",
    testimonial: "Profissionalismo, estratégia e execução impecável. A Target não só entregou resultados absurdos nas campanhas de tráfego, mas também nos ensinou a pensar digital de forma estratégica. Nosso CAC caiu 60% em 3 meses.",
    metrics: [
      { icon: TrendingUp, value: "-60%", label: "Redução CAC" },
      { icon: Users, value: "+320%", label: "Leads qualificados" },
    ],
    delay: 0.3,
  },
];

const Testimonials = () => {
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
            Quem confia, <span className="text-primary">recomenda</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de empresas que escolheram a Target e alcançaram resultados extraordinários
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: testimonial.delay }}
            >
              <Card className="p-8 bg-card/60 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/10">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-foreground leading-relaxed mb-6 flex-grow">
                  "{testimonial.testimonial}"
                </blockquote>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl border border-border">
                  {testimonial.metrics.map((metric, metricIndex) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metricIndex} className="text-center">
                        <div className="flex justify-center mb-2">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-2xl font-black text-primary mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {metric.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {testimonial.image}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
