import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text
}: LoadingSpinnerProps) {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={cn(
          "border-t-blue-500 border-blue-500/30 rounded-full animate-spin", 
          sizeClasses[size],
          className
        )} 
        style={{ borderStyle: 'solid' }}
      />
      {text && (
        <p className="mt-2 text-sm text-blue-500/80 animate-pulse">{text}</p>
      )}
    </div>
  );
}
