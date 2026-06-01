import { useEffect, useState } from 'react';
import {
  IconPlus, IconCircleCheck, IconBox, IconTruck, IconAdjustments,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/SearchInput';
import { Dialog } from '../components/ui/Dialog';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { getSubaccountOptions } from '../services/userService';
import {
  getOpsRequests, submitOpsRequest,
  CATEGORY_META, STATUS_META,
  SUPPLY_TYPE_LABELS, PICKUP_SUPPORT_LABELS, ASSISTANCE_TYPE_LABELS,
  type OperationsRequest, type OpsRequestCategory,
  type SupplyType, type PickupSupportType, type OperationalAssistanceType,
} from '../services/opsRequestsService';

// ─── new-request form state ──────────────────────────────────────────────────

interface FormState {
  category: OpsRequestCategory | '';
  subaccountId: string;
  notes: string;
  // supply
  supplyType: SupplyType | '';
  quantity: string;
  deliveryAddress: string;
  neededByDate: string;
  // pickup support
  pickupSupportType: PickupSupportType | '';
  relatedBatchId: string;
  pickupAddress: string;
  estimatedShipmentCount: string;
  estimatedWeight: string;
  preferredPickupWindow: string;
  // operational assistance
  assistanceType: OperationalAssistanceType | '';
}

const emptyForm = (): FormState => ({
  category: '',
  subaccountId: '',
  notes: '',
  supplyType: '',
  quantity: '',
  deliveryAddress: '',
  neededByDate: '',
  pickupSupportType: '',
  relatedBatchId: '',
  pickupAddress: '',
  estimatedShipmentCount: '',
  estimatedWeight: '',
  preferredPickupWindow: '',
  assistanceType: '',
});

// ─── helpers ─────────────────────────────────────────────────────────────────

function requestTitle(r: OperationsRequest): string {
  if (r.category === 'supply' && r.supplyType) {
    return `${SUPPLY_TYPE_LABELS[r.supplyType]} Supply — ${r.quantity ?? '?'} units`;
  }
  if (r.category === 'pickup_support' && r.pickupSupportType) {
    return PICKUP_SUPPORT_LABELS[r.pickupSupportType];
  }
  if (r.category === 'operational_assistance' && r.assistanceType) {
    return ASSISTANCE_TYPE_LABELS[r.assistanceType];
  }
  return CATEGORY_META[r.category].label;
}

function requestDetail(r: OperationsRequest): string {
  if (r.category === 'supply') {
    return [r.deliveryAddress, r.neededByDate ? `Needed by ${r.neededByDate}` : ''].filter(Boolean).join(' · ');
  }
  if (r.category === 'pickup_support') {
    return [
      r.pickupAddress,
      r.estimatedShipmentCount ? `~${r.estimatedShipmentCount} shipments` : '',
      r.preferredPickupWindow,
    ].filter(Boolean).join(' · ');
  }
  if (r.category === 'operational_assistance') {
    return r.notes ?? '';
  }
  return '';
}

// ─── component ───────────────────────────────────────────────────────────────

export function OperationsRequests() {
  const { isMainAccountView, getCurrentAccountId, getCurrentAccountName } = useSubAccounts();
  const mainView = isMainAccountView();
  const scopeId = mainView ? undefined : (getCurrentAccountId() ?? undefined);

  const [requests, setRequests] = useState<OperationsRequest[]>([]);
  const [subaccountOptions, setSubaccountOptions] = useState<{ id: string; name: string }[]>([]);

  const [categoryFilter, setCategoryFilter] = useState<OpsRequestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subaccountFilter, setSubaccountFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const refresh = () => {
    getOpsRequests(scopeId ? { subaccountId: scopeId } : undefined)
      .then(setRequests)
      .catch(() => {});
  };
  useEffect(refresh, [scopeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getSubaccountOptions().then(setSubaccountOptions).catch(() => {});
  }, []);

  // Presentation-only filtering.
  const q = searchQuery.trim().toLowerCase();
  const visible = requests.filter((r) => {
    const searchOk =
      q.length < 2 ||
      r.id.toLowerCase().includes(q) ||
      requestTitle(r).toLowerCase().includes(q) ||
      r.subaccountName.toLowerCase().includes(q);
    const catOk = categoryFilter === 'all' || r.category === categoryFilter;
    const stOk  = statusFilter === 'all' || r.status === statusFilter;
    const subOk = subaccountFilter === 'all' || r.subaccountId === subaccountFilter;
    return searchOk && catOk && stOk && subOk;
  });

  // Summary counts.
  const openCount     = requests.filter((r) => r.status === 'submitted' || r.status === 'in_review' || r.status === 'coordinating' || r.status === 'scheduled').length;
  const supplyCount   = requests.filter((r) => r.category === 'supply').length;
  const pickupCount   = requests.filter((r) => r.category === 'pickup_support').length;

  // Form helpers.
  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const formValid = (): boolean => {
    if (!form.category) return false;
    if (!mainView && !scopeId) return false;
    if (mainView && !form.subaccountId) return false;
    if (form.category === 'supply') return !!(form.supplyType && form.quantity && form.deliveryAddress);
    if (form.category === 'pickup_support') return !!(form.pickupSupportType && form.pickupAddress);
    if (form.category === 'operational_assistance') return !!form.assistanceType;
    return false;
  };

  const handleSubmit = async () => {
    if (!formValid() || submitting) return;
    setSubmitting(true);
    try {
      const subId = scopeId ?? form.subaccountId;
      const subName = scopeId
        ? (getCurrentAccountName())
        : (subaccountOptions.find((s) => s.id === form.subaccountId)?.name ?? form.subaccountId);
      await submitOpsRequest({
        category: form.category as OpsRequestCategory,
        subaccountId: subId,
        subaccountName: subName,
        createdBy: 'Max Rodriguez',
        notes: form.notes || undefined,
        supplyType: form.supplyType as SupplyType || undefined,
        quantity: form.quantity ? parseInt(form.quantity, 10) : undefined,
        deliveryAddress: form.deliveryAddress || undefined,
        neededByDate: form.neededByDate || undefined,
        pickupSupportType: form.pickupSupportType as PickupSupportType || undefined,
        relatedBatchId: form.relatedBatchId || undefined,
        pickupAddress: form.pickupAddress || undefined,
        estimatedShipmentCount: form.estimatedShipmentCount ? parseInt(form.estimatedShipmentCount, 10) : undefined,
        estimatedWeight: form.estimatedWeight || undefined,
        preferredPickupWindow: form.preferredPickupWindow || undefined,
        assistanceType: form.assistanceType as OperationalAssistanceType || undefined,
      });
      setSubmitSuccess(true);
      refresh();
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormOpen(false);
        setForm(emptyForm());
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = () => {
    setForm(emptyForm());
    setSubmitSuccess(false);
    setFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Requests</h1>
          <p className="text-gray-600 mt-1">
            Submit and track supply, pickup, and operational assistance requests.
          </p>
        </div>
        <Button onClick={openForm}>
          <IconPlus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-600 mb-1">Open Requests</p>
            <p className="text-2xl font-bold text-gray-900">{openCount}</p>
            <p className="text-xs text-gray-400 mt-1">Submitted, in review, or scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <IconBox className="w-4 h-4 text-violet-500" />
              <p className="text-sm font-medium text-gray-600">Supply Requests</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{supplyCount}</p>
            <p className="text-xs text-gray-400 mt-1">Total this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <IconTruck className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-600">Pickup Support</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pickupCount}</p>
            <p className="text-xs text-gray-400 mt-1">Total this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            placeholder="Search by ID, type, or subaccount..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        {mainView && (
          <div className="w-full sm:w-[180px] flex-shrink-0">
            <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
              <option value="all">All subaccounts</option>
              {subaccountOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
        )}
        <div className="w-full sm:w-[180px] flex-shrink-0">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as OpsRequestCategory | 'all')}>
            <option value="all">All categories</option>
            <option value="supply">Supply Request</option>
            <option value="pickup_support">Pickup Support</option>
            <option value="operational_assistance">Operational Assistance</option>
          </Select>
        </div>
        <div className="w-full sm:w-[160px] flex-shrink-0">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="coordinating">Coordinating</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Request list */}
      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconAdjustments className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No operations requests</p>
            <p className="text-xs text-gray-400 mt-1">
              {q.length >= 2
                ? 'No requests match your search.'
                : 'No requests match the current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const cat    = CATEGORY_META[r.category];
            const st     = STATUS_META[r.status];
            const CatIcon = cat.icon;
            const detail = requestDetail(r);
            return (
              <Card key={r.id} className={r.status === 'completed' || r.status === 'cancelled' || r.status === 'declined' ? 'opacity-70' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cat.bgClass}`}>
                      <CatIcon className={`w-5 h-5 ${cat.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{requestTitle(r)}</span>
                        <Badge variant={cat.badge}>{cat.label}</Badge>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      {detail && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{detail}</p>
                      )}
                      {r.notes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.notes}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                        <span className="font-medium text-gray-500">{r.id}</span>
                        {mainView && <span>{r.subaccountName}</span>}
                        <span>Submitted {r.createdAt}</span>
                        {r.updatedAt !== r.createdAt && <span>· Updated {r.updatedAt}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Request dialog */}
      <Dialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setForm(emptyForm()); }}
        title="New Operations Request"
        size="md"
      >
        {submitSuccess ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <IconCircleCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-base font-semibold text-gray-900">Request submitted</p>
            <p className="text-sm text-gray-500">The Operations team will review and follow up shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Request category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['supply', 'pickup_support', 'operational_assistance'] as OpsRequestCategory[]).map((cat) => {
                  const m = CATEGORY_META[cat];
                  const CatIcon = m.icon;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setField('category', cat)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors cursor-pointer ${
                        form.category === cat
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CatIcon className="w-5 h-5" />
                      <span className="text-center leading-snug">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subaccount (Admin / main view only) */}
            {mainView && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subaccount <span className="text-red-500">*</span></label>
                <Select value={form.subaccountId} onChange={(e) => setField('subaccountId', e.target.value)}>
                  <option value="">Select subaccount…</option>
                  {subaccountOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {/* Supply fields */}
            {form.category === 'supply' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Supply type <span className="text-red-500">*</span></label>
                  <Select value={form.supplyType} onChange={(e) => setField('supplyType', e.target.value as SupplyType)}>
                    <option value="">Select supply type…</option>
                    <option value="pouches">Pouches</option>
                    <option value="boxes">Boxes</option>
                    <option value="other_packaging">Other Packaging Supplies</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number" min="1"
                      value={form.quantity}
                      onChange={(e) => setField('quantity', e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Needed by</label>
                    <input
                      type="date"
                      value={form.neededByDate}
                      onChange={(e) => setField('neededByDate', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.deliveryAddress}
                    onChange={(e) => setField('deliveryAddress', e.target.value)}
                    placeholder="Full delivery address"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Pickup support fields */}
            {form.category === 'pickup_support' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Request type <span className="text-red-500">*</span></label>
                  <Select value={form.pickupSupportType} onChange={(e) => setField('pickupSupportType', e.target.value as PickupSupportType)}>
                    <option value="">Select request type…</option>
                    <option value="immediate_pickup">Immediate Pickup</option>
                    <option value="bulk_pickup_assistance">Bulk Pickup Assistance</option>
                    <option value="four_wheel_pickup">4-Wheel Pickup (vs 2-Wheel First-Mile)</option>
                    <option value="reschedule_pickup">Reschedule Pickup</option>
                    <option value="escalate_missed_pickup">Escalate Missed Pickup</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.pickupAddress}
                    onChange={(e) => setField('pickupAddress', e.target.value)}
                    placeholder="Full pickup address"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Est. shipment count</label>
                    <input
                      type="number" min="1"
                      value={form.estimatedShipmentCount}
                      onChange={(e) => setField('estimatedShipmentCount', e.target.value)}
                      placeholder="e.g. 200"
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Est. weight / volume</label>
                    <input
                      type="text"
                      value={form.estimatedWeight}
                      onChange={(e) => setField('estimatedWeight', e.target.value)}
                      placeholder="e.g. ~300 kg"
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred pickup window</label>
                  <input
                    type="text"
                    value={form.preferredPickupWindow}
                    onChange={(e) => setField('preferredPickupWindow', e.target.value)}
                    placeholder="e.g. Jun 3, 8:00 AM – 12:00 PM"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Related batch ID (optional)</label>
                  <input
                    type="text"
                    value={form.relatedBatchId}
                    onChange={(e) => setField('relatedBatchId', e.target.value)}
                    placeholder="e.g. UPLOAD-2026-05-31-001"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Operational assistance fields */}
            {form.category === 'operational_assistance' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assistance type <span className="text-red-500">*</span></label>
                <Select value={form.assistanceType} onChange={(e) => setField('assistanceType', e.target.value as OperationalAssistanceType)}>
                  <option value="">Select assistance type…</option>
                  <option value="special_handling">Special Handling</option>
                  <option value="high_volume_dispatch">High-Volume Dispatch Coordination</option>
                  <option value="warehouse_coordination">Warehouse / Branch Coordination</option>
                </Select>
              </div>
            )}

            {/* Notes (all categories) */}
            {form.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder="Additional context for the Operations team…"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setFormOpen(false); setForm(emptyForm()); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formValid() || submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
