import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IconTrendingUp, IconPackage, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

const monthlyVolumeData = [
  { month: 'Jan', deliveries: 2501 },
  { month: 'Feb', deliveries: 2312 },
  { month: 'Mar', deliveries: 2678 },
  { month: 'Apr', deliveries: 2456 },
  { month: 'May', deliveries: 2847 },
];

const statusBreakdownData = [
  { name: 'Delivered', value: 2654, color: '#10b981' },
  { name: 'In Transit', value: 142, color: '#3b82f6' },
  { name: 'Pending', value: 28, color: '#f59e0b' },
  { name: 'Failed', value: 23, color: '#ef4444' },
];

const performanceData = [
  { month: 'Jan', onTime: 97.8, delayed: 2.2 },
  { month: 'Feb', onTime: 98.1, delayed: 1.9 },
  { month: 'Mar', onTime: 97.5, delayed: 2.5 },
  { month: 'Apr', onTime: 98.6, delayed: 1.4 },
  { month: 'May', onTime: 98.4, delayed: 1.6 },
];

const stats = [
  { title: 'Total Deliveries', value: '12,794', change: '+14.2%', icon: IconPackage, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { title: 'Success Rate', value: '98.4%', change: '+0.3%', icon: IconCircleCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
  { title: 'Avg. Delivery Time', value: '2.3 days', change: '-0.2 days', icon: IconTrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { title: 'Failed Deliveries', value: '23', change: '-5 from last month', icon: IconCircleX, color: 'text-red-600', bgColor: 'bg-red-100' },
];

export function DataAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and delivery metrics</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="30">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All Brands</option>
            <option value="brand1">Brand 1</option>
            <option value="brand2">Brand 2</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-2">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Delivery Volume</CardTitle>
            <CardDescription>Total deliveries per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="deliveries" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Status Breakdown</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>On-Time Performance</CardTitle>
          <CardDescription>Percentage of deliveries completed on time vs delayed</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} name="On Time %" />
              <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} name="Delayed %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Destinations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { city: 'Makati City, Metro Manila', count: 1842 },
                { city: 'Quezon City, Metro Manila', count: 1567 },
                { city: 'Cebu City, Cebu', count: 1234 },
                { city: 'Davao City, Davao', count: 987 },
                { city: 'Pasig City, Metro Manila', count: 756 },
              ].map((dest) => (
                <div key={dest.city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{dest.city}</span>
                  <span className="text-sm font-medium text-gray-900">{dest.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delivery Types</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'Express', count: 7645, percent: 59.7 },
                { type: 'Standard', count: 4892, percent: 38.2 },
                { type: 'Overnight', count: 257, percent: 2.1 },
              ].map((type) => (
                <div key={type.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{type.type}</span>
                    <span className="text-sm font-medium text-gray-900">{type.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${type.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Peak Hours</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { hour: '9 AM - 12 PM', count: 4234 },
                { hour: '12 PM - 3 PM', count: 3891 },
                { hour: '3 PM - 6 PM', count: 2456 },
                { hour: '6 PM - 9 PM', count: 1567 },
                { hour: 'Other', count: 646 },
              ].map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{hour.hour}</span>
                  <span className="text-sm font-medium text-gray-900">{hour.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
