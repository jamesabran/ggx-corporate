import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import iconPacksBanner from '@/assets/basic/icon-packs-banner.png';
import iconSdd from '@/assets/basic/icon-sdd.png';
import iconRewards from '@/assets/basic/icon-rewards.png';

interface Slide {
  id: string;
  icon: string;
  iconBg: string;
  headline: React.ReactNode;
  sub: string;
  cta: string;
  href: string;
}

const SLIDES: Slide[] = [
  {
    id: 'packs',
    icon: iconPacksBanner,
    iconBg: 'linear-gradient(135deg, rgba(232,122,166,0.32), rgba(116,182,239,0.28))',
    headline: <>Save more with <strong>GOGO Packs!</strong></>,
    sub: 'Prepaid deliveries at lower cost.',
    cta: 'Buy GOGO Packs!',
    href: '/basic/more',
  },
  {
    id: 'sdd',
    icon: iconSdd,
    iconBg: 'linear-gradient(135deg, rgba(255,160,80,0.32), rgba(255,100,120,0.22))',
    headline: <>Same-Day Delivery now available!</>,
    sub: 'Book before 11AM · at your door by 6PM.',
    cta: 'Book Same-Day',
    href: '/basic/same-day',
  },
  {
    id: 'rewards',
    icon: iconRewards,
    iconBg: 'linear-gradient(135deg, rgba(116,182,239,0.32), rgba(127,216,196,0.28))',
    headline: <>Earn rewards every shipment!</>,
    sub: 'Points for every delivery you book.',
    cta: 'View Rewards',
    href: '/basic/more',
  },
];

export function BasicPromoCarousel() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(Math.max(idx, 0), SLIDES.length - 1));
  }, []);

  return (
    <div>
      {/* Scrollable slide track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-none"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="flex w-full flex-shrink-0 items-center gap-[14px] px-[17px] py-[15px]"
            style={{
              scrollSnapAlign: 'start',
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.72)',
              borderRadius: 22,
              boxShadow: '0 12px 32px rgba(40,70,120,0.12)',
            }}
          >
            {/* Icon circle */}
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: slide.iconBg,
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <img src={slide.icon} alt="" className="h-[52px] w-[52px] object-contain" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-[15px] font-semibold leading-snug" style={{ color: '#20303f' }}>
                {slide.headline}
              </p>
              <p className="mt-[1px] text-[12.5px] font-medium" style={{ color: '#5d7589' }}>
                {slide.sub}
              </p>
              <button
                onClick={() => navigate(slide.href)}
                className="mt-[5px] text-[13.5px] font-extrabold leading-none cursor-pointer"
                style={{ color: '#1e8fd6', background: 'none', border: 'none', padding: 0 }}
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="mt-3 flex items-center justify-center gap-[6px]">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.id}
            style={{
              display: 'block',
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === active ? '#1e8fd6' : 'rgba(30,143,214,0.3)',
              transition: 'width 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
