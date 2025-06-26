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
        'https://interestprotocol.infura-ipfs.io/ipfs/QmezXPykL5y92t6tvsJrmyRr2GUZHwSqyAmVUM32zcKWz2',
      projectUri: 'https://www.interest.xyz/',
    }),
  });

  logSuccess('set-lp-fa-metadata', transactionResponse);
})();
