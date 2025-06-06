import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const epochData = await blizzardSDK.getEpochData();

  logSuccess('get-epoch-data', epochData);
})();
