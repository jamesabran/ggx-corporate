import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Login } from './pages/Login';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { Transactions } from './pages/Transactions';
import { TransactionDetails } from './pages/TransactionDetails';
import { BulkUploader } from './pages/BulkUploader';
import { BulkUploadSummary } from './pages/BulkUploadSummary';
// Code-split the recharts-heavy analytics page into its own chunk (keeps the
// main bundle smaller; resolves the long-standing bundle-size warning).
const DataAnalytics = lazy(() => import('./pages/DataAnalytics').then((m) => ({ default: m.DataAnalytics })));
import { Earnings } from './pages/Earnings';
import { BillingStatement } from './pages/BillingStatement';
import { PaymentSettings } from './pages/PaymentSettings';
import { AddressBookPage } from './pages/AddressBookPage';
import { APIAccess } from './pages/APIAccess';
import { SupportTickets } from './pages/SupportTickets';
import { SupportTicketDetail } from './pages/SupportTicketDetail';
import { SubAccounts } from './pages/SubAccounts';
import { Settings } from './pages/Settings';
import { EnableSubAccountsIntro } from './pages/EnableSubAccounts';
import { EnableSubAccountsSetup } from './pages/EnableSubAccountsSetup';
import { RequestSubAccount } from './pages/RequestSubAccount';
import { UsersPermissions } from './pages/UsersPermissions';
import { SubAccountSettings } from './pages/SubAccountSettings';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { ServiceAdvisories } from './pages/ServiceAdvisories';
import { Claims } from './pages/Claims';
import { SlaAlerts } from './pages/SlaAlerts';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      // Shared (Admin + Manager)
      { index: true, Component: DashboardWrapper },
      { path: 'transactions', Component: Transactions },
      { path: 'transactions/:id', Component: TransactionDetails },
      { path: 'claims', Component: Claims },
      { path: 'sla-alerts', Component: SlaAlerts },
      { path: 'bulk-uploader', Component: BulkUploader },
      { path: 'bulk-uploader/summary/:id', Component: BulkUploadSummary },
      { path: 'bulk-upload-summary', Component: BulkUploadSummary },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading analytics…</div>}>
            <DataAnalytics />
          </Suspense>
        ),
      },
      { path: 'address-book', Component: AddressBookPage },
      { path: 'api-access', Component: APIAccess },
      { path: 'support-tickets', Component: SupportTickets },
      { path: 'support-tickets/:id', Component: SupportTicketDetail },
      { path: 'complaints', element: <Navigate to="/dashboard/support-tickets" replace /> },
      { path: 'notifications', Component: Notifications },
      { path: 'advisories', Component: ServiceAdvisories },
      { path: 'settings', Component: Settings },

      // Shared: subaccount settings (Managers can view their own subaccount's settings)
      { path: 'subaccounts/:id/settings', Component: SubAccountSettings },

      // Admin-only (parent-level finance, reports, subaccounts, users)
      { path: 'earnings',          element: <AdminRoute><Earnings /></AdminRoute> },
      { path: 'billing',           element: <AdminRoute><BillingStatement /></AdminRoute> },
      { path: 'payment-settings',  element: <AdminRoute><PaymentSettings /></AdminRoute> },
      { path: 'reports',           element: <AdminRoute><Reports /></AdminRoute> },
      { path: 'subaccounts',       element: <AdminRoute><SubAccounts /></AdminRoute> },
      { path: 'subaccounts/enable',       element: <AdminRoute><EnableSubAccountsIntro /></AdminRoute> },
      { path: 'subaccounts/enable/setup', element: <AdminRoute><EnableSubAccountsSetup /></AdminRoute> },
      { path: 'subaccounts/request',      element: <AdminRoute><RequestSubAccount /></AdminRoute> },
      { path: 'users-permissions', element: <AdminRoute><UsersPermissions /></AdminRoute> },
    ],
  },
]);
