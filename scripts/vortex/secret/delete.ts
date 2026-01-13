import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { vortexSdk, keypair, suiClient } = await getEnv();

  const accounts = await vortexSdk.getAllSecretAccounts(keypair.toSuiAddress());

  const account = accounts[0]!;

  const { tx } = vortexSdk.deleteSecretAccount({
    secretAccountObjectId: account.objectId,
  });

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('get-secrets', result);
})();
