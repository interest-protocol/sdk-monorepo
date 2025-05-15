import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const transactionResponse = await executeTx({
    data: curveMainnetSDK.setLpFaMetadata({
      pool: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
      name: 'IPX MOVE/WETHe Volatile',
      symbol: 'IPX v-MOVE/WETHe',
      iconUri:
        'https://interestprotocol.infura-ipfs.io/ipfs/QmezXPykL5y92t6tvsJrmyRr2GUZHwSqyAmVUM32zcKWz2',
      projectUri: 'https://www.interest.xyz/',
    }),
  });

  logSuccess('set-lp-fa-metadata', transactionResponse);
})();
