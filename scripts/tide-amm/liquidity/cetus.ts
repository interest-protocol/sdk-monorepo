import { TickMath } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { BigNumberUtils } from '@interest-protocol/v3-core';
import { BN } from 'bn.js';
import { pathOr } from 'ramda';

import { USDCSuiPoolLiquidity } from './liquidity.types';
import { getAmountsForLiquidity, isSuiXCoin } from './liquidity.utils';

const CETUS_SUI_USDC_POOL_ID =
  '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105';

const SUI_DECIMALS = 9;
const USDC_DECIMALS = 6;

export const FEE_DENOMINATOR = 1_000_000;

(async () => {
  const poolObject = await suiClient.getObject({
    id: CETUS_SUI_USDC_POOL_ID,
    options: {
      showContent: true,
    },
  });

  const fields = pathOr({}, ['data', 'content', 'fields'], poolObject);

  const isSuiX = isSuiXCoin(
    pathOr('', ['data', 'content', 'type'], poolObject)
  );

  const usdcSuiPoolLiquidity: USDCSuiPoolLiquidity = {
    liquidity: pathOr('0', ['liquidity'], fields),
    tickSpacing: +pathOr('0', ['tick_spacing'], fields).toString(),
    fee: (+pathOr('0', ['fee_rate'], fields) / FEE_DENOMINATOR) * 100,
    currentTick: BigNumberUtils.fromI32(
      pathOr('0', ['current_tick_index', 'fields', 'bits'], fields)
    ).toString(),
    currentSqrtPrice: pathOr('0', ['current_sqrt_price'], fields),
    suiLiquidity: pathOr('0', [isSuiX ? 'coin_a' : 'coin_b'], fields),
    usdcLiquidity: pathOr('0', [isSuiX ? 'coin_b' : 'coin_a'], fields),
    price: (
      1 /
      +TickMath.sqrtPriceX64ToPrice(
        new BN(pathOr('0', ['current_sqrt_price'], fields)),
        isSuiX ? SUI_DECIMALS : USDC_DECIMALS,
        isSuiX ? USDC_DECIMALS : SUI_DECIMALS
      )
        .toDecimalPlaces(6)
        .toString()
    ).toString(),
  };

  const upperPrice = TickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .add(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const lowerPrice = TickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .sub(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const amounts = getAmountsForLiquidity({
    sqrtPriceX64: usdcSuiPoolLiquidity.currentSqrtPrice,
    sqrtPriceAX64: lowerPrice.toString(),
    sqrtPriceBX64: upperPrice.toString(),
    liquidity: usdcSuiPoolLiquidity.liquidity,
  });

  logSuccess({
    suiAmount: amounts.amountB,
    usdcAmount: amounts.amountA,
  });

  logSuccess(usdcSuiPoolLiquidity);
})();
