import { TickMath } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { BigNumberUtils } from '@interest-protocol/v3-core';
import { BN } from 'bn.js';
import { pathOr } from 'ramda';

import { USDCSuiPoolLiquidity } from './liquidity.types';
import { getAmountsForLiquidity } from './liquidity.utils';

const BLUEFIN_SUI_USDC_POOL_ID =
  '0x3b585786b13af1d8ea067ab37101b6513a05d2f90cfe60e8b1d9e1b46a63c4fa';

const SUI_DECIMALS = 9;
const USDC_DECIMALS = 6;

export const FEE_DENOMINATOR = 1_000_000;

(async () => {
  const poolObject = await suiClient.getObject({
    id: BLUEFIN_SUI_USDC_POOL_ID,
    options: {
      showContent: true,
    },
  });

  const fields = pathOr({}, ['data', 'content', 'fields'], poolObject);

  const usdcSuiPoolLiquidity: USDCSuiPoolLiquidity = {
    liquidity: pathOr('0', ['liquidity'], fields),
    tickSpacing: +pathOr(
      '0',
      ['ticks_manager', 'fields', 'tick_spacing'],
      fields
    ).toString(),
    fee: (+pathOr('0', ['fee_rate'], fields) / FEE_DENOMINATOR) * 100,
    currentTick: BigNumberUtils.fromI32(
      pathOr('0', ['current_tick_index', 'fields', 'bits'], fields)
    ).toString(),
    currentSqrtPrice: pathOr('0', ['current_sqrt_price'], fields),
    suiLiquidity: pathOr('0', ['coin_a'], fields),
    usdcLiquidity: pathOr('0', ['coin_b'], fields),
    price: TickMath.sqrtPriceX64ToPrice(
      new BN(pathOr('0', ['current_sqrt_price'], fields)),
      SUI_DECIMALS,
      USDC_DECIMALS
    )
      .toDecimalPlaces(6)
      .toString(),
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
    suiAmount: amounts.amountA,
    usdcAmount: amounts.amountB,
  });

  logSuccess(usdcSuiPoolLiquidity);
})();
