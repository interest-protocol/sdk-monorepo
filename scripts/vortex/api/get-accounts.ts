import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { poseidon1 } from '@interest-protocol/vortex-sdk';

(async () => {
  const { api } = await getEnv();

  const secret = poseidon1(123456n);

  const response = await api.getAccounts({
    hashedSecret: secret.toString(),
    excludeHidden: true,
  });

  logSuccess('get-accounts', response);
})();
