import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

const REWARDS_PER_SECOND = 0.050745701058201;

(async () => {
  const data = curveMainnetSDK.setRewardsPerSecond({
    farm: FARMS[4]!.address.toString(),
    rewardFa: WHITELISTED_FAS.MOVE.toString(),
    rewardsPerSecond: BigInt(Math.floor(REWARDS_PER_SECOND * 1e8)),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('set-rewards-per-second', transactionResponse);
})();
