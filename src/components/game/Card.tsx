import React from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import type { Card as CardType } from '../../engine/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  layoutId?: string;
  transition?: Transition;
}

const CardComponent: React.FC<CardProps> = ({
  card,
  onClick,
  disabled = false,
  faceDown = false,
  size = 'medium',
  className = '',
  layoutId,
  transition,
}) => {
  const sizeClasses = {
    small: 'w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20',
    medium: 'w-14 h-20 sm:w-[72px] sm:h-[100px] md:w-20 md:h-28',
    large: 'w-20 h-28 sm:w-[88px] sm:h-32 md:w-24 md:h-36',
  };

  const textSizeClasses = {
    small: 'text-sm sm:text-base md:text-lg',
    medium: 'text-lg sm:text-xl md:text-2xl',
    large: 'text-xl sm:text-2xl md:text-3xl',
  };

  const symbolSizeClasses = {
    small: 'text-xl sm:text-2xl md:text-2xl',
    medium: 'text-2xl sm:text-3xl md:text-4xl',
    large: 'text-3xl sm:text-4xl md:text-5xl',
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  if (faceDown) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={transition}
        className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-blue-900 rounded-lg shadow-lg flex items-center justify-center cursor-default`}
      >
        <div className="text-blue-400 text-2xl font-bold">E</div>
      </motion.div>
    );
  }

  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={transition}
      onClick={handleClick}
      className={`${sizeClasses[size]} ${className} border-2 rounded-lg shadow-lg flex flex-col items-center justify-center gap-1 ${
        !disabled && onClick
          ? 'bg-white cursor-pointer hover:scale-105 hover:shadow-xl border-gray-300'
          : 'bg-gray-300 cursor-not-allowed border-gray-400 opacity-60'
      }`}
      style={{
        color: disabled ? '#6b7280' : suitColor,
      }}
      whileHover={!disabled && onClick ? { scale: 1.05 } : undefined}
    >
      <div className={`${textSizeClasses[size]} font-bold leading-none`}>
        {card.rank}
      </div>
      <div className={`${symbolSizeClasses[size]} leading-none`}>
        {suitSymbol}
      </div>
    </motion.div>
  );
};

// Export the card component without memo for now to ensure onClick handlers work correctly
// TODO: Consider adding memo back with proper onClick comparison if performance is an issue
export const Card = CardComponent;
