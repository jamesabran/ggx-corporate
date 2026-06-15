import { Link } from 'react-router';
import {
  IconCloudUpload,
  IconFileSpreadsheet,
  IconDownload,
  IconCircleCheckFilled,
  IconClock,
  IconChevronRight,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const RECENT_BATCHES = [
  { id: 'BATCH-0612', rows: 42, ok: 42, status: 'done',       when: 'Today, 9:14 AM' },
  { id: 'BATCH-0610', rows: 18, ok: 17, status: 'done',       when: 'Jun 10' },
  { id: 'BATCH-0609', rows: 30, ok: 0,  status: 'processing', when: 'Just now' },
];

export function BasicBulkUpload() {
  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Intro */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-base font-bold text-gray-900">Bulk Upload</p>
          <Badge variant="success" className="text-[10px] px-2 py-0.5 leading-none">Free</Badge>
        </div>
        <p className="text-xs text-gray-500 leading-snug">
          Book many parcels at once with a spreadsheet. We validate each row and give you a summary.
        </p>
      </div>

      {/* Upload dropzone */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 px-4 py-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
            <IconCloudUpload className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Upload your spreadsheet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">CSV or XLSX · up to 500 rows</p>
          <Button className="h-11 px-6">Choose file</Button>
        </div>

        <button className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 cursor-pointer">
          <IconDownload className="w-4 h-4" />
          Download template
        </button>
      </div>

      {/* Recent batches */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-900">Recent uploads</p>
        <div className="divide-y divide-gray-50">
          {RECENT_BATCHES.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                b.status === 'done' ? 'bg-emerald-50' : 'bg-orange-50'
              )}>
                {b.status === 'done'
                  ? <IconFileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  : <IconClock className="w-5 h-5 text-orange-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{b.id}</p>
                <p className="text-xs text-gray-500 leading-snug">
                  {b.status === 'processing'
                    ? `${b.rows} rows · processing…`
                    : `${b.ok}/${b.rows} rows booked`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {b.status === 'done'
                  ? <Badge variant="success" className="text-[10px] px-2 py-0.5 leading-none flex items-center gap-1"><IconCircleCheckFilled className="w-3 h-3" />Done</Badge>
                  : <Badge variant="pending" className="text-[10px] px-2 py-0.5 leading-none">Processing</Badge>}
                <span className="text-[11px] text-gray-400 leading-none">{b.when}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 px-4">
        Looking for a single parcel?{' '}
        <Link to="/basic/deliver?type=standard" className="text-blue-600 font-semibold">Book a standard delivery</Link>
        <IconChevronRight className="inline w-3 h-3 -mt-0.5" />
      </p>
    </div>
  );
}
