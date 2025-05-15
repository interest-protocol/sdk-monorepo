import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK, POW_9 } from '../utils.script';

(async () => {
  const fcfs = await blizzardSDK.viewFcfs({
    value: POW_9,
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  logSuccess('view-fcfs', fcfs);
})();
