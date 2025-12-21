import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { poseidon1 } from '@interest-protocol/vortex-sdk';

(async () => {
  const { api, keypair } = await getEnv();

  const secret = poseidon1(123456n);

  const response = await api.createAccount({
    owner: keypair.toSuiAddress(),
    hashedSecret: secret.toString(),
  });

  logSuccess('create-account', response);
})();
