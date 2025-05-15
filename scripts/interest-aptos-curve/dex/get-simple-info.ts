import { logSuccess } from '@interest-protocol/logger';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = await curveMainnetSDK.get_pools_simple_info({
    start: 0,
    pageSize: 10,
  });

  logSuccess('get-simple-info', data);
})();
