import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { interestV3, TEST_POOLS } from '../utils.script';

(async () => {
  const data = interestV3.collectProtocolFee({
    pool: TEST_POOLS.bardock.WETH_USDC,
    recipient: account.accountAddress.toString(),
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('collect-protocol-fees', tx);
})();
