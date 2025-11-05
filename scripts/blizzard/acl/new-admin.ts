import { OWNED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx } from '@interest-protocol/sui-utils';
import invariant from 'tiny-invariant';

import { wwalAcl } from '../utils.script';

const recipient = '';

(async () => {
  invariant(recipient, 'recipient is required');
  const { tx } = await wwalAcl.newAdminAndTransfer({
    recipient,
    superAdmin: OWNED_OBJECTS.WWAL_SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
