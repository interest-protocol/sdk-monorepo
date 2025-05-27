import { Farm, FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';

import { curveMainnetSDK } from '../utils';

const ONE_LP = 1_000_000_000n;

const PRICE_SCALAR = 1_000_000_000;
const MOVE_DECIMALS_SCALAR = 100_000_000;
const USDC_DECIMALS_SCALAR = 1_000_000;
const WETHe_DECIMALS_SCALAR = 100_000_000;

// API Endpoint
const PROVIDER_USDC_FEED = {
  [WHITELISTED_FAS.MOVE.toString()]: 0.1736,
  [WHITELISTED_FAS.USDCe.toString()]: 1,
  [WHITELISTED_FAS.USDTe.toString()]: 1,
  [WHITELISTED_FAS.WETHe.toString()]: 2710.28,
};

// DB
export const DECIMALS_SCALAR = {
  [WHITELISTED_FAS.MOVE.toString()]: MOVE_DECIMALS_SCALAR,
  [WHITELISTED_FAS.USDCe.toString()]: USDC_DECIMALS_SCALAR,
  [WHITELISTED_FAS.USDTe.toString()]: USDC_DECIMALS_SCALAR,
  [WHITELISTED_FAS.WETHe.toString()]: WETHe_DECIMALS_SCALAR,
};

const calculateAllRewardInUSD = async (farm: Farm) => {
  return farm.rewards.reduce((acc, reward) => {
    return (
      acc +
      (reward.rewardsPerSecond *
        86400n *
        365n *
        BigInt(
          (PROVIDER_USDC_FEED[reward.rewardFa.address.toString()] || 0) *
            PRICE_SCALAR
        )) /
        BigInt(PRICE_SCALAR) /
        BigInt(DECIMALS_SCALAR[reward.rewardFa.address.toString()]!)
    );
  }, 0n);
};

const calculateOneLpCoinPriceInUsd = async (farm: Farm) => {
  const { amountsOut } = await curveMainnetSDK.quoteRemoveLiquidity({
    pool: farm.stakedFa.address.toString(),
    amountIn: ONE_LP,
  });

  const pool = await curveMainnetSDK.getPool(farm.stakedFa.address.toString());

  return pool.fas.reduce((acc, fa, index) => {
    const amountsInUSD =
      (BigInt(amountsOut[index]!) *
        BigInt((PROVIDER_USDC_FEED[fa.toString()] || 0) * PRICE_SCALAR)) /
      BigInt(DECIMALS_SCALAR[fa.toString()]!);

    return acc + Number(amountsInUSD) / PRICE_SCALAR;
  }, 0);
};

(async () => {
  const data = await curveMainnetSDK.getFarms([FARMS[1]!.address.toString()!]);

  const farm = data[0]!;

  const totalRewardsInUSD = await calculateAllRewardInUSD(farm);

  const lpCoinPrice = await calculateOneLpCoinPriceInUsd(farm);

  const totalStakedInUSD =
    lpCoinPrice * Number(BigInt(farm.stakedBalance) / ONE_LP);

  const apr = (Number(totalRewardsInUSD) / totalStakedInUSD) * 100;

  const rewardsPerYearInUSDFormatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(totalRewardsInUSD));

  const currentStakedInFarmInUSDFormatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(totalStakedInUSD));

  logSuccess(`Rewards per year in USD: ${rewardsPerYearInUSDFormatted}`);
  logSuccess(
    `Current staked in farm in USD: ${currentStakedInFarmInUSDFormatted}`
  );
  logSuccess(`APR: ${apr}`);
})();
