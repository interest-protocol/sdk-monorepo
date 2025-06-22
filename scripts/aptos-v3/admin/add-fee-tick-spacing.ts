import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { interestV3 } from '../utils.script';

(async () => {
  const adminDataPayload = interestV3.addFeeTickSpacing({
    fee: 2000,
    tickSpacing: 60,
  });

  const tx = await executeTx({
    data: adminDataPayload,
    client: aptosTestnetClient,
  });

  logSuccess('add-fee-tick-spacing', tx);
})();
