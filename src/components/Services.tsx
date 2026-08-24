import { motion } from "framer-motion";
import { Globe, Zap, Target, Palette, Share2, Users } from "lucide-react";

const services = [
  { icon: Globe, title: "Websites & Landing Pages", delay: 0.1 },
  { icon: Zap, title: "Automação de Marketing", delay: 0.2 },
  { icon: Target, title: "Gestão de Tráfego Pago", delay: 0.3 },
  { icon: Palette, title: "Design & Identidade Visual", delay: 0.4 },
  { icon: Share2, title: "Social Media", delay: 0.5 },
  { icon: Users, title: "Consultoria Estratégica", delay: 0.6 },
];

const Services = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: service.delay }}
                className="group relative p-8 bg-secondary rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
