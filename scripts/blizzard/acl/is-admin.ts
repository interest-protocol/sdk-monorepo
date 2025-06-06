import { OWNED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';

import { blizzardAcl } from '../utils.script';
(async () => {
  const isAdmin = await blizzardAcl.isAdmin({
    admin: OWNED_OBJECTS.BLIZZARD_ADMIN,
  });

  logSuccess('is-admin', isAdmin);
})();
