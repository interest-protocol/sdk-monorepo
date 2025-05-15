import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const type = await blizzardSDK.typeFromBlizzardStaking(
    SHARED_OBJECTS.NWAL_ACL({
      mutable: true,
    }).objectId
  );

  logSuccess(`Type: ${type}`);
})();
