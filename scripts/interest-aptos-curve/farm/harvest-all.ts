import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.harvestAll({
    farms: FARMS.map((farm) => farm.address.toString()),
    rewardFas: FARMS.map((_) => WHITELISTED_FAS.MOVE.toString()),
    recipient: account.accountAddress.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('harvest-all', transactionResponse);
})();
