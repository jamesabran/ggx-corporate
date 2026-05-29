import { useState } from 'react';
import { IconMapPin, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconSearch, IconStar } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';

export interface Address {
  id: string;
  label: string;
  customLabel?: string;
  name: string;
  mobileNumber: string;
  province: string;
  city: string;
  barangay: string;
  otherDetails: string;
  isPreferred: boolean;
}

const PROVINCES = ['Metro Manila', 'Cebu', 'Davao', 'Laguna', 'Cavite', 'Bulacan', 'Rizal', 'Pampanga'];

const CITIES: { [key: string]: string[] } = {
  'Metro Manila': ['Makati', 'Quezon City', 'Manila', 'Taguig', 'Pasig', 'Mandaluyong', 'Pasay'],
  Cebu: ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Toledo'],
  Davao: ['Davao City', 'Tagum', 'Panabo', 'Samal', 'Digos'],
  Laguna: ['Calamba', 'Santa Rosa', 'Biñan', 'San Pedro', 'Cabuyao'],
  Cavite: ['Bacoor', 'Imus', 'Dasmariñas', 'Cavite City', 'Tagaytay'],
};

const BARANGAYS: { [key: string]: string[] } = {
  Makati: ['Poblacion', 'Bel-Air', 'San Lorenzo', 'Urdaneta', 'Salcedo'],
  'Quezon City': ['Barangay Commonwealth', 'Fairview', 'Novaliches', 'Cubao', 'Diliman'],
  Manila: ['Ermita', 'Malate', 'Intramuros', 'Binondo', 'Sampaloc'],
  Taguig: ['Fort Bonifacio', 'Western Bicutan', 'Ususan', 'Bagumbayan'],
};

const labelColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  office: 'info',
  home: 'success',
  warehouse: 'warning',
  custom: 'default',
};

const emptyForm: Partial<Address> = {
  label: 'office',
  customLabel: '',
  name: '',
  mobileNumber: '',
  province: '',
  city: '',
  barangay: '',
  otherDetails: '',
  isPreferred: false,
};

interface AddressBookProps {
  mode?: 'full' | 'select';
  onSelectAddress?: (address: Address) => void;
  onClose?: () => void;
}

