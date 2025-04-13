import React from 'react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'blue' | 'pink' | 'yellow' | 'green' | 'indigo';
}

export const Card = ({ children, className, variant = 'default' }: CardProps) => {
  return (
    <div className={cn(
      'rounded-lg shadow-sm overflow-hidden relative p-4',
      {
        'bg-white': variant === 'default',
        'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100/50': variant === 'blue',
        'bg-gradient-to-br from-pink-50 to-fuchsia-100/50 border border-pink-100/50': variant === 'pink',
        'bg-gradient-to-br from-amber-50 to-yellow-100/50 border border-amber-100/50': variant === 'yellow',
        'bg-gradient-to-br from-emerald-50 to-green-100/50 border border-emerald-100/50': variant === 'green',
        'bg-gradient-to-br from-indigo-50 to-violet-100/50 border border-indigo-100/50': variant === 'indigo',
      },
      className
    )}>
      {children}
    </div>
  );
}; 