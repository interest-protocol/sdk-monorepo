import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';
import Decimal from 'decimal.js';
import invariant from 'tiny-invariant';

import { blizzardSDK } from '../utils.script';

(async () => {
  const epoch = await blizzardSDK.getEpochData();

  const lastEpochRate = await blizzardSDK.toWalAtEpoch({
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({ mutable: true }),
    epoch: epoch.currentEpoch - 1,
    value: 1_000_000_000n,
  });

  const currentEpochRate = await blizzardSDK.toWalAtEpoch({
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({ mutable: true }),
    epoch: epoch.currentEpoch,
    value: 1_000_000_000n,
  });

  invariant(lastEpochRate, 'lastEpochRate is null');
  invariant(currentEpochRate, 'currentEpochRate is null');

  const diff = BigInt(currentEpochRate) - BigInt(lastEpochRate);
  console.log(lastEpochRate.toString());
  console.log(currentEpochRate.toString());

  // apr 0.1491603437331874
  logSuccess(
    'apr',
    new Decimal(diff.toString())
      .div(new Decimal(2))
      .div(new Decimal(lastEpochRate.toString()))
      .mul(new Decimal(100))
      .mul(new Decimal(52))
      .toNumber()
  );
})();
