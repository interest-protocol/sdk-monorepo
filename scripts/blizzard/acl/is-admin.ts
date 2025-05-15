import { OWNED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/sui-utils';

import { blizzardAcl } from '../utils.script';
(async () => {
  const isAdmin = await blizzardAcl.isAdmin({
    admin: OWNED_OBJECTS.BLIZZARD_ADMIN,
  });

  logSuccess(`Is admin: ${isAdmin}`);
})();
