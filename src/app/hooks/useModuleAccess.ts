import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { useScopedAccountId } from './useAccountScope';
import { resolvePermissions } from '../data/permissions';
import { STANDARD_SCOPE_ID } from '../data/featureEnablement';
import type { AccountType, ModuleAccessContext, ModuleRole } from '../services/businessModulesService';

/**
 * Build the ModuleAccessContext for the current viewer — the input to
 * businessModulesService for resolving module status + CTA. Combines auth role,
 * account type (standard / main / subaccount), the resolved data scope, and the
 * viewer's effective permissions. See docs/contract_module_rules.md.
 */
export function useModuleAccessContext(): ModuleAccessContext {
  const { user } = useAuth();
  const { subAccountsEnabled, isMainAccountView } = useSubAccounts();
  const scopeAccountId = useScopedAccountId();

  return useMemo(() => {
    const role: ModuleRole = user?.role === 'manager' ? 'manager' : 'admin';

    let accountType: AccountType;
    if (role === 'manager') {
      accountType = 'subaccount';
    } else if (!subAccountsEnabled) {
      accountType = 'standard';
    } else if (isMainAccountView()) {
      accountType = 'main';
    } else {
      accountType = 'subaccount';
    }

    // Feature enablement is keyed by scope id. A standard account (no subaccounts)
    // uses the synthetic standard scope id; otherwise use the resolved scope.
    const effectiveScopeId =
      accountType === 'standard' ? STANDARD_SCOPE_ID : scopeAccountId;

    return {
      accountType,
      role,
      scopeAccountId: effectiveScopeId,
      permissions: resolvePermissions(role),
      // Coverage is validated at booking time against the delivery address; the
      // catalog view does not pre-fail coverage-gated modules.
      serviceCoverageOk: undefined,
    };
  }, [user?.role, subAccountsEnabled, isMainAccountView, scopeAccountId]);
}
