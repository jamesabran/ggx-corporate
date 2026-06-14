import { Link } from 'react-router';
import {
  IconMessageCircle,
  IconTicket,
  IconBook,
  IconPhone,
  IconChevronRight,
  IconCircleCheckFilled,
  IconClock,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const HELP_TOPICS = [
  'How do I book a delivery?',
  'When will I receive my COD payout?',
  'How do I track a shipment?',
  'How do bulk uploads work?',
];

const TICKETS = [
  { id: 'TCK-2041', subject: 'COD payout not received', status: 'open',     when: '1h ago' },
  { id: 'TCK-2033', subject: 'Wrong delivery address',  status: 'resolved', when: 'Jun 9' },
];

export function BasicSupport() {
  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Contact options */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <IconMessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Live chat</p>
          <p className="text-xs text-gray-500 leading-snug text-left">Mon–Sat, 8am–8pm</p>
        </button>
        <button className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-start gap-2 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
            <IconPhone className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Call us</p>
          <p className="text-xs text-gray-500 leading-snug text-left">(02) 8888-1234</p>
        </button>
      </div>

      {/* Help center */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <IconBook className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-bold text-gray-900">Popular help topics</p>
        </div>
        <div className="divide-y divide-gray-50">
          {HELP_TOPICS.map((t) => (
            <button key={t} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer">
              <p className="flex-1 text-sm text-gray-700 leading-snug">{t}</p>
              <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* My tickets */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <IconTicket className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-bold text-gray-900">Your tickets</p>
        </div>
        <div className="divide-y divide-gray-50">
          {TICKETS.map((tk) => (
            <button key={tk.id} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                tk.status === 'resolved' ? 'bg-emerald-50' : 'bg-orange-50'
              )}>
                {tk.status === 'resolved'
                  ? <IconCircleCheckFilled className="w-5 h-5 text-emerald-500" />
                  : <IconClock className="w-5 h-5 text-orange-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{tk.subject}</p>
                <p className="text-xs text-gray-400 leading-snug">{tk.id} · {tk.when}</p>
              </div>
              <Badge variant={tk.status === 'resolved' ? 'success' : 'pending'} className="text-[10px] px-2 py-0.5 leading-none flex-shrink-0">
                {tk.status === 'resolved' ? 'Resolved' : 'Open'}
              </Badge>
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-50">
          <button className="text-xs font-semibold text-blue-600 cursor-pointer">+ New support ticket</button>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">
        Looking for account options?{' '}
        <Link to="/basic/account" className="text-blue-600 font-semibold">Go to Account</Link>
      </p>
    </div>
  );
}
