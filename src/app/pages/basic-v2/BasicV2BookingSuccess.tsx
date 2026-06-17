import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconCircleCheckFilled,
  IconPackage,
  IconListCheck,
  IconHome,
} from '@tabler/icons-react';
import type { BookingDraft } from '../../lib/basicBookingTypes';

function generateTrackingNumber(): string {
  const ts = Date.now().toString().slice(-6);
  return `GGX-${new Date().getFullYear()}-${ts}`;
}

export function BasicV2BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: BookingDraft } | null)?.draft;

  const [trackingNo] = useState(generateTrackingNumber);

  return (
    <div className="flex flex-col items-center px-4 pt-10 pb-6 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
        <IconCircleCheckFilled className="w-12 h-12 text-green-500" />
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-1">Booking Confirmed!</h1>
      <p className="text-sm text-gray-500 leading-snug mb-6">
        Your delivery has been scheduled. Our rider will collect your parcel soon.
      </p>

      {/* Tracking number */}
      <div className="w-full rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">Tracking Number</p>
        <p className="text-xl font-extrabold text-blue-700 tracking-wide">{trackingNo}</p>
        <p className="text-xs text-blue-400 mt-1">Standard Delivery · 1–5 business days</p>
      </div>

      {/* Summary */}
      {draft && (
        <div className="w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-4 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2.5">
            <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Item</p>
              <p className="text-sm font-semibold text-gray-800">{draft.itemName}</p>
            </div>
          </div>
          {draft.receiver && (
            <div className="flex items-start gap-2.5">
              <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 opacity-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Recipient</p>
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
        <button
          onClick={() => navigate(`/basic/orders/${trackingNo}`)}
          className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <IconListCheck className="w-4 h-4" />
          Track this order
        </button>
        <button
          onClick={() => navigate('/basic-v2')}
          className="w-full h-12 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <IconHome className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
