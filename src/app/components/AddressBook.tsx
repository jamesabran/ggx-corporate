import { useEffect, useState } from 'react';
import { IconMapPin, IconPlus, IconEdit, IconTrash, IconCheck, IconX, IconSearch, IconStar, IconAlertCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ConfirmDialog } from './ui/Dialog';
import { AddressDisplayCard } from './AddressDisplayCard';
import { getProvinces, getCities, getDistricts, type LocationOption } from '../lib/locationApi';

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
  // Pickup-supported location IDs from the GGX locations API. Present on
  // addresses created/edited through the cascading selects; legacy seed
  // entries may omit them and must be re-selected before they can be saved.
  provinceId?: number;
  cityId?: number;
  districtId?: number;
  postalCode?: string;
}

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
  provinceId: undefined,
  cityId: undefined,
  districtId: undefined,
  postalCode: '',
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Pickup-location cascade state
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load pickup-supported provinces when the form is first opened.
  useEffect(() => {
    if (!showForm || provinces.length > 0) return;
    let cancelled = false;
    setLoadingProvinces(true);
    setLocationError(null);
    getProvinces()
      .then((data) => { if (!cancelled) setProvinces(data); })
      .catch(() => { if (!cancelled) setLocationError('Could not load pickup locations. Please try again.'); })
      .finally(() => { if (!cancelled) setLoadingProvinces(false); });
    return () => { cancelled = true; };
  }, [showForm, provinces.length]);

  const loadCities = (provinceId: number) => {
    setLoadingCities(true);
    setLocationError(null);
    getCities(provinceId)
      .then(setCities)
      .catch(() => setLocationError('Could not load cities for the selected province.'))
      .finally(() => setLoadingCities(false));
  };

  const loadDistricts = (cityId: number) => {
    setLoadingDistricts(true);
    setLocationError(null);
    getDistricts(cityId)
      .then(setDistricts)
      .catch(() => setLocationError('Could not load barangays for the selected city.'))
      .finally(() => setLoadingDistricts(false));
  };

  const handleProvinceChange = (value: string) => {
    const provinceId = value ? Number(value) : undefined;
    const selected = provinces.find((p) => p.id === provinceId);
    setCities([]);
    setDistricts([]);
    setFormData({
      ...formData,
      provinceId,
      province: selected?.name ?? '',
      cityId: undefined,
      city: '',
      districtId: undefined,
      barangay: '',
      postalCode: '',
    });
    if (provinceId) loadCities(provinceId);
  };

  const handleCityChange = (value: string) => {
    const cityId = value ? Number(value) : undefined;
    const selected = cities.find((c) => c.id === cityId);
    setDistricts([]);
    setFormData({
      ...formData,
      cityId,
      city: selected?.name ?? '',
      districtId: undefined,
      barangay: '',
      postalCode: '',
    });
    if (cityId) loadDistricts(cityId);
  };

  const handleDistrictChange = (value: string) => {
    const districtId = value ? Number(value) : undefined;
    const selected = districts.find((d) => d.id === districtId);
    setFormData({
      ...formData,
      districtId,
      barangay: selected?.name ?? '',
      postalCode: selected?.postalCode ?? '',
    });
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setCities([]);
    setDistricts([]);
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce pickup-supported location chain: all three IDs must come from
    // the API-backed selects, otherwise the address is not valid for pickup.
    if (!formData.provinceId || !formData.cityId || !formData.districtId) {
      setFormError('Select a pickup-supported province, city, and barangay before saving.');
      return;
    }
    setFormError(null);

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
    setFormError(null);
    // Rehydrate child select options when the address already has location IDs.
    setCities([]);
    setDistricts([]);
    if (address.provinceId) loadCities(address.provinceId);
    if (address.cityId) loadDistricts(address.cityId);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id); // shows ConfirmDialog
  };

  const confirmDelete = () => {
    if (deleteTarget) setAddresses(addresses.filter((addr) => addr.id !== deleteTarget));
    setDeleteTarget(null);
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
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={filterLabel} onChange={(e) => setFilterLabel(e.target.value)} className="h-9 text-sm">
                <option value="all">All Types</option>
                <option value="office">Office</option>
                <option value="home">Home</option>
                <option value="warehouse">Warehouse</option>
                <option value="custom">Custom</option>
              </Select>
              <Button onClick={openAddForm} className="cursor-pointer whitespace-nowrap">
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
                  {/* Top-right slot: "Default" badge when preferred, "Set as default"
                      button otherwise. Both occupy the same position so the user
                      can see the result of their action without scanning the card. */}
                  <div className="absolute top-3 right-3">
                    {addr.isPreferred ? (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <IconStar className="w-2.5 h-2.5 fill-current" />
                        Default
                      </span>
                    ) : mode !== 'select' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetPreferred(addr.id); }}
                        title="Set as default pickup address"
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-600 px-2 py-0.5 rounded-full border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <IconStar className="w-2.5 h-2.5" />
                        Set default
                      </button>
                    ) : null}
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col gap-3">
                    <AddressDisplayCard address={addr} />

                    <div className="flex items-center gap-1 mt-auto pt-2 border-t border-gray-100">
                      {mode === 'select' ? (
                        <Button size="sm" className="flex-1 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectAddress?.(addr); }}>
                          <IconCheck className="w-3.5 h-3.5 mr-1" />
                          Select
                        </Button>
                      ) : (
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => handleEdit(addr)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" title="Edit">
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

              {/* Pickup-supported location cascade */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <IconMapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-snug">
                    Only GGX pickup-supported locations can be saved for pickup bookings.
                    Choose your province, city/municipality, then barangay in order.
                  </p>
                </div>

                {locationError && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {locationError}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Province *</label>
                    <Select
                      value={formData.provinceId ?? ''}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      disabled={loadingProvinces}
                    >
                      <option value="">{loadingProvinces ? 'Loading provinces…' : 'Select province'}</option>
                      {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City/Municipality *</label>
                    <Select
                      value={formData.cityId ?? ''}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!formData.provinceId || loadingCities}
                    >
                      <option value="">
                        {!formData.provinceId ? 'Select province first' : loadingCities ? 'Loading cities…' : cities.length === 0 ? 'No pickup cities' : 'Select city'}
                      </option>
                      {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay *</label>
                    <Select
                      value={formData.districtId ?? ''}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!formData.cityId || loadingDistricts}
                    >
                      <option value="">
                        {!formData.cityId ? 'Select city first' : loadingDistricts ? 'Loading barangays…' : districts.length === 0 ? 'No pickup barangays' : 'Select barangay'}
                      </option>
                      {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                  </div>
                </div>

                {formData.postalCode && (
                  <p className="text-xs text-gray-500">Postal code: <span className="font-medium text-gray-700">{formData.postalCode}</span></p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Location Details</label>
                <textarea
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Street, building, floor/unit no., landmark, etc."
                  value={formData.otherDetails}
                  onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" checked={formData.isPreferred} onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })} />
                <span className="text-sm text-gray-700">Set as default pickup address</span>
              </label>

              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="cursor-pointer">{editingId ? 'Update Address' : 'Add Address'}</Button>
                <Button type="button" variant="outline" className="cursor-pointer" onClick={() => { setShowForm(false); setEditingId(null); setFormError(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete address?"
        description="This address will be permanently removed from your address book. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        confirmIcon={<IconTrash className="w-3.5 h-3.5 mr-1.5" />}
      />
    </div>
  );
}
