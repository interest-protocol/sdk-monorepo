import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { account } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getAccountFarmsData({
    user: account.accountAddress.toString(),
    farms: FARMS.map((farm) => farm.address.toString()),
    rewardFas: FARMS.map((farm) => farm.rewards[0]!),
  });

  logSuccess(data);
})();
