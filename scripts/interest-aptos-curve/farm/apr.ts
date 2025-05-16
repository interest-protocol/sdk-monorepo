import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import invariant from 'tiny-invariant';

import { curveMainnetSDK } from '../utils';

const USDC_PRICE = 1;
const MOVE_PRICE = 0.198;
const ONE_LP = 1_000_000_000n;

const MOVE_DECIMALS_SCALAR = 100_000_000;
const USDC_DECIMALS_SCALAR = 1_000_000;

(async () => {
  const data = await curveMainnetSDK.getFarms([FARMS[2]!.address.toString()!]);

  const farm = data[0]!;

  const rewards = farm.rewards[0]!;

  const rewardPerSecond = rewards.rewardsPerSecond;

  const rewardsInOneYear = rewardPerSecond * 86400n * 365n;

  const { amountsOut } = await curveMainnetSDK.quoteRemoveLiquidity({
    pool: farm.stakedFa.address.toString(),
    amountIn: ONE_LP,
  });

  invariant(amountsOut, 'Invalid amountsOut');

  invariant(amountsOut.length === 2, 'Invalid amountsOut');

  const usdcAmount = amountsOut![0]!;
  const moveAmount = amountsOut[1]!;

  const valueOfOneLpCoin =
    (+usdcAmount * USDC_PRICE) / USDC_DECIMALS_SCALAR +
    (+moveAmount * MOVE_PRICE) / MOVE_DECIMALS_SCALAR;

  const rewardsPerYearInUSD =
    (rewardsInOneYear * BigInt(MOVE_PRICE * 1_000)) / 1_000n / 100_000_000n;

  const currentStakedInFarmInUSD =
    (farm.stakedBalance * BigInt(Math.floor(valueOfOneLpCoin * 1_000))) /
    1_000n /
    1_000_000_000n;

  const apr =
    (Number(rewardsPerYearInUSD) / Number(currentStakedInFarmInUSD)) * 100;

  const rewardsPerYearInUSDFormatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(rewardsPerYearInUSD));

  const currentStakedInFarmInUSDFormatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(currentStakedInFarmInUSD));

  logSuccess(`Rewards per year in USD: ${rewardsPerYearInUSDFormatted}`);
  logSuccess(
    `Current staked in farm in USD: ${currentStakedInFarmInUSDFormatted}`
  );
  logSuccess(`APR: ${apr}`);
})();
