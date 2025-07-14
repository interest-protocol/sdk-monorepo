import { OWNED_OBJECTS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';

import { acl } from '../utils.script';

const recipient = keypair.toSuiAddress();

(async () => {
  const { tx } = await acl.startSuperAdminTransfer({
    superAdmin: OWNED_OBJECTS.SUPER_ADMIN,
    recipient:
      '0x1dd93b4bb9a733c30da8a3c4a49177ab3ab4ab4a602a89a72b24f63b68e53534',
  });

  await executeTx(tx);
})();
