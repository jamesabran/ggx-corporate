import { Link } from 'react-router';
import { IconArrowRight, IconStar, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export function GrowingNudgeCard() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative">
      {/* Promo card — styled like the GGX app's carousel banner */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-stretch min-h-[104px]">

          {/* Left: illustration panel */}
          <div className="w-[108px] flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
            {/* Background rings for depth */}
            <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-6 -left-6" />
            <div className="absolute w-16 h-16 rounded-full bg-white/10 bottom-0 right-0 translate-x-4 translate-y-4" />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <IconStar className="w-7 h-7 text-yellow-300 fill-yellow-300" />
              </div>
              <div className="flex gap-0.5">
                <span className="w-4 h-1 rounded-full bg-white/80" />
                <span className="w-1.5 h-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          {/* Right: text + CTA */}
          <div className="flex-1 px-3 py-3 pr-8 flex flex-col justify-center gap-1.5">
            <p className="text-sm font-bold text-gray-900 leading-snug">
              You may qualify for special business pricing!
            </p>
            <p className="text-xs text-gray-500 leading-snug">
              Your shipping activity may unlock contracted HVM rates and priority support.
            </p>
            <Link to="/basic/qualify" className="flex items-center gap-1 text-sm font-bold text-blue-600 mt-0.5">
              Request account review
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-1.5 pb-2.5 pt-1">
          <span className="w-4 h-1.5 rounded-full bg-blue-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10"
        aria-label="Dismiss"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
