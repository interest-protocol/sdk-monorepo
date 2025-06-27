import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const transactionResponse = await executeTx({
    data: curveMainnetSDK.setLpFaMetadata({
      pool: WHITELISTED_CURVE_LP_COINS.MUSD_USDCe_STABLE.toString(),
      name: 'IPX mUSD/USDCe Stable',
      symbol: 'IPX s-mUSD/USDCe',
      iconUri:
        'https://api.interestlabs.io/movement/lp/0x11a9500b4eaae0375dea274403bc9a508122c19139f586ba50aea6433e9ff70a.png',
      projectUri: 'https://www.interest.xyz/',
    }),
  });

  logSuccess('set-lp-fa-metadata', transactionResponse);
})();
