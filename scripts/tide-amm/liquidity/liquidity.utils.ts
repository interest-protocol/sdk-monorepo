import {
  getCoinAFromLiquidity,
  getCoinBFromLiquidity,
  TickMath as CETUSTickMath,
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { BigNumberUtils } from '@interest-protocol/v3-core';
import {
  TickMath as MMTTickMath,
  Utils as MMTUtils,
} from '@mmt-finance/clmm-sdk';
import { SuiObjectResponse } from '@mysten/sui/client';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { normalizeStructTag } from '@mysten/sui/utils';
import BN from 'bn.js';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import {
  GetAmountsForLiquidityParams,
  USDCSuiPoolLiquidity,
} from './liquidity.types';

function orderSqrtPrice(sqrtPrice0X64: BN, sqrtPrice1X64: BN): [BN, BN] {
  if (sqrtPrice0X64.lt(sqrtPrice1X64)) {
    return [sqrtPrice0X64, sqrtPrice1X64];
  }
  return [sqrtPrice1X64, sqrtPrice0X64];
}

export const getAmountsForLiquidity = ({
  sqrtPriceX64,
  sqrtPriceAX64,
  sqrtPriceBX64,
  liquidity,
}: GetAmountsForLiquidityParams) => {
  const sqrtPriceX64BN = new BN(sqrtPriceX64);
  let sqrtPriceAX64BN = new BN(sqrtPriceAX64);
  let sqrtPriceBX64BN = new BN(sqrtPriceBX64);
  const liquidityBN = new BN(liquidity);

  [sqrtPriceAX64BN, sqrtPriceBX64BN] = orderSqrtPrice(
    sqrtPriceAX64BN,
    sqrtPriceBX64BN
  );

  return {
    amountA: getCoinAFromLiquidity(
      liquidityBN,
      sqrtPriceX64BN,
      sqrtPriceBX64BN,
      true
    ).toString(),
    amountB: getCoinBFromLiquidity(
      liquidityBN,
      sqrtPriceAX64BN,
      sqrtPriceX64BN,
      true
    ).toString(),
  };
};

export function parsePoolString(poolString: string) {
  const regex = /Pool<([^,]+),\s*([^>]+)>/;
  const match = poolString.match(regex);

  if (match?.length) {
    return {
      x: match[1]?.trim(),
      y: match[2]?.trim(),
    };
  }

  throw new Error('Invalid pool string format');
}

export const isSuiXCoin = (poolString: string) => {
  const { x, y } = parsePoolString(poolString);

  invariant(x && y, 'Invalid pool string format');

  return normalizeStructTag(x) === normalizeStructTag(SUI_TYPE_ARG);
};

export const resolveMMTSuiUSDCPool = (
  poolObject: SuiObjectResponse
): USDCSuiPoolLiquidity => {
  const FEE_DENOMINATOR = 1_000_000;

  const SUI_DECIMALS = 9;
  const USDC_DECIMALS = 6;

  const fields = pathOr({}, ['data', 'content', 'fields'], poolObject);

  const isSuiX = isSuiXCoin(
    pathOr('', ['data', 'content', 'type'], poolObject)
  );

  const usdcSuiPoolLiquidity = {
    liquidity: pathOr('0', ['liquidity'], fields),
    tickSpacing: +pathOr('0', ['tick_spacing'], fields).toString(),
    fee: (+pathOr('0', ['swap_fee_rate'], fields) / FEE_DENOMINATOR) * 100,
    currentTick: BigNumberUtils.fromI32(
      pathOr('0', ['tick_index', 'fields', 'bits'], fields)
    ).toString(),
    currentSqrtPrice: pathOr('0', ['sqrt_price'], fields),
    suiBalance: pathOr('0', ['reserve_x'], fields),
    usdcBalance: pathOr('0', ['reserve_y'], fields),
    price: MMTTickMath.sqrtPriceX64ToPrice(
      new BN(pathOr('0', ['sqrt_price'], fields)),
      isSuiX ? SUI_DECIMALS : USDC_DECIMALS,
      isSuiX ? USDC_DECIMALS : SUI_DECIMALS
    )
      .toDecimalPlaces(6)
      .toString(),
  };

  const upperPrice = MMTTickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .add(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const lowerPrice = MMTTickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .sub(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const amounts = MMTUtils.getCoinAmountFromLiquidity(
    new BN(usdcSuiPoolLiquidity.liquidity),
    new BN(usdcSuiPoolLiquidity.currentSqrtPrice),
    new BN(lowerPrice),
    new BN(upperPrice),
    true
  );

  return {
    ...usdcSuiPoolLiquidity,
    suiLiquidity: amounts.coinA.toString(),
    usdcLiquidity: amounts.coinB.toString(),
    isSuiX,
  };
};

export const resolveCetusSuiUSDCPool = (
  poolObject: SuiObjectResponse
): USDCSuiPoolLiquidity => {
  const FEE_DENOMINATOR = 1_000_000;

  const SUI_DECIMALS = 9;
  const USDC_DECIMALS = 6;

  const fields = pathOr({}, ['data', 'content', 'fields'], poolObject);

  const isSuiX = isSuiXCoin(
    pathOr('', ['data', 'content', 'type'], poolObject)
  );

  const usdcSuiPoolLiquidity = {
    liquidity: pathOr('0', ['liquidity'], fields),
    tickSpacing: +pathOr('0', ['tick_spacing'], fields).toString(),
    fee: (+pathOr('0', ['fee_rate'], fields) / FEE_DENOMINATOR) * 100,
    currentTick: BigNumberUtils.fromI32(
      pathOr('0', ['current_tick_index', 'fields', 'bits'], fields)
    ).toString(),
    currentSqrtPrice: pathOr('0', ['current_sqrt_price'], fields),
    suiBalance: pathOr('0', [isSuiX ? 'coin_a' : 'coin_b'], fields),
    usdcBalance: pathOr('0', [isSuiX ? 'coin_b' : 'coin_a'], fields),
    price: (
      1 /
      +CETUSTickMath.sqrtPriceX64ToPrice(
        new BN(pathOr('0', ['current_sqrt_price'], fields)),
        isSuiX ? SUI_DECIMALS : USDC_DECIMALS,
        isSuiX ? USDC_DECIMALS : SUI_DECIMALS
      )
        .toDecimalPlaces(6)
        .toString()
    ).toString(),
  };

  const upperPrice = CETUSTickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .add(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const lowerPrice = CETUSTickMath.tickIndexToSqrtPriceX64(
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

  return {
    ...usdcSuiPoolLiquidity,
    suiLiquidity: amounts.amountB,
    usdcLiquidity: amounts.amountA,
    isSuiX,
  };
};

export const resolveBluefinSuiUSDCPool = (
  poolObject: SuiObjectResponse
): USDCSuiPoolLiquidity => {
  const FEE_DENOMINATOR = 1_000_000;

  const SUI_DECIMALS = 9;
  const USDC_DECIMALS = 6;

  const fields = pathOr({}, ['data', 'content', 'fields'], poolObject);

  const isSuiX = isSuiXCoin(
    pathOr('', ['data', 'content', 'type'], poolObject)
  );

  const usdcSuiPoolLiquidity = {
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
    suiBalance: pathOr('0', ['coin_a'], fields),
    usdcBalance: pathOr('0', ['coin_b'], fields),
    price: CETUSTickMath.sqrtPriceX64ToPrice(
      new BN(pathOr('0', ['current_sqrt_price'], fields)),
      SUI_DECIMALS,
      USDC_DECIMALS
    )
      .toDecimalPlaces(6)
      .toString(),
  };

  const upperPrice = CETUSTickMath.tickIndexToSqrtPriceX64(
    new BN(usdcSuiPoolLiquidity.currentTick)
      .add(new BN(usdcSuiPoolLiquidity.tickSpacing))
      .toNumber()
  );

  const lowerPrice = CETUSTickMath.tickIndexToSqrtPriceX64(
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

  return {
    ...usdcSuiPoolLiquidity,
    suiLiquidity: amounts.amountA,
    usdcLiquidity: amounts.amountB,
    isSuiX,
  };
};
