import type { ComponentType } from 'react';
import { cn } from '../lib/utils';

interface IconContainerProps {
  icon: ComponentType<{ className?: string }>;
  /** Tailwind bg class, e.g. 'bg-blue-50' */
  bg: string;
  /** Tailwind text class, e.g. 'text-blue-600' */
  color: string;
  /** 'sm' = 28px, 'base' = 32px, 'md' = 40px (default), 'lg' = 44px */
  size?: 'sm' | 'base' | 'md' | 'lg';
  /** Override rounded class. Defaults to 'rounded-lg'. */
  rounded?: string;
  className?: string;
}

const sizeMap = {
  sm:   { container: 'w-7 h-7',   icon: 'w-3.5 h-3.5' },
  base: { container: 'w-8 h-8',   icon: 'w-4 h-4'     },
  md:   { container: 'w-10 h-10', icon: 'w-5 h-5'     },
  lg:   { container: 'w-11 h-11', icon: 'w-5 h-5'     },
};

export function IconContainer({
  icon: Icon,
  bg,
  color,
  size = 'md',
  rounded = 'rounded-lg',
  className,
}: IconContainerProps) {
  const { container, icon: iconSize } = sizeMap[size];
  return (
    <div className={cn('flex items-center justify-center flex-shrink-0', container, rounded, bg, className)}>
      <Icon className={cn(iconSize, color)} />
    </div>
  );
}
