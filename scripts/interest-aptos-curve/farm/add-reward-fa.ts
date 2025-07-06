import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

const POW_8 = 100000000n;

(async () => {
  const data = curveMainnetSDK.addRewardFa({
    farm: FARMS[4]!.address.toString(),
    rewardFa: WHITELISTED_FAS.MOVE.toString(),
    amount: 32915n * POW_8,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('add-reward-fa', transactionResponse);
})();
