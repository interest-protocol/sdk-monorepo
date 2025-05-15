import { TYPES } from '@interest-protocol/blizzard-sdk';
import { logSuccess, suiClient } from '@interest-protocol/utils';

(async () => {
  const metadata = await suiClient.getCoinMetadata({
    coinType: TYPES.WWAL,
  });

  logSuccess(metadata);
  logSuccess(TYPES.WWAL);
})();
