import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  /** Max-width utility for the panel. Defaults to a small confirm-sized panel. */
  size?: 'sm' | 'md' | 'lg';
  /** Stacking context — confirmations layered over another modal use a higher z-index. */
  elevated?: boolean;
}

/**
 * Base modal: full-screen scrim + centered white panel.
 * Mirrors the app's previous inline `fixed inset-0 bg-gray-900/50…` pattern so
 * existing modals look and behave identically. Clicking the scrim closes it.
 */
export function Dialog({ open, onClose, title, children, size = 'sm', elevated = false }: DialogProps) {
  if (!open) return null;
  const maxW = size === 'lg' ? 'max-w-2xl' : size === 'md' ? 'max-w-md' : 'max-w-sm';
  return (
    <div
      className={`fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 ${elevated ? 'z-[60]' : 'z-50'}`}
      onClick={onClose}
    >
      <div className={`bg-white rounded-xl shadow-xl ${maxW} w-full p-6`} onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  /** Optional icon shown inside the confirm button. */
  confirmIcon?: ReactNode;
  /** Extra content rendered between the description and the action row. */
  children?: ReactNode;
  elevated?: boolean;
}

/**
 * Confirmation wrapper around `Dialog` with a description and confirm/cancel
 * actions. `variant` controls the confirm button style (destructive vs default).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  confirmIcon,
  children,
  elevated = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} elevated={elevated}>
      {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
      {children}
      <div className="flex gap-2.5 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={variant} size="sm" onClick={onConfirm}>
          {confirmIcon}
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
