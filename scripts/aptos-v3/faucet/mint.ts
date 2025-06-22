import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { faucet, POW_10_6 } from '../utils.script';

(async () => {
  const adminDataPayload = faucet.mint({
    amount: 10_000n * POW_10_6,
    metadata: TEST_FAS.USDC.toString(),
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data: adminDataPayload,
    client: aptosTestnetClient,
  });

  logSuccess('mint', tx);
})();
