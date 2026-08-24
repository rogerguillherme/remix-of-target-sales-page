import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const InteractiveGrid = () => {
  const columns = 12;
  const rows = 8;
  const totalSquares = columns * rows;
  const [activeIndex, setActiveIndex] = useState(0);

  // Create diagonal wave pattern
  const getDiagonalIndex = (step: number) => {
    const diagonalSequence: number[] = [];
    
    // Create diagonal pattern from top-left to bottom-right
    for (let sum = 0; sum < columns + rows - 1; sum++) {
      for (let col = 0; col < columns; col++) {
        const row = sum - col;
        if (row >= 0 && row < rows) {
          const index = row * columns + col;
          diagonalSequence.push(index);
        }
      }
    }
    
    return diagonalSequence[step % diagonalSequence.length];
  };

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setActiveIndex(getDiagonalIndex(step));
      step++;
    }, 400); // Much slower speed - 400ms per square

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '1px',
        }}
      >
        {Array.from({ length: totalSquares }).map((_, index) => (
          <GridSquare 
            key={index} 
            index={index}
            isWaveActive={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
};

interface GridSquareProps {
  index: number;
  isWaveActive: boolean;
}

const GridSquare = ({ isWaveActive }: GridSquareProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = isHovered || isWaveActive;

  return (
    <motion.div
      className="w-full h-full cursor-pointer"
      style={{
        backgroundColor: isActive ? 'hsl(45, 95%, 62%)' : 'hsl(0, 0%, 12%)',
        opacity: isHovered ? 0.5 : isWaveActive ? 0.25 : 0.3,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        opacity: isHovered ? 0.5 : isWaveActive ? 0.25 : 0.3,
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
    />
  );
};

export default InteractiveGrid;
