import React from 'react';
import { motion } from 'framer-motion';
import type { Position } from '../../engine/types';

interface TrickWinnerNoticeProps {
  winner: Position;
  playerName: string;
}

export const TrickWinnerNotice: React.FC<TrickWinnerNoticeProps> = ({
  winner,
  playerName,
}) => {
  // Position the notice based on winner's position
  const getPositionClasses = () => {
    switch (winner) {
      case 0: // South
        return 'bottom-32 left-1/2 -translate-x-1/2';
      case 1: // West
        return 'left-32 top-1/2 -translate-y-1/2';
      case 2: // North
        return 'top-32 left-1/2 -translate-x-1/2';
      case 3: // East
        return 'right-32 top-1/2 -translate-y-1/2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={`fixed ${getPositionClasses()} z-40 pointer-events-none`}
    >
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm sm:text-base whitespace-nowrap">
        {playerName} wins!
      </div>
    </motion.div>
  );
};
