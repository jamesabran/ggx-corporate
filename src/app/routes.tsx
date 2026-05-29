import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Login } from './pages/Login';
import { DashboardWrapper } from './pages/DashboardWrapper';
import { Transactions } from './pages/Transactions';
import { TransactionDetails } from './pages/TransactionDetails';
import { BulkUploader } from './pages/BulkUploader';
import { BulkUploadSummary } from './pages/BulkUploadSummary';
import { DataAnalytics } from './pages/DataAnalytics';
import { Earnings } from './pages/Earnings';
import { BillingStatement } from './pages/BillingStatement';
import { PaymentSettings } from './pages/PaymentSettings';
import { AddressBookPage } from './pages/AddressBookPage';
import { APIAccess } from './pages/APIAccess';
import { SupportTickets } from './pages/SupportTickets';
import { SubAccounts } from './pages/SubAccounts';
import { Settings } from './pages/Settings';
import { EnableSubAccountsIntro } from './pages/EnableSubAccounts';
import { EnableSubAccountsSetup } from './pages/EnableSubAccountsSetup';
import { RequestSubAccount } from './pages/RequestSubAccount';
import { UsersPermissions } from './pages/UsersPermissions';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/dashboard',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardWrapper },
      { path: 'transactions', Component: Transactions },
      { path: 'transactions/:id', Component: TransactionDetails },
      { path: 'bulk-uploader', Component: BulkUploader },
      { path: 'bulk-uploader/summary/:id', Component: BulkUploadSummary },
      { path: 'bulk-upload-summary', Component: BulkUploadSummary },
      { path: 'analytics', Component: DataAnalytics },
      { path: 'earnings', Component: Earnings },
      { path: 'billing', Component: BillingStatement },
      { path: 'payment-settings', Component: PaymentSettings },
      { path: 'address-book', Component: AddressBookPage },
      { path: 'api-access', Component: APIAccess },
      { path: 'support-tickets', Component: SupportTickets },
      { path: 'complaints', element: <Navigate to="/dashboard/support-tickets" replace /> },
      { path: 'subaccounts', Component: SubAccounts },
      { path: 'subaccounts/enable', Component: EnableSubAccountsIntro },
      { path: 'subaccounts/enable/setup', Component: EnableSubAccountsSetup },
      { path: 'subaccounts/request', Component: RequestSubAccount },
      { path: 'users-permissions', Component: UsersPermissions },
      { path: 'settings', Component: Settings },
    ],
  },
]);
