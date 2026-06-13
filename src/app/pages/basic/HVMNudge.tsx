import { useState } from 'react';
import { Link } from 'react-router';
import {
  IconStar,
  IconCircleCheckFilled,
  IconShieldCheck,
  IconHeadset,
  IconTrendingUp,
  IconArrowRight,
  IconBuildingStore,
  IconChevronRight,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { useBasicSegment } from '../../contexts/BasicSegmentContext';

const HVM_BENEFITS = [
  { icon: IconTrendingUp,    color: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Contracted rates',         sub: 'Negotiate custom pricing with your Sales rep' },
  { icon: IconHeadset,       color: 'text-violet-600',  bg: 'bg-violet-50',  label: 'Priority support',         sub: 'Dedicated account manager and faster SLA' },
  { icon: IconShieldCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Billing & invoicing',       sub: 'Monthly invoice with consolidated billing' },
  { icon: IconBuildingStore, color: 'text-orange-600',  bg: 'bg-orange-50',  label: 'Corporate dashboard',      sub: 'Subaccounts, teams, advanced reports' },
  { icon: IconStar,          color: 'text-amber-600',   bg: 'bg-amber-50',   label: 'Exclusive tier benefits',  sub: 'Volume bonuses, premium vouchers, rewards' },
];

const QUALIFICATION_SIGNALS = [
  '50+ shipments in the past 30 days',
  'Consistent COD collection activity',
  'Multi-product or bulk shipment patterns',
  'Active storefront or Shopify integration',
];

type FlowState = 'info' | 'review-requested' | 'talk-to-sales';

export function HVMNudge() {
  const { segment, setSegment } = useBasicSegment();
  const [flowState, setFlowState] = useState<FlowState>('info');

  const handleRequestReview = () => {
    setSegment('growing');
    setFlowState('review-requested');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTalkToSales = () => {
    setFlowState('talk-to-sales');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (flowState === 'review-requested') {
    return (
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
          <IconCircleCheckFilled className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">Request Submitted</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">
          Your account review request has been received. A GGX Business Development representative will
          contact you within <strong className="text-gray-700">2–3 business days</strong>.
        </p>

        <Card className="mt-6 w-full border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-left">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-2">What happens next</p>
            <div className="space-y-2.5">
              {[
                'A GGX Sales/BD rep reviews your account activity',
                'They reach out to discuss pricing and contract terms',
                'Once contracted, your account is upgraded to GGX Business+',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-blue-800 leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 w-full space-y-3">
          <Link to="/dashboard" className="block">
            <Button className="w-full h-12 text-base">
              Explore GGX Business+
              <IconArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/basic">
            <Button variant="ghost" className="w-full h-12 text-base text-gray-600">
              Back to Basic Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-snug text-center max-w-xs">
          Your account stays on Basic until a contract is finalized. Pricing is negotiated offline with Sales/BD.
        </p>
      </div>
    );
  }

  if (flowState === 'talk-to-sales') {
    return (
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
          <IconCircleCheckFilled className="w-9 h-9 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">We'll Be in Touch</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">
          Your interest has been noted. A GGX Sales representative will reach out to discuss how we can support
          your business growth.
        </p>

        <Card className="mt-6 w-full border-gray-200">
          <CardContent className="p-4 text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">In the meantime</p>
            <div className="space-y-2.5">
              {[
                'Continue shipping with your Basic account',
                'Explore Save & Earn features to reduce costs',
                'Build your storefront and grow your customer base',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <IconCircleCheckFilled className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 w-full space-y-3">
          <Link to="/basic/more" className="block">
            <Button className="w-full h-12 text-base">
              Explore Save & Earn
              <IconArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/basic">
            <Button variant="ghost" className="w-full h-12 text-base text-gray-600">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 px-4 pt-5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <IconStar className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Business Benefits</span>
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">
          You may qualify for special business pricing
        </h2>
        <p className="text-sm text-blue-100 mt-2 leading-relaxed">
          Your recent shipping activity suggests you could benefit from GGX Business+ — our contracted HVM program
          for volume sellers and merchants.
        </p>
      </div>

      {/* What's included */}
      <div className="bg-white pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          What Business+ includes
        </p>
        <div className="divide-y divide-gray-50">
          {HVM_BENEFITS.map((b) => (
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

      {/* Qualification signals */}
      <div className="bg-gray-50 px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Why you may qualify
        </p>
        <Card className="border-gray-200 shadow-none">
          <CardContent className="p-4 space-y-2.5">
            {QUALIFICATION_SIGNALS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <IconCircleCheckFilled className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-snug">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="bg-white px-4 pt-4 pb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">How it works</p>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Request a review',    sub: 'We assess your account activity and volume.' },
            { step: '2', label: 'Sales/BD onboarding', sub: 'A GGX rep contacts you to discuss pricing and terms.' },
            { step: '3', label: 'Contract & upgrade',  sub: 'Once agreed, your account moves to Business+.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </span>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{s.label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 leading-snug">
          HVM contract pricing is negotiated offline. Your account stays on Basic until a contract is finalized.
        </p>
      </div>

      {/* CTAs */}
      <div className="px-4 py-4 space-y-3">
        <Button
          className="w-full h-12 text-base"
          onClick={handleRequestReview}
        >
          Request account review
          <IconArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base"
          onClick={handleTalkToSales}
        >
          Talk to Sales
        </Button>
      </div>

      {/* Preview of Business+ */}
      <div className="px-4 pb-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">Preview GGX Business+</p>
              <Link to="/dashboard" className="text-xs font-medium text-blue-600 flex items-center gap-0.5">
                Open <IconChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              You can explore the full Business+ dashboard now. This is the contracted HVM/Corporate
              experience with subaccounts, advanced analytics, billing, and more.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Already on growing segment */}
      {segment === 'growing' && (
        <div className="px-4 pb-4">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <IconCircleCheckFilled className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-900">Account review pending</p>
              </div>
              <p className="text-xs text-emerald-700 leading-snug">
                A GGX rep will contact you soon to discuss your Business+ upgrade.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
