import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const allowedNodes = await blizzardSDK.allowedNodes(
    SHARED_OBJECTS.WWAL_STAKING({ mutable: true })
  );

  logSuccess(`Allowed nodes: ${allowedNodes}`);
})();
