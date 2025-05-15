import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardAcl } from '../utils.script';

(async () => {
  const type = await blizzardAcl.typeFromBlizzardAcl(
    SHARED_OBJECTS.BLIZZARD_ACL({ mutable: false }).objectId
  );

  logSuccess('type-from-blizzard-acl', type);
})();
