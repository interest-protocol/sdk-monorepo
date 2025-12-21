import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { poseidon1 } from '@interest-protocol/vortex-sdk';

(async () => {
  const { api } = await getEnv();

  const response = await api.getPools();

  logSuccess('get-pools', response);
})();
