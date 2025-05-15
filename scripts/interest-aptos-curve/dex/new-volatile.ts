import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.newVolatilePoolWithFas({
    fas: [WHITELISTED_FAS.MOVE.toString(), WHITELISTED_FAS.WETHe.toString()],
    prices: [7_324n * curveMainnetSDK.PRECISION],
    a: 500000n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('new-volatile', transactionResponse);
})();
