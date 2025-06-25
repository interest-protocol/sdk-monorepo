import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { interestV3 } from '../utils.script';

(async () => {
  const data = interestV3.removeAdmin({
    admin: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: aptosTestnetClient,
  });

  logSuccess('remove-admin', tx);
})();
