import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const now = Date.now() / 1000;

  const data = curveMainnetSDK.newFarm({
    startTimestamp: now + 30,
    rewardFas: [WHITELISTED_FAS.MOVE.toString()],
    stakedFa: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('new-farm', transactionResponse);
})();
