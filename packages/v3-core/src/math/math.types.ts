import { Numberish } from '@/types';

export interface EncodeAmountsSqrtPriceX64Args {
  amount0: Numberish;
  amount1: Numberish;
}

export interface PriceFromAmountsArgs {
  amount0: Numberish;
  amount1: Numberish;
}

export interface GetLiquidityForAmount0Args {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount0: Numberish;
}

export interface GetLiquidityForAmount1Args {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount1: Numberish;
}

export interface GetLiquidityForAmountsArgs {
  sqrtPriceX64: Numberish;
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  amount0: Numberish;
  amount1: Numberish;
}

export interface GetAmount0ForLiquidityArgs {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}

export interface GetAmount1ForLiquidityArgs {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}

export interface GetAmountsForLiquidityArgs {
  sqrtPriceX64: Numberish;
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
}

export interface GetNextSqrtPriceFromAmountArgs {
  sqrtPriceX64: Numberish;
  liquidity: Numberish;
  amount: Numberish;
  add: boolean;
}

export interface GetAmountDeltaArgs {
  sqrtPriceAX64: Numberish;
  sqrtPriceBX64: Numberish;
  liquidity: Numberish;
  roundUp: boolean;
}

export interface GetNextSqrtPriceFromInputArgs {
  sqrtPriceX64: Numberish;
  liquidity: Numberish;
  amountIn: Numberish;
  zeroForOne: boolean;
}
