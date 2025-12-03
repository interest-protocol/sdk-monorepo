import { getEnv } from './utils.script';
import { getUnspentUtxos } from '@interest-protocol/vortex-sdk';
import { VortexKeypair } from '@interest-protocol/vortex-sdk';
import { logSuccess, logError } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

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
