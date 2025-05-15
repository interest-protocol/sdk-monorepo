import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getFAMetadata(
    WHITELISTED_FAS.MOVE.toString()
  );

  logSuccess('get-fa-payload', data);
})();
