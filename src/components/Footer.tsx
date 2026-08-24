import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-display text-3xl font-black text-primary">Target</h3>
            <p className="text-sm text-muted-foreground">
              Performance, estratégia e resultados que transformam negócios digitais.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">Início</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Quem somos</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Nossos Cases</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Soluções</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>contato@targetcomunicacoes.com.br</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span>(xx) xXXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MapPin className="w-4 h-4" />
                <span>Rua Exemplo, 123, Cidade - UF</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Siga-nos</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group"
              >
                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground"
        >
          © 2025 Target Comunicações. Todos os direitos reservados.
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
