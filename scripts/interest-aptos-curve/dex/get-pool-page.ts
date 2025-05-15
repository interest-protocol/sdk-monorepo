import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.getPoolPage({ start: 0, pageSize: 10 });

  logSuccess('get-pool-page', data);
})();
