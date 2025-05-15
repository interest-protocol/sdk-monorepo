import { WHITELISTED_CURVE_LP_COINS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import {
  COINS,
  Network,
  WHITELISTED_FAS,
} from '@interest-protocol/movement-core-sdk';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

const coinTypes = COINS[Network.BARDOCK];

(async () => {
  const data = curveMainnetSDK.swapCoinToFa({
    pool: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    coinIn: coinTypes['0x1::aptos_coin::AptosCoin'].type,
    faOut: WHITELISTED_FAS.MOVE.toString(),
    amountIn: 100n,
    recipient: account.accountAddress.toString(),
    minAmountOut: 0n,
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('swap-coin-to-fa', transactionResponse);
})();
