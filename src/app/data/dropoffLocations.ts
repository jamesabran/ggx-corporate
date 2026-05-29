// Drop-off locations (mock).
//
// The official source (help-center.gogoxpress.com "Where are your Drop-Off
// Locations") returned HTTP 403 to automated fetches, so this is a small local
// mock matching the expected structure (name, address, contact, hours).
// Replace with live data when an accessible source/endpoint is available.
// "Nearby" is represented as a static list — no geolocation or distance sorting.

export interface DropoffLocation {
  id: string;
  name: string;
  address: string;
  contact: string;
  hours: string;
}

export const DROPOFF_LOCATIONS: DropoffLocation[] = [
  { id: 'd1', name: 'GoGo Xpress Hub — Makati', address: 'G/F ABC Building, Ayala Avenue, Poblacion, Makati City, Metro Manila', contact: '+63 2 8888 1000', hours: 'Mon–Sat, 9:00 AM – 6:00 PM' },
  { id: 'd2', name: 'GoGo Xpress Hub — Quezon City', address: '12 Commonwealth Ave, Diliman, Quezon City, Metro Manila', contact: '+63 2 8888 1001', hours: 'Mon–Sat, 9:00 AM – 6:00 PM' },
  { id: 'd3', name: 'GoGo Xpress Partner — Pasig', address: 'Unit 4, Ortigas Center, San Antonio, Pasig City, Metro Manila', contact: '+63 2 8888 1002', hours: 'Mon–Fri, 9:00 AM – 5:00 PM' },
  { id: 'd4', name: 'GoGo Xpress Partner — Taguig (BGC)', address: '7th Ave cor 32nd St, Fort Bonifacio, Taguig City, Metro Manila', contact: '+63 2 8888 1003', hours: 'Mon–Sat, 10:00 AM – 7:00 PM' },
  { id: 'd5', name: 'GoGo Xpress Hub — Cebu', address: 'IT Park, Apas, Cebu City, Cebu', contact: '+63 32 888 2000', hours: 'Mon–Sat, 9:00 AM – 6:00 PM' },
  { id: 'd6', name: 'GoGo Xpress Hub — Davao', address: 'Km 5, JP Laurel Ave, Davao City, Davao del Sur', contact: '+63 82 888 3000', hours: 'Mon–Sat, 9:00 AM – 6:00 PM' },
];
