import { getEnv } from '../utils.script';

const STAKE_TYPE =
  '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';

(async () => {
  const { farmsSdk, aclSdk, memezOwnedObjects, executeTx, memezTypes } =
    await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const { decimals, tx: tx2 } = await farmsSdk.getDecimals({
    coinType: STAKE_TYPE,
    isCurrency: false,
    tx: tx as any,
  });

  const { tx: tx3 } = farmsSdk.newFarm({
    tx: tx2 as any,
    stakeCoinType: STAKE_TYPE,
    adminWitnessType: memezTypes.MEMEZ_OTW,
    rewardTypes: [STAKE_TYPE],
    decimals,
    adminWitness: authWitness,
  });

  await executeTx(tx3);
})();
