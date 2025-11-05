import { OWNED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { executeTx } from '@interest-protocol/sui-utils';

import { blizzardAcl } from '../utils.script';
(async () => {
  const { tx } = await blizzardAcl.startSuperAdminTransfer({
    superAdmin: OWNED_OBJECTS.WWAL_SUPER_ADMIN,
    recipient:
      '0x1dd93b4bb9a733c30da8a3c4a49177ab3ab4ab4a602a89a72b24f63b68e53534',
    lstType: TYPES.WWAL,
  });

  await executeTx(tx as any);
})();
