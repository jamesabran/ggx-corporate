import { useState } from 'react';
import { Link } from 'react-router';
import {
  IconClock,
  IconBolt,
  IconMapPin,
  IconCircleCheckFilled,
  IconArrowRight,
  IconHeadset,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

const HIGHLIGHTS = [
  { icon: IconBolt,   color: 'text-orange-500', bg: 'bg-orange-50', label: 'Delivered same day', sub: 'Within Metro Manila, booked before cut-off' },
  { icon: IconClock,  color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'On-demand pickup',   sub: 'A rider collects from your location' },
  { icon: IconMapPin, color: 'text-emerald-600',bg: 'bg-emerald-50',label: 'Live tracking',      sub: 'Real-time rider location for your buyer' },
];

export function BasicSameDay() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', volume: '' });

  if (submitted) {
    return (
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <IconCircleCheckFilled className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">Request received</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">
          Thanks! A GoGo Xpress Sales representative will reach out to set up Same-Day Delivery access
          for your account within <strong className="text-gray-700">1–2 business days</strong>.
        </p>
        <div className="mt-6 w-full space-y-3">
          <Link to="/basic">
            <Button className="w-full h-12 text-base">Back to Home <IconArrowRight className="w-4 h-4" /></Button>
          </Link>
          <Link to="/basic/deliver?type=standard">
            <Button variant="ghost" className="w-full h-12 text-base text-gray-600">Book a standard delivery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-5 pb-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <IconBolt className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-orange-100 uppercase tracking-widest">Same-Day Delivery</span>
        </div>
        <h2 className="text-xl font-bold leading-tight">Need it delivered today?</h2>
        <p className="text-sm text-orange-50 mt-2 leading-relaxed">
          Same-Day Delivery is available to qualified accounts. Tell us about your shipping and our team will
          set you up — no contract required to start the conversation.
        </p>
      </div>

      {/* Highlights */}
      <div className="bg-white pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What you get</p>
        <div className="divide-y divide-gray-50">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex items-center gap-3 px-4 py-3.5">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', h.bg)}>
                <h.icon className={cn('w-5 h-5', h.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{h.label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{h.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead form */}
      <div className="bg-gray-50 px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Request Same-Day access</p>
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Your name</label>
              <Input className="mt-1" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Mobile number</label>
              <Input className="mt-1" inputMode="tel" placeholder="+63 9XX XXX XXXX" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Average shipments per week</label>
              <Input className="mt-1" inputMode="numeric" placeholder="e.g. 50" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTAs */}
      <div className="bg-gray-50 px-4 pb-4 space-y-3">
        <Button className="w-full h-12 text-base" onClick={() => setSubmitted(true)}>
          Request Same-Day access <IconArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="w-full h-12 text-base" onClick={() => setSubmitted(true)}>
          <IconHeadset className="w-4 h-4" /> Get in touch with Sales
        </Button>
        <p className="text-[11px] text-gray-400 text-center leading-snug">
          Same-Day pricing and access are arranged with our team. Your account stays on Basic in the meantime.
        </p>
      </div>
    </div>
  );
}
