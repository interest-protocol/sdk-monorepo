import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const walrusPackage = await blizzardSDK.getLatestWalrusPackage();

  logSuccess('get-latest-walrus-package', walrusPackage);
})();
