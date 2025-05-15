import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const fees = await blizzardSDK.getFees(
    SHARED_OBJECTS.TR_WAL_STAKING({ mutable: false }).objectId
  );

  logSuccess(`Fees: ${fees}`);
})();
