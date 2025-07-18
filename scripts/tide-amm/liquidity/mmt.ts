import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { BigNumberUtils } from '@interest-protocol/v3-core';
import { TickMath, Utils } from '@mmt-finance/clmm-sdk';
import { BN } from 'bn.js';
import { pathOr } from 'ramda';

import { USDCSuiPoolLiquidity } from './liquidity.types';
import { isSuiXCoin } from './liquidity.utils';

const MMT_SUI_USDC_POOL_ID =
  '0x455cf8d2ac91e7cb883f515874af750ed3cd18195c970b7a2d46235ac2b0c388';

const SUI_DECIMALS = 9;
const USDC_DECIMALS = 6;

export const FEE_DENOMINATOR = 1_000_000;

(async () => {
  const poolObject = await suiClient.getObject({
    id: MMT_SUI_USDC_POOL_ID,
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
    fee: (+pathOr('0', ['swap_fee_rate'], fields) / FEE_DENOMINATOR) * 100,
    currentTick: BigNumberUtils.fromI32(
      pathOr('0', ['tick_index', 'fields', 'bits'], fields)
    ).toString(),
    currentSqrtPrice: pathOr('0', ['sqrt_price'], fields),
    suiLiquidity: pathOr('0', ['reserve_x'], fields),
    usdcLiquidity: pathOr('0', ['reserve_y'], fields),
    price: TickMath.sqrtPriceX64ToPrice(
      new BN(pathOr('0', ['sqrt_price'], fields)),
      isSuiX ? SUI_DECIMALS : USDC_DECIMALS,
      isSuiX ? USDC_DECIMALS : SUI_DECIMALS
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

  const amounts = Utils.getCoinAmountFromLiquidity(
    new BN(usdcSuiPoolLiquidity.liquidity),
    new BN(usdcSuiPoolLiquidity.currentSqrtPrice),
    new BN(lowerPrice),
    new BN(upperPrice),
    true
  );

  logSuccess({
    suiAmount: amounts.coinA.toString(),
    usdcAmount: amounts.coinB.toString(),
  });

  logSuccess(usdcSuiPoolLiquidity);
})();
