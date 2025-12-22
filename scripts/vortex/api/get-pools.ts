import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { api } = await getEnv();

  const response = await api.getPools();

  logSuccess('get-pools', response);
})();
