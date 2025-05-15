import { TYPES } from '../blizzard/constants';
import { log, suiClient } from './utils.script';

(async () => {
  const metadata = await suiClient.getCoinMetadata({
    coinType: TYPES.WWAL,
  });

  log(metadata);
  log(TYPES.WWAL);
})();
