'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function HoverLift({ children, className, style }: HoverLiftProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
    >
      {children}
    </motion.div>
  );
}