export function AddressBook({ mode = 'full', onSelectAddress, onClose }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'office', name: 'Acme Corporation', mobileNumber: '+63 917 123 4567', province: 'Metro Manila', city: 'Makati', barangay: 'Poblacion', otherDetails: '5th Floor, ABC Building, Ayala Avenue', isPreferred: true },
    { id: '2', label: 'home', name: 'Max Rodriguez', mobileNumber: '+63 917 987 6543', province: 'Metro Manila', city: 'Quezon City', barangay: 'Diliman', otherDetails: 'Unit 203, XYZ Residences', isPreferred: false },
    { id: '3', label: 'warehouse', name: 'Acme Warehouse - North', mobileNumber: '+63 918 234 5678', province: 'Bulacan', city: '', barangay: '', otherDetails: 'Km. 34, McArthur Highway, Calumpit', isPreferred: false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAddresses(addresses.map((addr) => (addr.id === editingId ? ({ ...formData, id: editingId } as Address) : addr)));
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now().toString() } as Address]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetPreferred = (id: string) => {
    setAddresses(addresses.map((addr) => ({ ...addr, isPreferred: addr.id === id })));
  };

  const filtered = addresses.filter((addr) => {
    const matchesSearch =
      addr.name.toLowerCase().includes(search.toLowerCase()) ||
      addr.city.toLowerCase().includes(search.toLowerCase()) ||
      addr.province.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterLabel === 'all' || addr.label === filterLabel;
    return matchesSearch && matchesFilter;
  });

  const getDisplayLabel = (addr: Address) => (addr.label === 'custom' ? addr.customLabel || 'Custom' : addr.label);

  return (
    <div className="space-y-5">
      {mode === 'select' && onClose && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Select Pickup Address</h2>
          <Button variant="ghost" onClick={onClose}>
            <IconX className="w-5 h-5" />
          </Button>
        </div>
      )}

      {!showForm ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={filterLabel} onChange={(e) => setFilterLabel(e.target.value)} className="h-9 text-sm">
                <option value="all">All Types</option>
                <option value="office">Office</option>
                <option value="home">Home</option>
                <option value="warehouse">Warehouse</option>
                <option value="custom">Custom</option>
              </Select>
              <Button onClick={() => { setShowForm(true); setFormData(emptyForm); setEditingId(null); }} className="cursor-pointer whitespace-nowrap">
                <IconPlus className="w-4 h-4 mr-1.5" />
                Add Address
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <IconMapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No addresses found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((addr) => (
                <Card
                  key={addr.id}
                  className={`relative flex flex-col transition-shadow hover:shadow-md ${addr.isPreferred ? 'border-blue-300 ring-1 ring-blue-200' : ''} ${mode === 'select' ? 'cursor-pointer hover:border-blue-400' : ''}`}
                  onClick={mode === 'select' ? () => onSelectAddress?.(addr) : undefined}
                >
                  {addr.isPreferred && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <IconStar className="w-2.5 h-2.5 fill-current" />
                        Default
                      </span>
                    </div>
                  )}
                  <CardContent className="p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <Badge variant={labelColors[addr.label] || 'default'} className="text-[10px] px-2 py-0.5 mb-2 capitalize">
                        {getDisplayLabel(addr)}
                      </Badge>
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{addr.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{addr.mobileNumber}</p>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-gray-600">
                      <IconMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        {[addr.barangay, addr.city, addr.province].filter(Boolean).join(', ')}
                        {addr.otherDetails && <span className="block text-gray-400">{addr.otherDetails}</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-auto pt-2 border-t border-gray-100">
                      {mode === 'select' ? (
                        <Button size="sm" className="flex-1 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectAddress?.(addr); }}>
                          <IconCheck className="w-3.5 h-3.5 mr-1" />
                          Select
                        </Button>
                      ) : (
                        <>
                          {!addr.isPreferred && (
                            <button onClick={() => handleSetPreferred(addr.id)} title="Set as default" className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors cursor-pointer">
                              <IconStar className="w-3.5 h-3.5" />
                              Set Default
                            </button>
                          )}
                          <div className="ml-auto flex items-center gap-1">
                            <button onClick={() => handleEdit(addr)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" title="Edit">
                              <IconEdit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Label *</label>
                  <Select required value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })}>
                    <option value="office">Office</option>
                    <option value="home">Home</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="custom">Custom</option>
                  </Select>
                </div>
                {formData.label === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Label *</label>
                    <Input required placeholder="e.g., Store, Branch..." value={formData.customLabel || ''} onChange={(e) => setFormData({ ...formData, customLabel: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <Input required placeholder="Recipient or company name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                  <Input required type="tel" placeholder="+63 917 123 4567" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Province *</label>
                  <Select required value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, city: '', barangay: '' })}>
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City/Municipality *</label>
                  <Select required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value, barangay: '' })} disabled={!formData.province}>
                    <option value="">Select city</option>
                    {formData.province && CITIES[formData.province]?.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay *</label>
                  <Select required value={formData.barangay} onChange={(e) => setFormData({ ...formData, barangay: e.target.value })} disabled={!formData.city}>
                    <option value="">Select barangay</option>
                    {formData.city && BARANGAYS[formData.city]?.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Location Details</label>
                <textarea
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Landmark, floor/unit no., building name, etc."
                  value={formData.otherDetails}
                  onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" checked={formData.isPreferred} onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })} />
                <span className="text-sm text-gray-700">Set as default pickup address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="cursor-pointer">{editingId ? 'Update Address' : 'Add Address'}</Button>
                <Button type="button" variant="outline" className="cursor-pointer" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
