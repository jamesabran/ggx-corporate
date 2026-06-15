import { Link } from 'react-router';
import {
  IconStar,
  IconTrendingUp,
  IconHeadset,
  IconBolt,
  IconShieldCheck,
  IconArrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

// Basic-native showcase of what GGX Business+ offers when a seller grows.
// This is a nudge / lead-capture preview — NOT a tier dashboard and NOT the
// Business+ /dashboard chrome. CTAs hand off to the Sales/BD lead flow.

const BENEFITS = [
  { icon: IconTrendingUp,  color: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Special / negotiated pricing', sub: 'Discuss custom rates based on your volume' },
  { icon: IconBolt,        color: 'text-orange-500',  bg: 'bg-orange-50',  label: 'Same-Day & on-demand access',  sub: 'Unlock faster delivery options for your account' },
  { icon: IconHeadset,     color: 'text-violet-600',  bg: 'bg-violet-50',  label: 'Priority support',             sub: 'A dedicated contact and faster response' },
  { icon: IconShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Flexible billing arrangements', sub: 'Set up once your account is contracted' },
];

const STEPS = [
  { label: 'Tell us about your volume',  sub: 'Share your shipping activity and what you need.' },
  { label: 'Sales/BD reviews & reaches out', sub: 'Our team discusses special pricing and options.' },
  { label: 'Contract setup & upgrade',   sub: 'Once agreed, your account moves to Business+.' },
];

export function BasicBusinessPreview() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 px-4 pt-5 pb-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <IconStar className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">GGX Business+</span>
        </div>
        <h2 className="text-xl font-bold leading-tight">A preview of what you grow into</h2>
        <p className="text-sm text-blue-100 mt-2 leading-relaxed">
          Business+ is our contracted program for high-volume sellers and merchants. There’s nothing to switch
          on today — when you’re ready, our team sets it up with you.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-white pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What you get when you grow</p>
        <div className="divide-y divide-gray-50">
          {BENEFITS.map((b) => (
            <div key={b.label} className="flex items-center gap-3 px-4 py-3.5">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', b.bg)}>
                <b.icon className={cn('w-5 h-5', b.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{b.label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">How it works</p>
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-4 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{s.label}</p>
                  <p className="text-xs text-gray-500 leading-snug mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reassurance */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-3">
          <IconCircleCheckFilled className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-snug">
            Your account stays on Basic with full access to your free tools. Business+ pricing is arranged
            offline with Sales/BD — there’s no contract until you agree to one.
          </p>
        </div>
      </div>

      {/* CTAs → lead/handoff flow (stays in /basic) */}
      <div className="px-4 pt-2 pb-4 space-y-3">
        <Link to="/basic/qualify" className="block">
          <Button className="w-full h-12 text-base">
            Request account review <IconArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/basic/qualify" className="block">
          <Button variant="outline" className="w-full h-12 text-base">
            <IconHeadset className="w-4 h-4" /> Talk to Sales
          </Button>
        </Link>
        <Link to="/basic">
          <Button variant="ghost" className="w-full h-12 text-base text-gray-600">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
