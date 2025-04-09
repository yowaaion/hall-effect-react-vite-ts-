import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-lg',
      className
    )}>
      {children}
    </div>
  );
}; 