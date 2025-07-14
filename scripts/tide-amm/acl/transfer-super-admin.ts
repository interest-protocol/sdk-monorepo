import { executeTx } from '@interest-protocol/sui-utils';
import { makeTideAclSdk, SUPER_ADMIN } from '@interest-protocol/tide-amm';

const TideAclSdk = makeTideAclSdk();

(async () => {
  const tx = TideAclSdk.startSuperAdminTransfer({
    recipient:
      '0x1dd93b4bb9a733c30da8a3c4a49177ab3ab4ab4a602a89a72b24f63b68e53534',
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
