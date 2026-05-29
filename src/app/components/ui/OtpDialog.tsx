import { useEffect, useState } from 'react';
import { IconShieldLock } from '@tabler/icons-react';
import { Dialog } from './Dialog';
import { Button } from './Button';

// Mock OTP — frontend/demo only. A real flow would send a code out-of-band.
const MOCK_OTP = '123456';

interface OtpDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called only when a correct 6-digit code is entered. */
  onVerified: () => void;
  title?: string;
  description?: string;
  /** Optional label describing the action being authorized. */
  actionLabel?: string;
  /** Stack above another open modal. */
  elevated?: boolean;
}

/**
 * Reusable OTP verification dialog for sensitive (financial) actions.
 * Always required before the caller commits the change — even for Admin.
 */
export function OtpDialog({
  open,
  onClose,
  onVerified,
  title = 'Verify financial change',
  description = 'Enter the 6-digit OTP sent to the account holder to continue.',
  actionLabel,
  elevated,
}: OtpDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  // Reset on each open.
  useEffect(() => {
    if (open) { setCode(''); setError(false); }
  }, [open]);

  const handleChange = (v: string) => {
    setCode(v.replace(/\D/g, '').slice(0, 6)); // digits only, max 6
    if (error) setError(false);
  };

  const handleVerify = () => {
    if (code === MOCK_OTP) onVerified();
    else setError(true);
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm" elevated={elevated}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <IconShieldLock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{description}</p>
          {actionLabel && (
            <p className="text-xs text-gray-500 mt-1">Action: <span className="font-medium text-gray-700">{actionLabel}</span></p>
          )}
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit OTP</label>
      <input
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && code.length === 6) handleVerify(); }}
        inputMode="numeric"
        autoFocus
        placeholder="------"
        maxLength={6}
        className={`w-full h-11 px-3 rounded-lg border text-center text-lg tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-primary'
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1.5">Invalid code. Please try again.</p>}
      <p className="text-xs text-gray-400 mt-2">For this mock, use 123456.</p>

      <div className="flex gap-2.5 justify-end pt-5">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={code.length !== 6} onClick={handleVerify}>Verify &amp; Continue</Button>
      </div>
    </Dialog>
  );
}
