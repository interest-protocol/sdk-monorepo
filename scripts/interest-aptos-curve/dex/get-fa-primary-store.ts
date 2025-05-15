import { logSuccess } from '@interest-protocol/logger';
import { WHITELISTED_FAS } from '@interest-protocol/movement-core-sdk';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getFaPrimaryStore({
    owner: '0x878d2e00feee41f65a239a7811d5326c5a1c210758dccfa23bf121c8a28719b0',
    fa: WHITELISTED_FAS.MOVE.toString(),
  });

  logSuccess('get-fa-primary-store', data);
})();
