import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getFarms([FARMS[0]!.address.toString()]);

  logSuccess(data);
})();
