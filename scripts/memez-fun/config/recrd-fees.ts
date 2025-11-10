import { normalizeSuiAddress } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

const RECRD =
  '0xe551156357c05fb323f188087ceb34b723aa82aa464541ac791b8a72594fbd4c';

const IPX =
  '0x5b2aec3521419fe055b6753b15cbad845ec1dca852b75ad0b13b569f2329f82d';

const ONE_MONTH_IN_MILLISECONDS = 2_629_746_000n;

(async () => {
  const { aclSdk, configSdk, executeTx, ownedObjects, configKeys } =
    await getEnv();

  const { tx, authWitness } = aclSdk.signIn({
    admin: ownedObjects.ADMIN,
  });

  const deadAddress = normalizeSuiAddress('0x0');

  const tx2 = configSdk.setFees({
    authWitness,
    tx: tx as any,
    configurationKey: configKeys.RECRD,
    values: [
      // last index is the creator fee nominal
      [10_000, 0n],
      // last index is the swap fee in bps
      [10_000n, 0n, 0n, 0n],
      [5_000n, 2_500n, 2_500n, 100n],
      // last index is the migration fee bps
      [4_000n, 1_000n, 2_500n, 2_500n, 500n],
      // Allocations
      [3_334n, 3_333n, 3_333n, 300n],
      // Vesting period
      [
        ONE_MONTH_IN_MILLISECONDS,
        ONE_MONTH_IN_MILLISECONDS,
        ONE_MONTH_IN_MILLISECONDS,
      ],
    ],
    recipients: [[deadAddress], [RECRD!], [RECRD!, IPX!], [RECRD!]],
  });

  await executeTx(tx2);
})();
