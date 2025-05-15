import { executeTx, keypair } from '@interest-protocol/utils';

import { OWNED_OBJECTS } from '../../../packages/interest-stable-swap-sdk/src';
import { acl } from '../utils.script';

const recipient = keypair.toSuiAddress();

(async () => {
  const { tx, returnValues } = await acl.newAdmin({
    superAdmin: OWNED_OBJECTS.SUPER_ADMIN,
  });

  tx.transferObjects([returnValues], recipient);

  await executeTx(tx);
})();
