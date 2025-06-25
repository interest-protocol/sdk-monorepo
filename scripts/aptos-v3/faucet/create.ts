import { logSuccess } from '@interest-protocol/logger';
import { bardockClient } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { faucet } from '../utils.script';

(async () => {
  const data = faucet.create({
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
  });

  const tx = await executeTx({
    data,
    client: bardockClient,
  });

  logSuccess('mint', tx);
})();
