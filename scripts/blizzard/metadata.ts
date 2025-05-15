import { TYPES } from '@interest-protocol/blizzard-sdk';
import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';

(async () => {
  const metadata = await suiClient.getCoinMetadata({
    coinType: TYPES.WWAL,
  });

  logSuccess('metadata', metadata);
  logSuccess('types-w-wal', TYPES.WWAL);
})();
