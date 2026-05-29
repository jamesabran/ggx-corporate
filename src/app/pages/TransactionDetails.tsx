import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconArrowLeft, IconStar, IconFileText, IconShare, IconMessage, IconPackage } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function TransactionDetails() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  const transaction = {
    trackingNumber: 'GGX-2024-89240',
    createdAt: '2026-05-18 09:30 AM',
    pickupDate: '2026-05-18',
    deliveryDate: '2026-05-19',
    sender: {
      name: 'Acme Corporation',
      contactNumber: '+63 917 123 4567',
      address: '5th Floor, ABC Building, Ayala Avenue, Poblacion, Makati City, Metro Manila',
    },
    recipient: {
      name: 'Juan Dela Cruz',
      contactNumber: '+63 917 987 6543',
      address: 'Unit 203, XYZ Residences, Katipunan Avenue, Diliman, Quezon City, Metro Manila',
    },
    items: [
      { name: 'Wireless Mouse', quantity: 2, description: 'Logitech MX Master 3', attributes: { color: 'Black' }, price: 4500 },
      { name: 'Mechanical Keyboard', quantity: 1, description: 'Keychron K2', attributes: { color: 'White', variant: 'RGB' }, price: 5500 },
    ],
    packaging: { size: 'MEDIUM', dimensions: '40cm x 30cm x 20cm', weight: '3.2 kg' },
    store: { name: 'TechGear Philippines', url: 'techgear.ph' },
    fees: { serviceFee: 50, shippingFee: 120, protectionFee: 145, discount: -20, processingFee: 30 },
    payment: { method: 'Cash on Delivery (COD)', paidBy: 'Recipient', codAmount: 14500 },
    timeline: [
      { status: 'Delivered', date: '2026-05-19 03:45 PM', note: 'Package delivered successfully', hasProof: true },
      { status: 'Out for Delivery', date: '2026-05-19 09:15 AM', note: 'Delivery rider on the way' },
      { status: 'In Transit', date: '2026-05-19 06:00 AM', note: 'Package in transit to destination hub' },
      { status: 'Picked Up', date: '2026-05-18 02:30 PM', note: 'Package picked up from sender', hasProof: true },
      { status: 'Pick-up Rider Found', date: '2026-05-18 01:15 PM', note: 'Rider assigned for pickup' },
      { status: 'Booking Confirmed', date: '2026-05-18 10:00 AM', note: 'Booking confirmed and processing' },
      { status: 'Order Created', date: '2026-05-18 09:30 AM', note: 'Order placed and awaiting confirmation' },
    ],
  };

  const totalFees = Object.values(transaction.fees).reduce((sum, fee) => sum + fee, 0);
  const itemsTotal = transaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
            <Badge variant="success">Delivered</Badge>
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
    </div>
  );
}
