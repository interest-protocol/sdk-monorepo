import { TEST_FAS } from '@interest-protocol/aptos-v3';
import { logSuccess } from '@interest-protocol/logger';
import { aptosTestnetClient } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { faucet, POW_10_8 } from '../utils.script';

(async () => {
  const data = faucet.multiMint({
    metadata: TEST_FAS.aptos_testnet.WETH.toString(),
    amounts: [1n * POW_10_8],
    recipients: [account.accountAddress.toString()],
  });

  const tx = await executeTx({
    data,
    client: aptosTestnetClient,
  });

  logSuccess('multi-mint', tx);
})();
