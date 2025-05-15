import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.harvest({
    farm: FARMS[0]!.address.toString(),
    rewardFa: WHITELISTED_FAS.MOVE.toString(),
    recipient: account.accountAddress.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('harvest', transactionResponse);
})();
