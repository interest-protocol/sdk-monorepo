import { getEnv } from '../utils.script';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { api } = await getEnv();

    const relayer = await api.getRelayer();

    logSuccess('relayer', normalizeSuiAddress(relayer.data.address));
  } catch (error) {
    logError('balance', error);
  }
})();
