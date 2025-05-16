import { OWNED_OBJECTS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';

import { acl } from '../utils.script';

const recipient = keypair.toSuiAddress();

(async () => {
  const { tx, returnValues } = await acl.newAdmin({
    superAdmin: OWNED_OBJECTS.SUPER_ADMIN,
  });

  tx.transferObjects([returnValues], recipient);

  await executeTx(tx);
})();
