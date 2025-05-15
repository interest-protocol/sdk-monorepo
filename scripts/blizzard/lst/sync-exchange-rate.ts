import { SHARED_OBJECTS } from '@interest-protocol/blizzard-sdk';
import { executeTx } from '@interest-protocol/utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const { tx } = await blizzardSDK.syncExchangeRate({
    blizzardStaking: SHARED_OBJECTS.WWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  await executeTx(tx);
})();
