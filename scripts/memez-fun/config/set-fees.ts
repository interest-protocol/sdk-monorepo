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
  const xPumpTreasury = normalizeSuiAddress(Treasuries.XPUMP);

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.XPUMP,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [3_000n, 7_000n, 100n],
      [3_000n, 7_000n, 100n],
      // last index is the migration fee bps
      [3_000n, 7_000n, 500n],
      // Allocations
      [10_000n, 0n],
      // Vesting period
      [0n],
    ],
    recipients: [
      [memezTreasury],
      [memezTreasury, xPumpTreasury],
      [memezTreasury, xPumpTreasury],
      [memezTreasury],
    ],
  });

  await executeTx(tx2);
})();
