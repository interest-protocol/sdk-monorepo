import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const transactionResponse = await executeTx({
    data: curveMainnetSDK.setLpFaMetadata({
      pool: WHITELISTED_CURVE_LP_COINS.WBTCe_MBTC_STABLE.toString(),
      name: 'IPX wBTCe/mBTC Stable',
      symbol: 'IPX s-wBTCe/mBTC',
      iconUri:
        'https://api.interestlabs.io/movement/lp/0x02e519bd6512e477af16ab99cddd26da6d7a75fed9d2a4bfa1fec6963e1a6a42.png',
      projectUri: 'https://www.interest.xyz/',
    }),
  });

  logSuccess('set-lp-fa-metadata', transactionResponse);
})();
