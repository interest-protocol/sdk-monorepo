import { logSuccess } from '@interest-protocol/logger';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { makeTideAclSdk, SUPER_ADMIN } from '@interest-protocol/tide-amm';

const TideAclSdk = makeTideAclSdk();

(async () => {
  const tx = TideAclSdk.newAdminAndTransfer({
    recipient: keypair.toSuiAddress(),
    superAdmin: SUPER_ADMIN,
  });

  const result = await executeTx(tx as any);

  logSuccess('new-admin', result);
})();
