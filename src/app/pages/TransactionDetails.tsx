import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IconArrowLeft, IconStar, IconFileText, IconShare, IconMessage, IconPackage, IconPackageOff, IconUpload, IconArrowRight, IconReceiptRefund, IconX, IconCircleCheck } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import { getTransactionByTracking, statusConfig } from '../data/transactions';
import {
  getClaimByTracking, submitClaim, requestCancellation, isCancelled,
  isClaimEligible, isCancelEligible, CLAIM_STATUS_META, CLAIM_REASONS, type Claim,
} from '../data/claims';

export function TransactionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rating, setRating] = useState(0);

  const transaction = getTransactionByTracking(id);

  // Claims & cancellation (frontend/mock) — local view state.
  const [claim, setClaim] = useState<Claim | undefined>(() => (id ? getClaimByTracking(id) : undefined));
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({ reason: '', details: '' });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(() => (id ? isCancelled(id) : false));

  if (!transaction) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/transactions')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Button>
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <IconPackageOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Transaction not found</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              We couldn&apos;t find a transaction with tracking number{' '}
              <span className="font-medium text-gray-700">{id}</span>. It may have been removed or the link is incorrect.
            </p>
            <Button className="mt-6" onClick={() => navigate('/dashboard/transactions')}>
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[transaction.status];
  const totalFees = Object.values(transaction.fees).reduce((sum, fee) => sum + fee, 0);
  const itemsTotal = transaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const claimEligible = isClaimEligible(transaction.status) && !claim;
  const cancelEligible = isCancelEligible(transaction.status) && !cancelled;

  const handleSubmitClaim = () => {
    if (!claimForm.reason) return;
    const created = submitClaim({
      trackingNumber: transaction.trackingNumber,
      reason: claimForm.reason,
      details: claimForm.details,
      amount: transaction.payment.codAmount || undefined,
      accountName: transaction.subaccount,
    });
    setClaim(created);
    setShowClaimForm(false);
    setClaimForm({ reason: '', details: '' });
  };

  const handleCancel = () => {
    requestCancellation(transaction.trackingNumber, transaction.subaccount);
    setCancelled(true);
    setShowCancelConfirm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/transactions')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600">
              <span className="font-medium">Tracking Number:</span> {transaction.trackingNumber}
            </p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Created: {transaction.createdAt}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Pick-up and Delivery Dates</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pick-up Date</p>
                  <p className="text-gray-900 mt-1">{transaction.pickupDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Date</p>
                  <p className="text-gray-900 mt-1">{transaction.deliveryDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sender and Recipient Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Sender</h4>
                  <div><p className="text-sm font-medium text-gray-600">Full Name</p><p className="text-gray-900">{transaction.sender.name}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Contact Number</p><p className="text-gray-900">{transaction.sender.contactNumber}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Address</p><p className="text-gray-900">{transaction.sender.address}</p></div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Recipient</h4>
                  <div><p className="text-sm font-medium text-gray-600">Full Name</p><p className="text-gray-900">{transaction.recipient.name}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Contact Number</p><p className="text-gray-900">{transaction.recipient.contactNumber}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Address</p><p className="text-gray-900">{transaction.recipient.address}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.attributes && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500">{key}: {value}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₱{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">₱{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Items Total</span>
                  <span className="font-semibold text-gray-900">₱{itemsTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900">Packaging and Dimensions</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-sm font-medium text-gray-600">Package Size</p><p className="text-gray-900">{transaction.packaging.size}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Dimensions</p><p className="text-gray-900">{transaction.packaging.dimensions}</p></div>
                  <div><p className="text-sm font-medium text-gray-600">Weight</p><p className="text-gray-900">{transaction.packaging.weight}</p></div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Ordered From</h4>
                <p className="text-gray-900">{transaction.store.name}</p>
                <a href={`https://${transaction.store.url}`} className="text-sm text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                  {transaction.store.url}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transaction Fees</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-gray-700">Service Fee</span><span className="text-gray-900">₱{transaction.fees.serviceFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-700">Shipping Fee</span><span className="text-gray-900">₱{transaction.fees.shippingFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-700">Protection Fee</span><span className="text-gray-900">₱{transaction.fees.protectionFee.toLocaleString()}</span></div>
                {transaction.fees.discount !== 0 && (
                  <div className="flex justify-between items-center text-green-600"><span>Discount</span><span>₱{transaction.fees.discount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between items-center"><span className="text-gray-700">Payment Processing Fee</span><span className="text-gray-900">₱{transaction.fees.processingFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold text-gray-900"><span>Total Fees</span><span>₱{totalFees.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-gray-700">Method</span><span className="text-gray-900">{transaction.payment.method}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-700">Paid By</span><span className="text-gray-900">{transaction.payment.paidBy}</span></div>
                {transaction.payment.codAmount && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-semibold"><span className="text-gray-900">COD Amount</span><span className="text-gray-900">₱{transaction.payment.codAmount.toLocaleString()}</span></div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Claims & Cancellation */}
          {(claim || cancelled || claimEligible || cancelEligible) && (
            <Card>
              <CardHeader><CardTitle>Claims &amp; Cancellation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {cancelled && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
                    <IconX className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">This booking has been cancelled.</p>
                  </div>
                )}

                {claim && (
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <IconReceiptRefund className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Claim {claim.id}</p>
                        <p className="text-xs text-gray-500">{claim.reason}</p>
                      </div>
                    </div>
                    <Badge variant={CLAIM_STATUS_META[claim.status].variant}>{CLAIM_STATUS_META[claim.status].label}</Badge>
                  </div>
                )}

                {claimEligible && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">This delivery is undelivered. You can file a refund claim linked to this tracking number.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowClaimForm(true)}>
                      <IconReceiptRefund className="w-4 h-4 mr-1.5" />
                      File a Claim
                    </Button>
                  </div>
                )}

                {cancelEligible && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">This booking is newly created and can still be cancelled.</p>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setShowCancelConfirm(true)}>
                      <IconX className="w-4 h-4 mr-1.5" />
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {transaction.batch && (
            <Card>
              <CardHeader><CardTitle>Upload Source</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <IconUpload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">Uploaded via Bulk Upload</p>
                      <Badge variant="info">Batch</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div><p className="text-sm font-medium text-gray-600">Batch File</p><p className="text-gray-900 text-sm">{transaction.batch.fileName}</p></div>
                      <div><p className="text-sm font-medium text-gray-600">Batch ID</p><p className="text-gray-900 text-sm">{transaction.batch.batchId}</p></div>
                      {transaction.batch.accountName && (
                        <div><p className="text-sm font-medium text-gray-600">Account</p><p className="text-gray-900 text-sm">{transaction.batch.accountName}</p></div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate(`/dashboard/bulk-uploader/summary/${transaction.batch!.batchId}`)}
                    >
                      View batch summary
                      <IconArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <IconMessage className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-blue-800 mb-3">Have questions or issues with this delivery? Our support team is ready to assist you.</p>
                  <Button size="sm">
                    <IconFileText className="w-4 h-4 mr-2" />
                    Send a Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => navigate('/dashboard/bulk-uploader')}>
              <IconPackage className="w-4 h-4 mr-2" />
              Upload New Delivery
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-900 mb-2">Rate Your Delivery Experience</h3>
              <p className="text-sm text-green-800 mb-4">Your feedback helps us improve our service and recognize excellent delivery riders.</p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-colors">
                    <IconStar className={`w-8 h-8 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full bg-white">Submit Rating</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tracking Timeline</CardTitle>
                <Button variant="ghost" size="sm">
                  <IconShare className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.timeline.map((event, index) => (
                  <div key={index} className="relative">
                    {index !== transaction.timeline.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        {event.note && <p className="text-sm text-gray-500 mt-1">{event.note}</p>}
                        {event.hasProof && (
                          <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                            View proof of {event.status.toLowerCase()}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File a claim */}
      <Dialog open={showClaimForm} onClose={() => setShowClaimForm(false)} size="md" title="File a Claim">
        <p className="text-sm text-gray-500 mb-4">
          Claim linked to <span className="font-medium text-gray-700">{transaction.trackingNumber}</span>. Our claims team will review your request.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
            <Select value={claimForm.reason} onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}>
              <option value="">Select a reason</option>
              {CLAIM_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Details</label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe the issue (optional)..."
              value={claimForm.details}
              onChange={(e) => setClaimForm({ ...claimForm, details: e.target.value })}
            />
          </div>
          {transaction.payment.codAmount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <IconCircleCheck className="w-4 h-4 text-gray-400" />
              Requested refund amount: <span className="font-medium text-gray-900">₱{transaction.payment.codAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2.5 justify-end pt-5">
          <Button variant="outline" size="sm" onClick={() => setShowClaimForm(false)}>Cancel</Button>
          <Button size="sm" disabled={!claimForm.reason} onClick={handleSubmitClaim}>Submit Claim</Button>
        </div>
      </Dialog>

      {/* Cancel booking confirmation */}
      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel this booking?"
        description={
          <>
            Booking <span className="font-medium text-gray-700">{transaction.trackingNumber}</span> will be cancelled. This can only be done for newly-booked transactions.
          </>
        }
        confirmLabel="Cancel Booking"
        variant="destructive"
        confirmIcon={<IconX className="w-3.5 h-3.5 mr-1.5" />}
      />
    </div>
  );
}
