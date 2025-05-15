import { logSuccess } from '@interest-protocol/sui-utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const epochData = await blizzardSDK.getEpochData();

  logSuccess(`Epoch data: ${epochData}`);
})();
