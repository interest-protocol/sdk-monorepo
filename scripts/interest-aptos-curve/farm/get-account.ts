import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';
import { account } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getFarmAccount({
    user: account.accountAddress.toString(),
    farm: FARMS[0]!.address.toString(),
    rewardFas: [WHITELISTED_FAS.MOVE.toString()],
  });

  logSuccess(data);
})();
