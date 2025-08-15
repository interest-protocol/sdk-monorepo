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
  const nexaTreasury = normalizeSuiAddress(Treasuries.NEXA);

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.MEMEZ,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [5_000n, 3_250n, 1_250n, 500n, 25n],
      [5_000n, 3_250n, 1_250n, 500n, 75n],
      // last index is the migration fee bps
      [5_000n, 3_250n, 1_250n, 500n, 500n],
      // Allocations
      [10_000n, 300n],
      // Vesting period
      [0n],
    ],
    recipients: [
      [deadAddress],
      [blastTreasury, giveRepTreasury, memezTreasury, nexaTreasury],
      [blastTreasury, giveRepTreasury, memezTreasury, nexaTreasury],
      [blastTreasury],
    ],
  });

  await executeTx(tx2);
})();
