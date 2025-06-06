import { logSuccess } from '@interest-protocol/logger';

import { blizzardSDK } from '../utils.script';

(async () => {
  const apr = await blizzardSDK.lastEpochApr({
    nodeId:
      '0xe2b5df873dbcddfea64dcd16f0b581e3b9893becf991649dacc9541895c898cb',
  });

  logSuccess('last-epoch-apr', apr);
})();
