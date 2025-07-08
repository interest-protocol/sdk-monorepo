import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { makeTideAclSdk, SUPER_ADMIN } from '@interest-protocol/tide-amm';

const TideAclSdk = makeTideAclSdk();

(async () => {
  const tx = TideAclSdk.newAdminAndTransfer({
    recipient: keypair.toSuiAddress(),
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
