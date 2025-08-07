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
  const blastTreasury = normalizeSuiAddress(Treasuries.BLAST);
  const giveRepTreasury = normalizeSuiAddress(Treasuries.GIVEREP);
  const deadAddress = normalizeSuiAddress('0x0');

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.XPUMP,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [5_000n, 3_500n, 1_500n, 25n],
      [5_000n, 3_500n, 1_500n, 75n],
      // last index is the migration fee bps
      [5_000n, 3_500n, 1_500n, 500n],
      // Allocations
      [10_000n, 500n],
      // Vesting period
      [0n],
    ],
    recipients: [
      [deadAddress],
      [blastTreasury, giveRepTreasury, memezTreasury],
      [blastTreasury, giveRepTreasury, memezTreasury],
      [blastTreasury],
    ],
  });

  await executeTx(tx2);
})();
