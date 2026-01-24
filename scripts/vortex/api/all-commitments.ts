import { getEnv } from '../utils.script';

import { logSuccess, logError } from '@interest-protocol/logger';
import { TEST_SUI_TYPE } from '../test-coins/constants';

(async () => {
  try {
    const { api } = await getEnv();

    const commitments = await api.getAllCommitments({
      coinType: TEST_SUI_TYPE,
      index: 0,
      limit: 1000,
      op: 'gte',
    });

    logSuccess('all-commitments', commitments);
    console.log(commitments.length);
  } catch (error) {
    logError('balance', error);
  }
})();
