import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { faucet, POW_10_8 } from '../utils.script';

(async () => {
  const data = faucet.mint({
    amount: 100n * POW_10_8,
    metadata: TEST_FAS.bardock.BTC.toString(),
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('mint', tx);
})();
