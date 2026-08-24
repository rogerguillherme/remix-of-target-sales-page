import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = [
  "performance",
  "resultados",
  "+clientes",
  "+vendas",
  "+lucro",
  "posicionamento"
];

const AnimatedWords = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block min-w-[400px] h-[1.2em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 text-primary"
        >
          {words[currentIndex]}
          <span className="absolute -right-1 top-0 bottom-0 w-1 bg-primary animate-pulse" />
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedWords;
