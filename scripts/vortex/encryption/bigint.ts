import { getEnv } from '../utils.script';
import { logInfo } from '@interest-protocol/logger';
import invariant from 'tiny-invariant';

(async () => {
  const { VortexKeypair } = await getEnv();

  const joseVortexKeypair = VortexKeypair.generate();

  const randomBigInt = 123456n;

  const encryptedBigInt = VortexKeypair.encryptBigIntFor(
    randomBigInt,
    joseVortexKeypair.encryptionKey
  );

  logInfo('randomBigInt', randomBigInt, '\n');

  logInfo('encryptedBigInt', encryptedBigInt, '\n');

  const decryptedBigInt = joseVortexKeypair.decryptBigInt(encryptedBigInt);

  invariant(decryptedBigInt === randomBigInt, 'bigint mismatch');

  logInfo('decryptedBigInt', decryptedBigInt, '\n');
})();
