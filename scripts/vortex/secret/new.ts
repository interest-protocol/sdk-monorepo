import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

const ENCRYPTED_SECRET =
  '0x40185e0f478c168ac869bc0a8c3e03b18e2c642fbb9bc36897e0f44125cb60924cf6ec222db3f37ea6d049edb91ca9c445934ec87a8c1314cb042a66f1161480cee431f7309f3712b0e559';

(async () => {
  const { vortexSdk, keypair, suiClient } = await getEnv();

  const { tx } = vortexSdk.newSecretAccount({
    encryptedSecret: ENCRYPTED_SECRET,
  });

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('secret-new', result.digest);
})();
