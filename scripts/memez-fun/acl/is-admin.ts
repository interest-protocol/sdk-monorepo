import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, ownedObjects } = await getEnv();

  const result = await aclSdk.isAdmin({
    admin: ownedObjects.ADMIN,
  });

  logSuccess(`isAdmin: ${result}`);
})();
