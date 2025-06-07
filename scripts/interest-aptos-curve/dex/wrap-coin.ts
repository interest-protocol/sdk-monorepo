import { logSuccess } from '@interest-protocol/logger';
import { Network } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { COINS, curveMainnetSDK } from '../utils';

const POW_8 = 100000000n;

(async () => {
  const data = curveMainnetSDK.wrapCoins({
    coinTypes: [COINS[Network.MAINNET].MOVE],
    amounts: [POW_8 / 3n],
    recipient: account.accountAddress.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('wrap-coin', transactionResponse);
})();
