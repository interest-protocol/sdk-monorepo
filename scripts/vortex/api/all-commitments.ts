import { getEnv } from '../utils.script';
import { getUnspentUtxosWithApi } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  try {
    const { api } = await getEnv();

    const commitments = await api.getAllCommitments({
      coinType: SUI_TYPE_ARG,
      index: 0,
      limit: 10,
      op: 'gte',
    });

    logSuccess('all-commitments', commitments);
    console.log(commitments.length);
  } catch (error) {
    logError('balance', error);
  }
})();
