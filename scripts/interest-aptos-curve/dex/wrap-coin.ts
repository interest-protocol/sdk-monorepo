import { logSuccess } from '@interest-protocol/logger';
import { Network } from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { COINS, curveMainnetSDK } from '../utils';

const POW_8 = 100000000n;

(async () => {
  const data = curveMainnetSDK.wrapCoin({
    coinType: COINS[Network.MAINNET].MOVE,
    amount: POW_8 / 2n,
    recipient: account.accountAddress.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('wrap-coin', transactionResponse);
})();
