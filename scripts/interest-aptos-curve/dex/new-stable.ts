import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.newStablePoolWithFas({
    metadatas: [
      WHITELISTED_FAS.USDCe.toString(),
      WHITELISTED_FAS.MUSD.toString(),
    ],
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('new-stable', transactionResponse);
})();
