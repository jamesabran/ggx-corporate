import { useSubAccounts } from '../contexts/SubAccountContext';
import { ParentDashboard } from './ParentDashboard';
import { Dashboard } from './Dashboard';

export function DashboardWrapper() {
  const { isMainAccountView } = useSubAccounts();
  return isMainAccountView() ? <ParentDashboard /> : <Dashboard />;
}
