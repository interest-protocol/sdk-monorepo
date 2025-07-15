import { Treasuries } from '@interest-protocol/memez-fun-sdk';
import { normalizeSuiAddress } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const memezTreasury = normalizeSuiAddress(Treasuries.MEMEZ);

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.MEMEZ,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [10_000n, 0n],
      [10_000n, 0n],
      // last index is the migration fee bps
      [10_000n, 500n],
      // Allow values
      [10_000n, 0n],
      // Vesting period
      [0n],
    ],
    recipients: [
      [memezTreasury],
      [memezTreasury],
      [memezTreasury],
      [memezTreasury],
    ],
  });

  await executeTx(tx2);
})();
