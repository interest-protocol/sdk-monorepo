import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.stake({
    farm: FARMS[0]!.address.toString(),
    faIn: WHITELISTED_CURVE_LP_COINS.USDTe_MOVE_VOLATILE.toString(),
    amount: 1196738n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('stake', transactionResponse);
})();
