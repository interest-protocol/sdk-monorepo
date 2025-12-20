import { getEnv } from './utils.script';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { logSuccess, logError } from '@interest-protocol/logger';

(async () => {
  try {
    const { keypair, relayerKeypair } = await getEnv();

    logSuccess({
      keypair: keypair.toSuiAddress(),
      relayer: relayerKeypair.toSuiAddress(),
    });
  } catch (error) {
    logError('addresses', error);
  }
})();
