import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const blizzardStaking = await blizzardSDK.getBlizzardStaking(
    SHARED_OBJECTS.PWAL_STAKING({ mutable: false })
  );

  logSuccess(blizzardStaking);
})();
