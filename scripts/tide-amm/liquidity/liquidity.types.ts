export interface USDCSuiPoolLiquidity {
  liquidity: string;
  tickSpacing: number;
  fee: number;
  currentTick: string;
  currentSqrtPrice: string;
  suiBalance: string;
  usdcBalance: string;
  price: string;
  suiLiquidity: string;
  usdcLiquidity: string;
  isSuiX: boolean;
}

export interface GetAmountsForLiquidityParams {
  sqrtPriceX64: string;
  sqrtPriceAX64: string;
  sqrtPriceBX64: string;
  liquidity: string;
}
