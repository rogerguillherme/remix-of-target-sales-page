import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onOpenContact: () => void;
}

const Header = ({ onOpenContact }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" strokeWidth={2.5} />
          <span className="font-display text-2xl font-black text-primary">Target</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-primary font-medium hover:text-primary/80 transition-colors">
            Início
          </Link>
          <Link to="/quem-somos" className="text-foreground hover:text-primary transition-colors">
            Quem somos
          </Link>
          <Link to="/nossos-cases" className="text-foreground hover:text-primary transition-colors">
            Nossos Cases
          </Link>
          <Link to="/solucoes" className="text-foreground hover:text-primary transition-colors">
            Soluções
          </Link>
        </nav>

        <Button 
          onClick={onOpenContact}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2 rounded-lg"
        >
          Realizar orçamento
        </Button>
      </div>
    </header>
  );
};

export default Header;
