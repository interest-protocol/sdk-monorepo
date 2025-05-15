import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const lst = await blizzardSDK.toLstAtEpoch({
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
    epoch: 1,
    value: 1_000_000_000n * 1000n,
  });

  logSuccess(`LST: ${lst}`);
})();
