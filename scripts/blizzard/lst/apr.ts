import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';
import Decimal from 'decimal.js';
import invariant from 'tiny-invariant';

import { blizzardSDK } from '../utils.script';

(async () => {
  const epoch = await blizzardSDK.getEpochData();
  const ONE_WWAL = 1_000_000_000n;

  const [currentEpochRate, lastEpochRate] = await Promise.all([
    blizzardSDK.toWalAtEpoch({
      blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({ mutable: true }),
      epoch: epoch.currentEpoch,
      value: ONE_WWAL,
    }),
    blizzardSDK.toWalAtEpoch({
      blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({ mutable: true }),
      epoch: epoch.currentEpoch - 1,
      value: ONE_WWAL,
    }),
  ]);

  invariant(lastEpochRate, 'lastEpochRate is null');
  invariant(currentEpochRate, 'currentEpochRate is null');

  const twoWeeklyGrowth = BigInt(currentEpochRate) - BigInt(lastEpochRate);

  // apr 0.1491603437331874
  logSuccess(
    'apr',
    new Decimal(twoWeeklyGrowth.toString())
      // one week growth
      .div(new Decimal(2))
      // Weekly growth Rate
      .div(new Decimal(lastEpochRate.toString()))
      // To percentage e.g. 0.01 -> 1%
      .mul(new Decimal(100))
      // one week growth to annual growth (52 weeks in a year)
      .mul(new Decimal(52))
      .toNumber()
  );
})();
