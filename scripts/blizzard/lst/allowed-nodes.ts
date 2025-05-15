import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const allowedNodes = await blizzardSDK.allowedNodes(
    SHARED_OBJECTS.WWAL_STAKING({ mutable: true })
  );

  logSuccess('allowed-nodes', allowedNodes);
})();
