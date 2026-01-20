import { Transition } from 'framer-motion';
import type { GameSpeed } from '../engine/types';

/**
 * Get animation duration based on game speed setting
 */
export const getAnimationDuration = (gameSpeed: GameSpeed): number => {
  switch (gameSpeed) {
    case 'slow': return 0.7;
    case 'medium': return 0.5;
    case 'fast': return 0.3;
  }
};

/**
 * Spring transition for smooth, natural-feeling animations
 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Smooth transition for more controlled animations
 */
export const smoothTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
};
