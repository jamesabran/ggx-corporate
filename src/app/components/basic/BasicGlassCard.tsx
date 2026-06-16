import { cn } from '../../lib/utils';

interface BasicGlassCardProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  style?: React.CSSProperties;
}

export function BasicGlassCard({ children, className, strong = false, style }: BasicGlassCardProps) {
  return (
    <div
      className={cn('rounded-[26px]', className)}
      style={{
        background: strong ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.42)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 14px 38px rgba(40,70,120,0.12)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
