import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { vortexSdk, keypair } = await getEnv();

  const result = await vortexSdk.getAllSecretAccounts(keypair.toSuiAddress());

  logSuccess('get-secrets', result);
})();
