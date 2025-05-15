import { logSuccess } from '@interest-protocol/logger';
import { getMemeCoinMarketCap } from '@interest-protocol/memez-fun-sdk';

import { getEnv } from '../utils.script';
(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const r = await pumpSdk.getPumpPool(testnetPoolId);

  const marketCap = await getMemeCoinMarketCap({
    quoteBalance: r.curveState.quoteBalance,
    virtualLiquidity: r.curveState.virtualLiquidity,
    memeBalance: r.curveState.memeBalance,
    quoteUSDPrice: 5,
  });

  logSuccess(`Market Cap: ${marketCap}`);
})();
