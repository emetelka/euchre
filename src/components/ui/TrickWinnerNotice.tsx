import React from 'react';
import { motion } from 'framer-motion';

interface TrickWinnerNoticeProps {
  playerName: string;
}

export const TrickWinnerNotice: React.FC<TrickWinnerNoticeProps> = ({
  playerName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
    >
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-base sm:text-lg whitespace-nowrap">
        {playerName} wins!
      </div>
    </motion.div>
  );
};
