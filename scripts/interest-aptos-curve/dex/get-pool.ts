import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getPool(
    WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE.toString()
  );

  logSuccess('get-pool', data);
})();
