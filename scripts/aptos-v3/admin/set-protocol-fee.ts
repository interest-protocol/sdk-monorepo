import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { interestV3 } from '../utils.script';

(async () => {
  const adminDataPayload = interestV3.setProtocolFee({
    fee: 250_000,
  });

  const tx = await executeTx({
    data: adminDataPayload,
    client: bardockClient,
  });

  logSuccess('set-protocol-fee', tx);
})();
