import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { interestV3 } from '../utils.script';

(async () => {
  const adminDataPayload = interestV3.addAdmin({
    admin: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data: adminDataPayload,
    client: aptosTestnetClient,
  });

  logSuccess('add-admin', tx);
})();
