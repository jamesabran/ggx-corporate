import { AddressBook } from '../components/AddressBook';

export function AddressBookPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
        <p className="text-gray-600 mt-1">
          Manage pickup addresses for your bookings. Only GGX pickup-supported locations can be saved.
        </p>
      </div>
      <AddressBook mode="full" />
    </div>
  );
}
