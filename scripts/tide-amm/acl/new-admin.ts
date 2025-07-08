import { logSuccess } from '@interest-protocol/logger';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { SUPER_ADMIN, TideAclSdk } from '@interest-protocol/tide-amm';

(async () => {
  const tx = TideAclSdk.newAdminAndTransfer({
    recipient: keypair.toSuiAddress(),
    superAdmin: SUPER_ADMIN,
  });

  const result = await executeTx(tx as any);

  logSuccess('new-admin', result);
})();
