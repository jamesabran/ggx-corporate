import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconCircleCheckFilled,
  IconPackage,
  IconListCheck,
  IconHome,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import type { BookingDraft } from '../../lib/basicBookingTypes';

function generateTrackingNumber(): string {
  const ts = Date.now().toString().slice(-6);
  return `GGX-${new Date().getFullYear()}-${ts}`;
}

export function BasicBookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: BookingDraft } | null)?.draft;

  const [trackingNo] = useState(generateTrackingNumber);

  return (
    <div className="flex flex-col items-center px-4 pt-10 pb-6 text-center min-h-[60vh]">
      {/* Success icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'rgba(34,197,94,0.12)' }}
      >
        <IconCircleCheckFilled className="w-14 h-14 text-green-500" />
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">
        Booking Confirmed!
      </h1>
      <p className="text-sm text-gray-500 leading-snug mb-6">
        Your delivery has been scheduled. Our rider will collect your parcel soon.
      </p>

      {/* Tracking number */}
      <div
        className="w-full rounded-2xl border border-blue-100 bg-blue-50 p-4 mb-6"
      >
        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">
          Tracking Number
        </p>
        <p className="text-xl font-extrabold text-blue-700 tracking-wide">{trackingNo}</p>
        <p className="text-xs text-blue-400 mt-1">Standard Delivery · 1–5 business days</p>
      </div>

      {/* Summary mini-card */}
      {draft && (
        <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2.5">
            <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Item</p>
              <p className="text-sm font-semibold text-gray-800">{draft.itemName}</p>
            </div>
          </div>
          {draft.receiver && (
            <div className="flex items-start gap-2.5">
              <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 opacity-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recipient</p>
                <p className="text-sm font-semibold text-gray-800">{draft.receiver.name}</p>
                <p className="text-xs text-gray-500">
                  {[draft.receiver.city, draft.receiver.province].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="w-full space-y-2.5">
        <Button
          className="w-full h-12 text-base"
          onClick={() => navigate(`/basic/orders/${trackingNo}`)}
        >
          <IconListCheck className="w-4 h-4" />
          Track this order
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base"
          onClick={() => navigate('/basic')}
        >
          <IconHome className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
