import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const walrusPackage = await blizzardSDK.getLatestWalrusPackage();

  logSuccess(`Latest walrus package: ${walrusPackage}`);
})();
