import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { TideSdk } from '@interest-protocol/tide-amm';
import invariant from 'tiny-invariant';

import { SUI_USDC_POOL } from '../utils.script';
import * as Utils from './liquidity.utils';

const sdk = new TideSdk();

const BLUEFIN_SUI_USDC_POOL_ID =
  '0x3b585786b13af1d8ea067ab37101b6513a05d2f90cfe60e8b1d9e1b46a63c4fa';

const MMT_SUI_USDC_POOL_ID =
  '0x455cf8d2ac91e7cb883f515874af750ed3cd18195c970b7a2d46235ac2b0c388';

const CETUS_SUI_USDC_POOL_ID =
  '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105';

(async () => {
  const [bluefinPool, mmtPool, cetusPool] = await suiClient.multiGetObjects({
    ids: [
      BLUEFIN_SUI_USDC_POOL_ID,
      MMT_SUI_USDC_POOL_ID,
      CETUS_SUI_USDC_POOL_ID,
    ],
    options: {
      showContent: true,
    },
  });

  invariant(bluefinPool, 'Bluefin pool not found');
  invariant(mmtPool, 'MMT pool not found');
  invariant(cetusPool, 'Cetus pool not found');

  const bluefinLiquidity = Utils.resolveBluefinSuiUSDCPool(bluefinPool);
  const mmtLiquidity = Utils.resolveMMTSuiUSDCPool(mmtPool);
  const cetusLiquidity = Utils.resolveCetusSuiUSDCPool(cetusPool);

  const data = [bluefinLiquidity, mmtLiquidity, cetusLiquidity];

  const fees = Object.values(data)
    .map((pool) => pool.fee)
    .sort((a, b) => a - b);

  const prices = await sdk.getPrices(SUI_USDC_POOL);

  const suiLiquidityTVL = (suiLiquidity: bigint) => {
    return Number(
      (suiLiquidity * prices.priceX) / prices.precision / 10n ** 9n
    );
  };

  const usdcLiquidityTVL = (usdcLiquidity: bigint) => {
    return Number(
      (usdcLiquidity * prices.priceY) / prices.precision / 10n ** 6n
    );
  };

  const tvlData = [
    suiLiquidityTVL(BigInt(bluefinLiquidity.suiLiquidity)) +
      usdcLiquidityTVL(BigInt(bluefinLiquidity.usdcLiquidity)),
    suiLiquidityTVL(BigInt(mmtLiquidity.suiLiquidity)) +
      usdcLiquidityTVL(BigInt(mmtLiquidity.usdcLiquidity)),
    suiLiquidityTVL(BigInt(cetusLiquidity.suiLiquidity)) +
      usdcLiquidityTVL(BigInt(cetusLiquidity.usdcLiquidity)),
  ];

  const tvlLiquidity = Object.values(tvlData).sort(
    (a, b) => Number(a) - Number(b)
  );

  // 5% lower
  const tideFee = fees[0]! * 0.95;

  // 10% higher
  const tideLiquidityTvl = Math.ceil(
    tvlLiquidity[tvlLiquidity.length - 1]! * 1.1
  );

  logSuccess({
    bluefinLiquidity,
    mmtLiquidity,
    cetusLiquidity,
    fees,
    tvlLiquidity,
    tideFee,
    tideLiquidityTvl,
  });
})();
