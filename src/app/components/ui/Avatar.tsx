import { cn } from '../../lib/utils';

export interface AvatarProps {
  /** Initials shown when there's no image. */
  initials?: string;
  /** Optional image source; falls back to initials. */
  src?: string;
  alt?: string;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'base' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-[9px]',
  base: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

/**
 * Account/user avatar. Extracted from the gradient-initials pattern used in the
 * RootLayout topbar and account switcher. Square (rounded-lg) and circle
 * variants mirror the GGX-SHADCN Avatar set.
 */
export function Avatar({ initials, src, alt, shape = 'circle', size = 'base', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700',
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} className="h-full w-full object-cover" />
      ) : (
        <span className="font-bold leading-none text-white">{initials}</span>
      )}
    </div>
  );
}
